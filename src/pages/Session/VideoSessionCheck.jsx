import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonButton from '../../components/CommonButton';
import { 
  Camera, CameraOff, Mic, MicOff, Volume2, 
  Wifi, WifiOff, CheckCircle, XCircle, 
  Loader2, Monitor, Settings 
} from 'lucide-react';

export default function VideoSessionCheck() {
  const navigate = useNavigate();
  const [cameraStatus, setCameraStatus] = useState('idle'); // idle, testing, success, failed
  const [micStatus, setMicStatus] = useState('idle');
  const [speakerStatus, setSpeakerStatus] = useState('idle');
  const [connectionStatus, setConnectionStatus] = useState('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [connectionSpeed, setConnectionSpeed] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedMic, setSelectedMic] = useState('');
  const [cameras, setCameras] = useState([]);
  const [microphones, setMicrophones] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    // 디바이스 목록 가져오기
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      setCameras(videoDevices);
      setMicrophones(audioDevices);
      
      if (videoDevices.length > 0) setSelectedCamera(videoDevices[0].deviceId);
      if (audioDevices.length > 0) setSelectedMic(audioDevices[0].deviceId);
    });

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

  // 카메라 테스트
  const testCamera = async () => {
    setCameraStatus('testing');
    
    try {
      // 기존 스트림 정리
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setCameraStatus('success');
      
    } catch (error) {
      console.error('Camera test failed:', error);
      setCameraStatus('failed');
    }
  };

  // 마이크 테스트
  const testMicrophone = async () => {
    setMicStatus('testing');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          deviceId: selectedMic ? { exact: selectedMic } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      // 오디오 시각화 설정
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      visualizeAudio();
      
      // 3초 후 성공으로 표시
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        setAudioLevel(0);
        setMicStatus('success');
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
      
      // 테스트 톤 생성
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 440; // A4 음
      gainNode.gain.value = 0.3;
      
      oscillator.start();
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
      const startTime = Date.now();
      const response = await fetch('https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png', {
        cache: 'no-cache'
      });
      
      const data = await response.blob();
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      const sizeInMB = data.size / (1024 * 1024);
      const speedMbps = (sizeInMB * 8) / duration;
      
      setConnectionSpeed(speedMbps);
      
      if (speedMbps >= 2) { // 화상통화는 더 높은 속도 필요
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
    await testCamera();
    setTimeout(() => testMicrophone(), 1000);
    setTimeout(() => testSpeaker(), 4500);
    setTimeout(() => testConnection(), 5500);
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

  const allTestsPassed = cameraStatus === 'success' && 
                         micStatus === 'success' && 
                         speakerStatus === 'success' && 
                         connectionStatus === 'success';

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <div className="max-w-[1024px] w-full mx-auto flex flex-col min-h-screen">
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
            <h1 className="text-[18px] font-bold text-[#111111]">화상 세션 연결 확인</h1>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-[#606060]" />
            </button>
          </div>
        </div>

        {/* 디바이스 설정 드롭다운 */}
        {showSettings && (
          <div className="bg-white border-b border-[#E7E7E7] px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[14px] text-[#606060] mb-2">카메라 선택</label>
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="w-full px-4 py-2 border border-[#E7E7E7] rounded-lg focus:outline-none focus:border-[#4285F4]"
                >
                  {cameras.map(camera => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `카메라 ${camera.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[14px] text-[#606060] mb-2">마이크 선택</label>
                <select
                  value={selectedMic}
                  onChange={(e) => setSelectedMic(e.target.value)}
                  className="w-full px-4 py-2 border border-[#E7E7E7] rounded-lg focus:outline-none focus:border-[#4285F4]"
                >
                  {microphones.map(mic => (
                    <option key={mic.deviceId} value={mic.deviceId}>
                      {mic.label || `마이크 ${mic.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 메인 콘텐츠 */}
        <div className="flex-1 px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 왼쪽: 비디오 미리보기 */}
            <div>
              <h2 className="text-[20px] font-bold text-[#111111] mb-4">카메라 미리보기</h2>
              <div className="relative aspect-video bg-black rounded-[10px] overflow-hidden">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                {cameraStatus === 'idle' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#111111]/80">
                    <div className="text-center">
                      <CameraOff className="w-12 h-12 text-white mb-2 mx-auto" />
                      <p className="text-white">카메라를 시작하려면 테스트를 실행하세요</p>
                    </div>
                  </div>
                )}
                {cameraStatus === 'failed' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#EA4335]/90">
                    <div className="text-center">
                      <CameraOff className="w-12 h-12 text-white mb-2 mx-auto" />
                      <p className="text-white">카메라를 사용할 수 없습니다</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 오른쪽: 테스트 항목들 */}
            <div>
              <h2 className="text-[20px] font-bold text-[#111111] mb-4">연결 테스트</h2>
              <div className="space-y-4">
                {/* 카메라 테스트 */}
                <div className="bg-white rounded-[10px] p-4 border border-[#E7E7E7]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#FFE6E6] rounded-full flex items-center justify-center mr-3">
                        <Camera className="w-5 h-5 text-[#EA4335]" />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-medium text-[#111111]">카메라</h3>
                        <p className="text-[12px] text-[#929292]">
                          {cameraStatus === 'idle' && '대기 중'}
                          {cameraStatus === 'testing' && '테스트 중...'}
                          {cameraStatus === 'success' && '정상 작동'}
                          {cameraStatus === 'failed' && '사용 불가'}
                        </p>
                      </div>
                    </div>
                    {getStatusIcon(cameraStatus)}
                  </div>
                </div>

                {/* 마이크 테스트 */}
                <div className="bg-white rounded-[10px] p-4 border border-[#E7E7E7]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#E6F9F1] rounded-full flex items-center justify-center mr-3">
                        <Mic className="w-5 h-5 text-[#00C471]" />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-medium text-[#111111]">마이크</h3>
                        <p className="text-[12px] text-[#929292]">
                          {micStatus === 'idle' && '대기 중'}
                          {micStatus === 'testing' && '3초간 말씀해주세요...'}
                          {micStatus === 'success' && '정상 작동'}
                          {micStatus === 'failed' && '사용 불가'}
                        </p>
                      </div>
                    </div>
                    {getStatusIcon(micStatus)}
                  </div>
                  
                  {/* 오디오 레벨 표시 */}
                  {micStatus === 'testing' && (
                    <div className="mt-3">
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
                <div className="bg-white rounded-[10px] p-4 border border-[#E7E7E7]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#E8F4FD] rounded-full flex items-center justify-center mr-3">
                        <Volume2 className="w-5 h-5 text-[#4285F4]" />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-medium text-[#111111]">스피커</h3>
                        <p className="text-[12px] text-[#929292]">
                          {speakerStatus === 'idle' && '대기 중'}
                          {speakerStatus === 'testing' && '테스트 음 재생 중...'}
                          {speakerStatus === 'success' && '정상 작동'}
                          {speakerStatus === 'failed' && '사용 불가'}
                        </p>
                      </div>
                    </div>
                    {getStatusIcon(speakerStatus)}
                  </div>
                </div>

                {/* 연결 테스트 */}
                <div className="bg-white rounded-[10px] p-4 border border-[#E7E7E7]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#FFF5E6] rounded-full flex items-center justify-center mr-3">
                        {connectionStatus === 'failed' ? 
                          <WifiOff className="w-5 h-5 text-[#FFA500]" /> : 
                          <Wifi className="w-5 h-5 text-[#FFA500]" />
                        }
                      </div>
                      <div>
                        <h3 className="text-[14px] font-medium text-[#111111]">인터넷</h3>
                        <p className="text-[12px] text-[#929292]">
                          {connectionStatus === 'idle' && '대기 중'}
                          {connectionStatus === 'testing' && '속도 측정 중...'}
                          {connectionStatus === 'success' && `${connectionSpeed?.toFixed(1)} Mbps`}
                          {connectionStatus === 'failed' && '속도 부족'}
                        </p>
                      </div>
                    </div>
                    {getStatusIcon(connectionStatus)}
                  </div>
                </div>
              </div>

              {/* 안내 메시지 */}
              <div className="mt-6 p-4 bg-[#F8F9FA] rounded-[10px]">
                <p className="text-[13px] text-[#606060]">
                  💡 화상 통화를 위해서는 최소 2Mbps 이상의 인터넷 속도가 필요합니다.
                  모든 테스트를 통과해야 원활한 화상 통화가 가능합니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="px-6 pb-8">
          <div className="max-w-md mx-auto">
            {cameraStatus === 'idle' && micStatus === 'idle' && 
             speakerStatus === 'idle' && connectionStatus === 'idle' ? (
              <CommonButton
                onClick={runAllTests}
                className="w-full"
                variant="primary"
              >
                <Monitor className="w-5 h-5 mr-2" />
                전체 테스트 시작
              </CommonButton>
            ) : allTestsPassed ? (
              <CommonButton
                onClick={() => navigate('/session/video-room')}
                className="w-full"
                variant="success"
              >
                화상 세션 시작하기
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
                {(cameraStatus === 'testing' || micStatus === 'testing' || 
                  speakerStatus === 'testing' || connectionStatus === 'testing') && (
                  <p className="text-center text-[14px] text-[#929292]">
                    테스트 진행 중... 잠시만 기다려주세요
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}