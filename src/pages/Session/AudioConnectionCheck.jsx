import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonButton from '../../components/CommonButton';
import { Mic, Volume2, Wifi, CheckCircle, XCircle, Loader2, PlayCircle, Settings } from 'lucide-react';

export default function AudioConnectionCheck() {
  const navigate = useNavigate();
  const [micPermission, setMicPermission] = useState('checking');
  const [speakerTest, setSpeakerTest] = useState('ready'); // ready, playing, success, failed
  const [internetConnection, setInternetConnection] = useState('checking');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [selectedMicrophone, setSelectedMicrophone] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('');
  const [availableDevices, setAvailableDevices] = useState({ microphones: [], speakers: [] });
  
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioElementRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    checkInternetConnection();
    checkMicrophonePermission();
    getAudioDevices();

    return () => {
      // Cleanup
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const allChecked = 
      micPermission === 'granted' && 
      speakerTest === 'success' && 
      internetConnection === 'connected';
    
    setIsReady(allChecked);
  }, [micPermission, speakerTest, internetConnection]);

  const checkInternetConnection = () => {
    setInternetConnection('checking');
    
    if (navigator.onLine) {
      // Simple connectivity check
      fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' })
        .then(() => {
          setInternetConnection('connected');
        })
        .catch(() => {
          setInternetConnection('connected'); // Even if fetch fails, we're online
        });
    } else {
      setInternetConnection('disconnected');
    }

    // Monitor connection changes
    window.addEventListener('online', () => setInternetConnection('connected'));
    window.addEventListener('offline', () => setInternetConnection('disconnected'));
  };

  const getAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const microphones = devices.filter(device => device.kind === 'audioinput');
      const speakers = devices.filter(device => device.kind === 'audiooutput');
      
      setAvailableDevices({ microphones, speakers });
      
      if (microphones.length > 0) {
        setSelectedMicrophone(microphones[0].deviceId);
      }
      if (speakers.length > 0) {
        setSelectedSpeaker(speakers[0].deviceId);
      }
    } catch (error) {
      console.error('Error getting audio devices:', error);
    }
  };

  const checkMicrophonePermission = async () => {
    setMicPermission('checking');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: selectedMicrophone ? { deviceId: selectedMicrophone } : true 
      });
      
      mediaStreamRef.current = stream;
      setMicPermission('granted');
      
      // Start audio level monitoring
      startAudioLevelMonitoring(stream);
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicPermission('denied');
      } else {
        setMicPermission('denied');
      }
    }
  };

  const startAudioLevelMonitoring = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    
    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;
    
    microphone.connect(analyser);
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    
    const checkAudioLevel = () => {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const normalizedLevel = Math.min(100, Math.round(average * 1.5));
      
      setAudioLevel(normalizedLevel);
      animationIdRef.current = requestAnimationFrame(checkAudioLevel);
    };
    
    checkAudioLevel();
  };

  const testSpeaker = async () => {
    setSpeakerTest('playing');
    
    try {
      // Create a simple test tone using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 440; // A4 note
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      
      // Play for 1 second
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
        setSpeakerTest('success');
      }, 1000);
      
    } catch (error) {
      console.error('Speaker test failed:', error);
      setSpeakerTest('failed');
    }
  };

  const handleRetry = () => {
    setSpeakerTest('ready');
    checkInternetConnection();
    checkMicrophonePermission();
  };

  const handleContinue = () => {
    // Navigate to the actual call page
    navigate('/session/call');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'checking':
      case 'playing':
        return <Loader2 className="w-5 h-5 text-[#929292] animate-spin" />;
      case 'granted':
      case 'connected':
      case 'success':
        return <CheckCircle className="w-5 h-5 text-[#00C471]" />;
      case 'denied':
      case 'disconnected':
      case 'failed':
        return <XCircle className="w-5 h-5 text-[#EA4335]" />;
      default:
        return null;
    }
  };

  const getStatusText = (type, status) => {
    if (type === 'microphone') {
      switch (status) {
        case 'checking': return '확인 중...';
        case 'granted': return '권한 허용됨';
        case 'denied': return '권한 거부됨';
        default: return '확인 필요';
      }
    } else if (type === 'speaker') {
      switch (status) {
        case 'ready': return '테스트 대기';
        case 'playing': return '재생 중...';
        case 'success': return '정상 작동';
        case 'failed': return '테스트 실패';
        default: return '확인 필요';
      }
    } else if (type === 'internet') {
      switch (status) {
        case 'checking': return '확인 중...';
        case 'connected': return '연결됨';
        case 'disconnected': return '연결 안됨';
        default: return '확인 필요';
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E7E7E7] px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-[18px] font-bold text-[#111111]">음성 통화 연결 확인</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-[24px] font-bold text-[#111111] mb-2">
            통화 환경을 확인하고 있어요
          </h2>
          <p className="text-[16px] text-[#606060]">
            원활한 통화를 위해 아래 항목들을 체크해주세요
          </p>
        </div>

        {/* Check Items */}
        <div className="space-y-4 mb-8">
          {/* Microphone Check */}
          <div className="bg-white rounded-[12px] p-6 border border-[#E7E7E7]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#E6F9F1] rounded-full flex items-center justify-center mr-4">
                  <Mic className="w-6 h-6 text-[#00C471]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-medium text-[#111111]">마이크</h3>
                  <p className="text-[14px] text-[#606060]">
                    {getStatusText('microphone', micPermission)}
                  </p>
                </div>
              </div>
              {getStatusIcon(micPermission)}
            </div>
            
            {/* Audio Level Indicator */}
            {micPermission === 'granted' && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-[#929292]">마이크 입력 레벨</span>
                  <span className="text-[12px] text-[#929292]">{audioLevel}%</span>
                </div>
                <div className="w-full h-2 bg-[#E7E7E7] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#00C471] transition-all duration-100"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Speaker Check */}
          <div className="bg-white rounded-[12px] p-6 border border-[#E7E7E7]">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="w-12 h-12 bg-[#E6F9F1] rounded-full flex items-center justify-center mr-4">
                  <Volume2 className="w-6 h-6 text-[#00C471]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[16px] font-medium text-[#111111]">스피커</h3>
                  <p className="text-[14px] text-[#606060]">
                    {getStatusText('speaker', speakerTest)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {speakerTest === 'ready' && (
                  <button
                    onClick={testSpeaker}
                    className="px-4 py-2 bg-[#00C471] text-white rounded-lg text-sm font-medium hover:bg-[#00A05C] transition-colors"
                  >
                    테스트
                  </button>
                )}
                {getStatusIcon(speakerTest)}
              </div>
            </div>
          </div>

          {/* Internet Connection */}
          <div className="bg-white rounded-[12px] p-6 border border-[#E7E7E7]">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#E6F9F1] rounded-full flex items-center justify-center mr-4">
                  <Wifi className="w-6 h-6 text-[#00C471]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-medium text-[#111111]">인터넷 연결</h3>
                  <p className="text-[14px] text-[#606060]">
                    {getStatusText('internet', internetConnection)}
                  </p>
                </div>
              </div>
              {getStatusIcon(internetConnection)}
            </div>
          </div>
        </div>

        {/* Device Selection */}
        <div className="bg-[#F5F5F5] rounded-[12px] p-4 mb-8">
          <div className="flex items-center mb-3">
            <Settings className="w-4 h-4 text-[#606060] mr-2" />
            <span className="text-[14px] font-medium text-[#606060]">디바이스 설정</span>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-[12px] text-[#929292] block mb-1">마이크</label>
              <select 
                value={selectedMicrophone}
                onChange={(e) => setSelectedMicrophone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E7E7E7] rounded-lg text-[14px]"
              >
                {availableDevices.microphones.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `마이크 ${device.deviceId.slice(0, 5)}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-[12px] text-[#929292] block mb-1">스피커</label>
              <select 
                value={selectedSpeaker}
                onChange={(e) => setSelectedSpeaker(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E7E7E7] rounded-lg text-[14px]"
                disabled={!('setSinkId' in HTMLMediaElement.prototype)}
              >
                {availableDevices.speakers.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `스피커 ${device.deviceId.slice(0, 5)}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isReady && (
            <CommonButton
              onClick={handleRetry}
              variant="secondary"
              className="w-full"
            >
              다시 확인
            </CommonButton>
          )}
          
          <CommonButton
            onClick={handleContinue}
            variant="primary"
            disabled={!isReady}
            className="w-full"
          >
            통화 시작하기
          </CommonButton>
        </div>
      </div>
    </div>
  );
}