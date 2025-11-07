import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { processAudio, WhisperOptions } from '../services/ai';
import { handleError } from '../utils/errors';
import type { AppBindings as Env } from '../index';
import { log } from '../utils/logger';

const app = new Hono<{ Bindings: Env }>();

// CORS 설정
app.use('/*', cors());

// Whisper 음성 인식 엔드포인트
app.post('/transcribe', async (c) => {
    try {
        const contentType = c.req.header('content-type');
        let audioBuffer: ArrayBuffer;
        let options: WhisperOptions = {};

        console.log('📥 [Whisper Route] 전사 요청 수신', {
            contentType,
            hasAI: !!c.env.AI
        });

        if (contentType?.includes('multipart/form-data')) {
            // FormData로 오디오 파일과 옵션 받기
            const formData = await c.req.formData();
            const audioFile = formData.get('audio') as File | null;

            if (!audioFile) {
                console.error('❌ [Whisper Route] 오디오 파일이 제공되지 않음');
                return c.json({ error: 'No audio file provided' }, 400);
            }

            console.log('📦 [Whisper Route] FormData 파싱 완료', {
                fileName: audioFile.name,
                fileType: audioFile.type,
                fileSize: audioFile.size,
                fileSizeKB: Math.round(audioFile.size / 1024)
            });

            audioBuffer = await audioFile.arrayBuffer();

            // 옵션 파싱
            const task = formData.get('task') as string;
            const language = formData.get('language') as string;
            const vadFilter = formData.get('vad_filter') as string;
            const initialPrompt = formData.get('initial_prompt') as string;
            const prefix = formData.get('prefix') as string;

            options = {
                task: task as 'transcribe' | 'translate' || 'transcribe',
                language: language || 'auto',
                vad_filter: vadFilter === 'true',
                initial_prompt: initialPrompt,
                prefix: prefix
            };

            console.log('⚙️ [Whisper Route] 전사 옵션', options);
        } else if (contentType?.includes('application/json')) {
            // JSON으로 base64 오디오 받기
            const body = await c.req.json<{
                audio: string; // base64
                options?: WhisperOptions;
            }>();

            if (!body.audio) {
                console.error('❌ [Whisper Route] 오디오 데이터가 제공되지 않음');
                return c.json({ error: 'No audio data provided' }, 400);
            }

            // Base64를 ArrayBuffer로 변환
            const binaryString = atob(body.audio);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            audioBuffer = bytes.buffer;
            options = body.options || {};

            console.log('📦 [Whisper Route] JSON base64 파싱 완료', {
                audioSizeKB: Math.round(audioBuffer.byteLength / 1024),
                options
            });
        } else {
            // 직접 바이너리 데이터
            audioBuffer = await c.req.arrayBuffer();
            console.log('📦 [Whisper Route] 바이너리 데이터 수신', {
                audioSizeKB: Math.round(audioBuffer.byteLength / 1024)
            });
        }

        // 파일 크기 확인 (최대 25MB)
        if (audioBuffer.byteLength > 25 * 1024 * 1024) {
            console.error('❌ [Whisper Route] 오디오 파일이 너무 큼', {
                sizeMB: Math.round(audioBuffer.byteLength / (1024 * 1024))
            });
            return c.json({ error: 'Audio file too large. Maximum size is 25MB' }, 400);
        }

        // 빈 오디오 체크
        if (audioBuffer.byteLength === 0) {
            console.error('❌ [Whisper Route] 빈 오디오 데이터');
            return c.json({ error: 'Empty audio data provided' }, 400);
        }

        console.log('🚀 [Whisper Route] AI 처리 시작', {
            audioSizeKB: Math.round(audioBuffer.byteLength / 1024),
            willChunk: audioBuffer.byteLength > 1024 * 1024
        });

        // Whisper 처리
        const result = await processAudio(c.env.AI, audioBuffer, options);

        console.log('✅ [Whisper Route] AI 처리 완료', {
            hasText: !!result.text,
            textLength: result.text?.length,
            wordCount: result.word_count,
            chunks: result.chunks
        });

        // 응답
        return c.json({
            success: true,
            transcription: result.text,
            word_count: result.word_count,
            words: result.words,
            chunks_processed: result.chunks,
            language: options.language || 'auto',
            task: options.task || 'transcribe'
        });

    } catch (error) {
        console.error('❌ [Whisper Route] 전사 실패', {
            error: error instanceof Error ? error.message : String(error),
            errorName: error instanceof Error ? error.name : 'Unknown',
            errorStack: error instanceof Error ? error.stack : undefined
        });
        log.error('Transcription error', error as Error, { component: 'WHISPER_SERVICE' });
        return c.json({
            error: 'Transcription failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
});

// 지원되는 언어 목록
app.get('/languages', (c) => {
    return c.json({
        supported_languages: [
            { code: 'auto', name: 'Auto-detect' },
            { code: 'en', name: 'English' },
            { code: 'zh', name: 'Chinese' },
            { code: 'de', name: 'German' },
            { code: 'es', name: 'Spanish' },
            { code: 'ru', name: 'Russian' },
            { code: 'ko', name: 'Korean' },
            { code: 'fr', name: 'French' },
            { code: 'ja', name: 'Japanese' },
            { code: 'pt', name: 'Portuguese' },
            { code: 'tr', name: 'Turkish' },
            { code: 'pl', name: 'Polish' },
            { code: 'ca', name: 'Catalan' },
            { code: 'nl', name: 'Dutch' },
            { code: 'ar', name: 'Arabic' },
            { code: 'sv', name: 'Swedish' },
            { code: 'it', name: 'Italian' },
            { code: 'id', name: 'Indonesian' },
            { code: 'hi', name: 'Hindi' },
            { code: 'fi', name: 'Finnish' },
            { code: 'vi', name: 'Vietnamese' },
            { code: 'he', name: 'Hebrew' },
            { code: 'uk', name: 'Ukrainian' },
            { code: 'el', name: 'Greek' },
            { code: 'ms', name: 'Malay' },
            { code: 'cs', name: 'Czech' },
            { code: 'ro', name: 'Romanian' },
            { code: 'da', name: 'Danish' },
            { code: 'hu', name: 'Hungarian' },
            { code: 'ta', name: 'Tamil' },
            { code: 'no', name: 'Norwegian' },
            { code: 'th', name: 'Thai' },
            { code: 'ur', name: 'Urdu' },
            { code: 'hr', name: 'Croatian' },
            { code: 'bg', name: 'Bulgarian' },
            { code: 'lt', name: 'Lithuanian' },
            { code: 'la', name: 'Latin' },
            { code: 'mi', name: 'Maori' },
            { code: 'ml', name: 'Malayalam' },
            { code: 'cy', name: 'Welsh' },
            { code: 'sk', name: 'Slovak' },
            { code: 'te', name: 'Telugu' },
            { code: 'fa', name: 'Persian' },
            { code: 'lv', name: 'Latvian' },
            { code: 'bn', name: 'Bengali' },
            { code: 'sr', name: 'Serbian' },
            { code: 'az', name: 'Azerbaijani' },
            { code: 'sl', name: 'Slovenian' },
            { code: 'kn', name: 'Kannada' },
            { code: 'et', name: 'Estonian' },
            { code: 'mk', name: 'Macedonian' },
            { code: 'br', name: 'Breton' },
            { code: 'eu', name: 'Basque' },
            { code: 'is', name: 'Icelandic' },
            { code: 'hy', name: 'Armenian' },
            { code: 'ne', name: 'Nepali' },
            { code: 'mn', name: 'Mongolian' },
            { code: 'bs', name: 'Bosnian' },
            { code: 'kk', name: 'Kazakh' },
            { code: 'sq', name: 'Albanian' },
            { code: 'sw', name: 'Swahili' },
            { code: 'gl', name: 'Galician' },
            { code: 'mr', name: 'Marathi' },
            { code: 'pa', name: 'Punjabi' },
            { code: 'si', name: 'Sinhala' },
            { code: 'km', name: 'Khmer' },
            { code: 'sn', name: 'Shona' },
            { code: 'yo', name: 'Yoruba' },
            { code: 'so', name: 'Somali' },
            { code: 'af', name: 'Afrikaans' },
            { code: 'oc', name: 'Occitan' },
            { code: 'ka', name: 'Georgian' },
            { code: 'be', name: 'Belarusian' },
            { code: 'tg', name: 'Tajik' },
            { code: 'sd', name: 'Sindhi' },
            { code: 'gu', name: 'Gujarati' },
            { code: 'am', name: 'Amharic' },
            { code: 'yi', name: 'Yiddish' },
            { code: 'lo', name: 'Lao' },
            { code: 'uz', name: 'Uzbek' },
            { code: 'fo', name: 'Faroese' },
            { code: 'ht', name: 'Haitian creole' },
            { code: 'ps', name: 'Pashto' },
            { code: 'tk', name: 'Turkmen' },
            { code: 'nn', name: 'Nynorsk' },
            { code: 'mt', name: 'Maltese' },
            { code: 'sa', name: 'Sanskrit' },
            { code: 'lb', name: 'Luxembourgish' },
            { code: 'my', name: 'Myanmar' },
            { code: 'bo', name: 'Tibetan' },
            { code: 'tl', name: 'Tagalog' },
            { code: 'mg', name: 'Malagasy' },
            { code: 'as', name: 'Assamese' },
            { code: 'tt', name: 'Tatar' },
            { code: 'haw', name: 'Hawaiian' },
            { code: 'ln', name: 'Lingala' },
            { code: 'ha', name: 'Hausa' },
            { code: 'ba', name: 'Bashkir' },
            { code: 'jw', name: 'Javanese' },
            { code: 'su', name: 'Sundanese' }
        ]
    });
});

// 모델 정보
app.get('/models', (c) => {
    return c.json({
        available_models: [
            {
                id: '@cf/openai/whisper',
                name: 'Whisper',
                description: 'General-purpose speech recognition model',
                languages: 'Multilingual',
                max_duration: '30 minutes',
                pricing: '$0.00045 per audio minute'
            },
            {
                id: '@cf/openai/whisper-large-v3-turbo',
                name: 'Whisper Large v3 Turbo',
                description: 'Large model optimized for speed and accuracy',
                languages: 'Multilingual',
                max_duration: '30 minutes',
                pricing: '$0.00045 per audio minute',
                recommended: true
            },
            {
                id: '@cf/openai/whisper-tiny-en',
                name: 'Whisper Tiny (English)',
                description: 'Small model for English-only transcription',
                languages: 'English only',
                max_duration: '30 minutes',
                pricing: '$0.00045 per audio minute',
                beta: true
            }
        ]
    });
});

export default app;