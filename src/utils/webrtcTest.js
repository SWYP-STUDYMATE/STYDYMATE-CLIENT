// WebRTC Testing Utilities
import { webrtcManager } from '../services/webrtc';
import { log } from './logger';

/**
 * Test WebRTC functionality
 */
export class WebRTCTester {
  constructor() {
    this.testResults = {};
  }

  /**
   * Run all WebRTC tests
   * @returns {Promise<Object>} Test results
   */
  async runAllTests() {
    console.group('🔬 WebRTC Functionality Tests');
    
    try {
      await this.testMediaDevices();
      await this.testWebRTCSupport();
      await this.testSTUNServers();
      
      log.info('WebRTC 테스트 완료', this.testResults, 'WEBRTC_TEST');
      
    } catch (error) {
      log.error('WebRTC 테스트 실패', error, 'WEBRTC_TEST');
    }
    
    console.groupEnd();
    return this.testResults;
  }

  /**
   * Test media devices availability
   */
  async testMediaDevices() {
    console.group('📹 Media Devices Test');
    
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported');
      }

      // Test camera access
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: false 
        });
        videoStream.getTracks().forEach(track => track.stop());
        this.testResults.camera = { available: true, error: null };
        console.log('✅ Camera access: OK');
      } catch (error) {
        this.testResults.camera = { available: false, error: error.message };
        console.warn('⚠️ Camera access: Failed -', error.message);
      }

      // Test microphone access
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ 
          video: false, 
          audio: true 
        });
        audioStream.getTracks().forEach(track => track.stop());
        this.testResults.microphone = { available: true, error: null };
        console.log('✅ Microphone access: OK');
      } catch (error) {
        this.testResults.microphone = { available: false, error: error.message };
        console.warn('⚠️ Microphone access: Failed -', error.message);
      }

      // List available devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        
        this.testResults.devices = {
          videoInputs: videoInputs.length,
          audioInputs: audioInputs.length,
          total: devices.length
        };
        
        console.log(`📱 Devices found: ${videoInputs.length} cameras, ${audioInputs.length} microphones`);
      } catch (error) {
        this.testResults.devices = { error: error.message };
        console.warn('⚠️ Device enumeration failed:', error.message);
      }

    } catch (error) {
      this.testResults.mediaDevices = { error: error.message };
      console.error('❌ Media devices test failed:', error);
    }
    
    console.groupEnd();
  }

  /**
   * Test WebRTC API support
   */
  async testWebRTCSupport() {
    console.group('🌐 WebRTC Support Test');
    
    try {
      // Check RTCPeerConnection support
      if (!window.RTCPeerConnection) {
        throw new Error('RTCPeerConnection not supported');
      }
      
      // Test peer connection creation
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      this.testResults.rtcPeerConnection = { 
        available: true, 
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState
      };
      
      pc.close();
      console.log('✅ RTCPeerConnection: OK');
      
      // Check WebSocket support
      if (!window.WebSocket) {
        throw new Error('WebSocket not supported');
      }
      
      this.testResults.webSocket = { available: true };
      console.log('✅ WebSocket: OK');
      
      // Check other WebRTC APIs
      this.testResults.webrtcAPIs = {
        RTCSessionDescription: !!window.RTCSessionDescription,
        RTCIceCandidate: !!window.RTCIceCandidate,
        MediaRecorder: !!window.MediaRecorder,
        pictureInPictureEnabled: !!document.pictureInPictureEnabled
      };
      
      console.log('🔧 WebRTC APIs:', this.testResults.webrtcAPIs);
      
    } catch (error) {
      this.testResults.webrtcSupport = { error: error.message };
      console.error('❌ WebRTC support test failed:', error);
    }
    
    console.groupEnd();
  }

  /**
   * Test STUN servers connectivity
   */
  async testSTUNServers() {
    console.group('🔗 STUN Servers Test');
    
    const stunServers = [
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302'
    ];
    
    this.testResults.stunServers = {};
    
    for (const stunUrl of stunServers) {
      try {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: stunUrl }]
        });
        
        // Create a dummy data channel to trigger ICE gathering
        pc.createDataChannel('test');
        
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        // Wait for ICE candidates
        const iceGatheringResult = await new Promise((resolve) => {
          const timeout = setTimeout(() => resolve('timeout'), 5000);
          let candidateReceived = false;
          
          pc.onicecandidate = (event) => {
            if (event.candidate && !candidateReceived) {
              candidateReceived = true;
              clearTimeout(timeout);
              resolve('success');
            }
          };
          
          pc.onicegatheringstatechange = () => {
            if (pc.iceGatheringState === 'complete' && !candidateReceived) {
              clearTimeout(timeout);
              resolve('no-candidates');
            }
          };
        });
        
        this.testResults.stunServers[stunUrl] = {
          status: iceGatheringResult,
          available: iceGatheringResult === 'success'
        };
        
        pc.close();
        
        if (iceGatheringResult === 'success') {
          console.log(`✅ ${stunUrl}: OK`);
        } else {
          console.warn(`⚠️ ${stunUrl}: ${iceGatheringResult}`);
        }
        
      } catch (error) {
        this.testResults.stunServers[stunUrl] = {
          status: 'error',
          error: error.message,
          available: false
        };
        console.error(`❌ ${stunUrl}: Failed -`, error.message);
      }
    }
    
    console.groupEnd();
  }

  /**
   * Test WebRTC manager functionality
   */
  async testWebRTCManager() {
    console.group('⚙️ WebRTC Manager Test');
    
    try {
      // Test media initialization
      await webrtcManager.initializeMedia({
        audio: true,
        video: false // Audio only for testing
      });
      
      this.testResults.webrtcManager = {
        mediaInitialization: true,
        localStreamAvailable: !!webrtcManager.localStream
      };
      
      console.log('✅ WebRTC Manager: Media initialization OK');
      
      // Clean up
      webrtcManager.cleanup();
      
    } catch (error) {
      this.testResults.webrtcManager = {
        error: error.message,
        available: false
      };
      console.error('❌ WebRTC Manager test failed:', error);
    }
    
    console.groupEnd();
  }

  /**
   * Generate test report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      browser: navigator.userAgent,
      results: this.testResults,
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0
      }
    };

    // Calculate summary
    const countTests = (obj, prefix = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        if (value && typeof value === 'object') {
          if ('available' in value || 'error' in value) {
            report.summary.totalTests++;
            if (value.available !== false && !value.error) {
              report.summary.passedTests++;
            } else {
              report.summary.failedTests++;
            }
          } else {
            countTests(value, `${prefix}${key}.`);
          }
        }
      });
    };

    countTests(this.testResults);

    console.group('📋 WebRTC Test Report');
    console.log('🌐 Browser:', navigator.userAgent);
    console.log('📊 Test Summary:', report.summary);
    console.log('📝 Detailed Results:', this.testResults);
    console.groupEnd();

    return report;
  }
}

/**
 * Quick WebRTC compatibility check
 * @returns {Promise<boolean>} Whether WebRTC is supported
 */
export async function quickCompatibilityCheck() {
  try {
    // Check basic WebRTC support
    if (!window.RTCPeerConnection || !navigator.mediaDevices) {
      return false;
    }

    // Try to access media devices
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: true, 
      video: false 
    });
    
    stream.getTracks().forEach(track => track.stop());
    
    return true;
  } catch (error) {
    log.warn('WebRTC 호환성 검사 실패', error, 'WEBRTC_TEST');
    return false;
  }
}

/**
 * Run WebRTC diagnostics
 */
export async function runDiagnostics() {
  const tester = new WebRTCTester();
  await tester.runAllTests();
  return tester.generateReport();
}

export default WebRTCTester;