import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonButton from '../../components/CommonButton';
import { Mic, MicOff, Volume2, Wifi, WifiOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function AudioSessionCheck() {
  const navigate = useNavigate();
  const [micStatus, setMicStatus] = useState('idle'); // idle, testing, success, failed
  const [speakerStatus, setSpeakerStatus] = useState('idle');
  const [connectionStatus, setConnectionStatus] = useState('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [connectionSpeed, setConnectionSpeed] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // 오디오 레벨 시각화
  const visualizeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(Math.min(average / 128, 1));

    animationRef.current = requestAnimationFrame(visualizeAudio);
  };

  // 마이크 테스트
  const testMicrophone = async () => {
    setMicStatus('testing');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;

      // 오디오 시각화 설정
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // MediaRecorder 설정
      const options = {
        mimeType: 'audio/webm;codecs=opus'
      };
      
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/webm';
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        setIsRecording(false);
        
        // 자동 재생으로 마이크 테스트 완료
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.play().then(() => {
          setMicStatus('success');
        }).catch(() => {
          setMicStatus('failed');
        });
      };

      // 3초간 녹음
      mediaRecorderRef.current.start();
      setIsRecording(true);
      visualizeAudio();
      
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          stream.getTracks().forEach(track => track.stop());
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
        }
      }, 3000);
      
    } catch (error) {
      console.error('Microphone test failed:', error);
      setMicStatus('failed');
    }
  };

  // 스피커 테스트
  const testSpeaker = async () => {
    setSpeakerStatus('testing');
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // 테스트 톤 생성 (440Hz, 0.5초)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 440; // A4 음
      gainNode.gain.value = 0.3; // 볼륨 30%
      
      oscillator.start();
      
      // 페이드 아웃
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      setTimeout(() => {
        oscillator.stop();
        setSpeakerStatus('success');
      }, 500);
      
    } catch (error) {
      console.error('Speaker test failed:', error);
      setSpeakerStatus('failed');
    }
  };

  // 연결 테스트
  const testConnection = async () => {
    setConnectionStatus('testing');
    
    try {
      // 간단한 속도 테스트 (실제로는 더 정교한 방법 필요)
      const startTime = Date.now();
      
      // 1MB 정도의 더미 데이터 다운로드
      const response = await fetch('https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png', {
        cache: 'no-cache'
      });
      
      const data = await response.blob();
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // 초 단위
      const sizeInMB = data.size / (1024 * 1024);
      const speedMbps = (sizeInMB * 8) / duration;
      
      setConnectionSpeed(speedMbps);
      
      // 최소 1Mbps 이상이면 성공
      if (speedMbps >= 1) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('failed');
      }
      
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('failed');
    }
  };

  // 전체 테스트 실행
  const runAllTests = async () => {
    await testMicrophone();
    setTimeout(() => testSpeaker(), 4000);
    setTimeout(() => testConnection(), 5000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'idle':
        return null;
      case 'testing':
        return <Loader2 className="w-5 h-5 animate-spin text-[#4285F4]" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-[#00C471]" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-[#EA4335]" />;
      default:
        return null;
    }
  };

  const allTestsPassed = micStatus === 'success' && 
                         speakerStatus === 'success' && 
                         connectionStatus === 'success';

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <div className="max-w-[768px] w-full mx-auto flex flex-col min-h-screen">
        {/* 헤더 */}
        <div className="px-6 py-4 bg-white border-b border-[#E7E7E7]">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="text-[18px] font-bold text-[#111111]">음성 세션 연결 확인</h1>
            <div className="w-10" />
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 px-6 py-8">
          <div className="text-center mb-8">
            <h2 className="text-[24px] font-bold text-[#111111] mb-2">
              세션 시작 전 확인사항
            </h2>
            <p className="text-[16px] text-[#606060]">
              원활한 음성 통화를 위해 디바이스를 테스트합니다
            </p>
          </div>

          {/* 테스트 항목들 */}
          <div className="space-y-4 mb-8">
            {/* 마이크 테스트 */}
            <div className="bg-white rounded-[10px] p-6 border border-[#E7E7E7]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#E6F9F1] rounded-full flex items-center justify-center mr-4">
                    {isRecording ? <Mic className="w-6 h-6 text-[#00C471]" /> : <MicOff className="w-6 h-6 text-[#00C471]" />}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-medium text-[#111111]">마이크 테스트</h3>
                    <p className="text-[14px] text-[#929292]">
                      {micStatus === 'idle' && '테스트를 시작하세요'}
                      {micStatus === 'testing' && '3초간 말씀해주세요...'}
                      {micStatus === 'success' && '정상 작동'}
                      {micStatus === 'failed' && '마이크를 확인하세요'}
                    </p>
                  </div>
                </div>
                {getStatusIcon(micStatus)}
              </div>
              
              {/* 오디오 레벨 표시 */}
              {isRecording && (
                <div className="mt-4">
                  <div className="h-2 bg-[#E7E7E7] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#00C471] transition-all duration-100"
                      style={{ width: `${audioLevel * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 스피커 테스트 */}
            <div className="bg-white rounded-[10px] p-6 border border-[#E7E7E7]">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#E8F4FD] rounded-full flex items-center justify-center mr-4">
                    <Volume2 className="w-6 h-6 text-[#4285F4]" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-medium text-[#111111]">스피커 테스트</h3>
                    <p className="text-[14px] text-[#929292]">
                      {speakerStatus === 'idle' && '테스트를 시작하세요'}
                      {speakerStatus === 'testing' && '테스트 음이 재생됩니다...'}
                      {speakerStatus === 'success' && '정상 작동'}
                      {speakerStatus === 'failed' && '스피커를 확인하세요'}
                    </p>
                  </div>
                </div>
                {getStatusIcon(speakerStatus)}
              </div>
            </div>

            {/* 연결 테스트 */}
            <div className="bg-white rounded-[10px] p-6 border border-[#E7E7E7]">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#FFF5E6] rounded-full flex items-center justify-center mr-4">
                    {connectionStatus === 'failed' ? 
                      <WifiOff className="w-6 h-6 text-[#FFA500]" /> : 
                      <Wifi className="w-6 h-6 text-[#FFA500]" />
                    }
                  </div>
                  <div>
                    <h3 className="text-[16px] font-medium text-[#111111]">인터넷 연결</h3>
                    <p className="text-[14px] text-[#929292]">
                      {connectionStatus === 'idle' && '테스트를 시작하세요'}
                      {connectionStatus === 'testing' && '연결 속도 측정 중...'}
                      {connectionStatus === 'success' && `연결 양호 (${connectionSpeed?.toFixed(1)} Mbps)`}
                      {connectionStatus === 'failed' && '연결이 불안정합니다'}
                    </p>
                  </div>
                </div>
                {getStatusIcon(connectionStatus)}
              </div>
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="bg-[#F8F9FA] rounded-[10px] p-4 mb-8">
            <p className="text-[14px] text-[#606060]">
              💡 모든 테스트를 통과해야 원활한 음성 통화가 가능합니다.
              문제가 있다면 디바이스 설정을 확인해주세요.
            </p>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="px-6 pb-8">
          {micStatus === 'idle' && speakerStatus === 'idle' && connectionStatus === 'idle' ? (
            <CommonButton
              onClick={runAllTests}
              className="w-full"
              variant="primary"
            >
              전체 테스트 시작
            </CommonButton>
          ) : allTestsPassed ? (
            <CommonButton
              onClick={() => navigate('/session/audio-room')}
              className="w-full"
              variant="success"
            >
              세션 시작하기
            </CommonButton>
          ) : (
            <div className="space-y-3">
              <CommonButton
                onClick={runAllTests}
                className="w-full"
                variant="secondary"
              >
                다시 테스트
              </CommonButton>
              {(micStatus === 'testing' || speakerStatus === 'testing' || connectionStatus === 'testing') && (
                <p className="text-center text-[14px] text-[#929292]">
                  테스트 진행 중...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}