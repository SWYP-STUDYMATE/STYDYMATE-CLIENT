// WebRTC Recording Utility using MediaRecorder API
import { webrtcAPI } from '../api/webrtc.js';

export class WebRTCRecorder {
  constructor(roomId, userId, options = {}) {
    this.roomId = roomId;
    this.userId = userId;
    this.options = {
      mimeType: 'video/webm;codecs=vp9,opus',
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 1000000,
      timeslice: 5000, // 5초마다 청크 저장
      ...options
    };
    
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.startTime = null;
    this.websocket = null;
  }

  /**
   * WebSocket 연결 설정
   * @param {WebSocket} ws - WebSocket connection
   */
  setWebSocket(ws) {
    this.websocket = ws;
  }

  /**
   * 녹화 시작
   * @param {MediaStream} stream - 녹화할 미디어 스트림
   * @returns {Promise<void>}
   */
  async startRecording(stream) {
    if (this.isRecording) {
      throw new Error('Recording is already in progress');
    }

    // MediaRecorder 지원 확인
    if (!MediaRecorder.isTypeSupported(this.options.mimeType)) {
      // 대체 포맷 시도
      const fallbackTypes = [
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4'
      ];
      
      for (const type of fallbackTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          this.options.mimeType = type;
          break;
        }
      }
    }

    try {
      this.mediaRecorder = new MediaRecorder(stream, this.options);
      this.recordedChunks = [];
      this.startTime = Date.now();

      // 이벤트 리스너 설정
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
          // 청크가 생성될 때마다 자동 업로드
          this.handleDataAvailable(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.handleRecordingStop();
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        this.stopRecording();
      };

      // 녹화 시작
      this.mediaRecorder.start(this.options.timeslice);
      this.isRecording = true;

      // WebSocket으로 녹화 시작 알림
      if (this.websocket) {
        this.websocket.send(JSON.stringify({
          type: 'start-recording',
          data: {
            timestamp: new Date().toISOString(),
            mimeType: this.options.mimeType
          }
        }));
      }

      console.log('Recording started');
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * 녹화 중지
   * @returns {Promise<Blob>} 녹화된 파일
   */
  async stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) {
      throw new Error('No recording in progress');
    }

    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { 
          type: this.options.mimeType 
        });
        
        this.isRecording = false;
        console.log('Recording stopped, blob size:', blob.size);
        
        // WebSocket으로 녹화 중지 알림
        if (this.websocket) {
          this.websocket.send(JSON.stringify({
            type: 'stop-recording',
            data: {
              timestamp: new Date().toISOString(),
              duration: this.getRecordingDuration()
            }
          }));
        }
        
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * 데이터 청크 처리 (자동 업로드)
   * @param {Blob} chunk - 녹화 데이터 청크
   */
  async handleDataAvailable(chunk) {
    if (chunk.size === 0) return;

    try {
      const timestamp = Date.now();
      const filename = `recording-${this.roomId}-${timestamp}.webm`;
      
      // File 객체 생성
      const file = new File([chunk], filename, {
        type: this.options.mimeType
      });

      // 서버에 업로드
      const uploadResult = await webrtcAPI.uploadRecording(
        this.roomId,
        this.userId,
        file,
        filename,
        this.getRecordingDuration()
      );

      console.log('Chunk uploaded:', uploadResult);

      // WebSocket으로 업로드 완료 알림
      if (this.websocket) {
        this.websocket.send(JSON.stringify({
          type: 'recording-chunk',
          data: {
            filename: uploadResult.data.uploadedTo,
            originalFilename: filename,
            size: chunk.size,
            duration: this.getRecordingDuration()
          }
        }));
      }

    } catch (error) {
      console.error('Failed to upload recording chunk:', error);
    }
  }

  /**
   * 녹화 완료 처리
   */
  async handleRecordingStop() {
    const duration = this.getRecordingDuration();
    console.log(`Recording completed. Duration: ${duration} seconds`);
    
    // 최종 파일 생성 및 업로드
    if (this.recordedChunks.length > 0) {
      const finalBlob = new Blob(this.recordedChunks, { 
        type: this.options.mimeType 
      });
      
      const timestamp = Date.now();
      const filename = `final-recording-${this.roomId}-${timestamp}.webm`;
      
      try {
        const file = new File([finalBlob], filename, {
          type: this.options.mimeType
        });

        const uploadResult = await webrtcAPI.uploadRecording(
          this.roomId,
          this.userId,
          file,
          filename,
          duration
        );

        console.log('Final recording uploaded:', uploadResult);
        
      } catch (error) {
        console.error('Failed to upload final recording:', error);
      }
    }
  }

  /**
   * 현재 녹화 시간 계산 (초)
   * @returns {number} 녹화 시간
   */
  getRecordingDuration() {
    if (!this.startTime) return 0;
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * 녹화 상태 확인
   * @returns {boolean} 녹화 중인지 여부
   */
  isRecordingActive() {
    return this.isRecording;
  }

  /**
   * 리소스 정리
   */
  cleanup() {
    if (this.mediaRecorder && this.isRecording) {
      this.stopRecording();
    }
    
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.startTime = null;
  }
}

// 브라우저 지원 확인 유틸리티
export const WebRTCRecorderUtils = {
  /**
   * MediaRecorder API 지원 확인
   * @returns {boolean} 지원 여부
   */
  isSupported() {
    return typeof MediaRecorder !== 'undefined';
  },

  /**
   * 지원되는 MIME 타입 확인
   * @returns {string[]} 지원되는 MIME 타입 목록
   */
  getSupportedMimeTypes() {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4;codecs=h264,aac',
      'video/mp4',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4'
    ];

    return types.filter(type => MediaRecorder.isTypeSupported(type));
  },

  /**
   * 권장 녹화 설정 반환
   * @param {string} quality - 'low' | 'medium' | 'high'
   * @returns {Object} 녹화 설정
   */
  getRecommendedSettings(quality = 'medium') {
    const settings = {
      low: {
        audioBitsPerSecond: 64000,
        videoBitsPerSecond: 500000,
        timeslice: 10000 // 10초
      },
      medium: {
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 1000000,
        timeslice: 5000 // 5초
      },
      high: {
        audioBitsPerSecond: 192000,
        videoBitsPerSecond: 2500000,
        timeslice: 3000 // 3초
      }
    };

    return settings[quality] || settings.medium;
  }
};

export default WebRTCRecorder;