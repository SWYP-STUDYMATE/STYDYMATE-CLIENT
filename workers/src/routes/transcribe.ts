import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../index';
import { processAudio, translateToMultipleLanguages } from '../services/ai';
import { validateAuth } from '../utils/auth';
import { log } from '../utils/logger';

const app = new Hono<{ Bindings: Env }>();

// WebSocket 스트리밍 전사
app.get('/stream', async (c) => {
    // WebSocket 업그레이드 확인
    const upgradeHeader = c.req.header('upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
        return c.json({ error: 'Expected WebSocket' }, 426);
    }

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    // WebSocket 핸들러
    server.accept();
    handleWebSocket(server, c.env);

    return new Response(null, {
        status: 101,
        webSocket: client,
    });
});

// WebSocket 메시지 핸들러
async function handleWebSocket(ws: WebSocket, env: Env) {
    let config = {
        language: 'en',
        model: 'whisper-large-v3-turbo',
        task: 'transcribe' as 'transcribe' | 'translate',
        enableTranslation: false,
        targetLanguages: [] as string[]
    };

    // 오디오 버퍼
    const audioBuffer: ArrayBuffer[] = [];
    let isProcessing = false;
    let sessionActive = true;

    ws.addEventListener('message', async (event) => {
        try {
            // 설정 메시지 처리
            if (typeof event.data === 'string') {
                const message = JSON.parse(event.data);

                if (message.type === 'config') {
                    config = { ...config, ...message };
                    ws.send(JSON.stringify({
                        type: 'config_updated',
                        config
                    }));
                } else if (message.type === 'end_session') {
                    sessionActive = false;
                    ws.close();
                }
            }
            // 오디오 데이터 처리
            else if (event.data instanceof ArrayBuffer) {
                audioBuffer.push(event.data);

                // 버퍼가 충분히 쌓이면 처리 (약 1초 분량)
                const totalSize = audioBuffer.reduce((sum, buf) => sum + buf.byteLength, 0);
                const targetSize = 16000 * 2; // 16kHz * 2 bytes per sample * 1 second

                if (totalSize >= targetSize && !isProcessing) {
                    isProcessing = true;

                    // 버퍼 합치기
                    const combinedBuffer = new ArrayBuffer(totalSize);
                    const view = new Uint8Array(combinedBuffer);
                    let offset = 0;

                    for (const buffer of audioBuffer) {
                        view.set(new Uint8Array(buffer), offset);
                        offset += buffer.byteLength;
                    }

                    // 버퍼 비우기
                    audioBuffer.length = 0;

                    // Whisper로 전사
                    try {
                        const transcription = await processAudio(env.AI, combinedBuffer, {
                            task: config.task,
                            language: config.language,
                            vad_filter: true
                        } as any);

                        // 결과 전송
                        if (transcription.text && transcription.text.trim()) {
                            const transcribedText = transcription.text.trim();

                            // 번역이 활성화되어 있고 대상 언어가 있는 경우
                            let translations: Record<string, string> = {};
                            if (config.enableTranslation && config.targetLanguages.length > 0) {
                                try {
                                    translations = await translateToMultipleLanguages(
                                        env.AI,
                                        transcribedText,
                                        config.targetLanguages,
                                        (transcription as any).language || 'auto'
                                    );
                                } catch (error) {
                                    log.error('Translation error', error as Error, { component: 'TRANSCRIBE_SERVICE' });
                                }
                            }

                            ws.send(JSON.stringify({
                                type: 'transcription',
                                text: transcribedText,
                                language: (transcription as any).language,
                                words: (transcription as any).words,
                                translations,
                                is_final: true,
                                timestamp: Date.now(),
                                confidence: (transcription as any).confidence || 0.95
                            }));
                        }
                    } catch (error) {
                        log.error('Transcription error', error as Error, { component: 'TRANSCRIBE_SERVICE' });
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Transcription failed'
                        }));
                    }

                    isProcessing = false;
                }
            }
        } catch (error) {
            log.error('WebSocket error', error as Error, { component: 'TRANSCRIBE_SERVICE' });
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Processing error'
            }));
        }
    });

    ws.addEventListener('close', () => {
        sessionActive = false;
        audioBuffer.length = 0;
    });

    // 핑/퐁 유지
    const pingInterval = setInterval(() => {
        if (sessionActive && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
        } else {
            clearInterval(pingInterval);
        }
    }, 30000);
}

// 일반 파일 전사 (기존 엔드포인트)
const transcribeSchema = z.object({
    audio_url: z.string().url().optional(),
    audio_base64: z.string().optional(),
    language: z.string().optional(),
    task: z.enum(['transcribe', 'translate']).optional(),
    word_timestamps: z.boolean().optional()
});

app.post('/', validateAuth, async (c) => {
    try {
        const body = await c.req.json();
        const { audio_url, audio_base64, language, task, word_timestamps } = transcribeSchema.parse(body);

        let audioBuffer: ArrayBuffer;

        if (audio_url) {
            // URL에서 오디오 다운로드
            const response = await fetch(audio_url);
            if (!response.ok) {
                return c.json({ error: 'Failed to fetch audio' }, 400);
            }
            audioBuffer = await response.arrayBuffer();
        } else if (audio_base64) {
            // Base64 디코딩
            const binaryString = atob(audio_base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            audioBuffer = bytes.buffer;
        } else {
            return c.json({ error: 'No audio provided' }, 400);
        }

        // Whisper로 전사
        const result = await processAudio(c.env.AI, audioBuffer, {
            task: task || 'transcribe',
            language: language || 'auto',
            vad_filter: true
        } as any);

        return c.json({
            success: true,
            transcription: result
        });
    } catch (error) {
        log.error('Transcription error', error as Error, { component: 'TRANSCRIBE_SERVICE' });
        return c.json({
            error: 'Transcription failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
});

export { app as transcribeRoutes };
export default app;