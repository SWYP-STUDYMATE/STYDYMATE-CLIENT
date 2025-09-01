import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VideoControls from '../../components/VideoControls';
import { Phone, PhoneIncoming, PhoneOutgoing, Clock, Signal, SignalLow, Loader2, MessageSquare, Languages } from 'lucide-react';
import { webrtcManager } from '../../services/webrtc';
import { log } from '../../utils/logger';
import CommonButton from '../../components/CommonButton';
import TranslatedSubtitles from '../../components/TranslatedSubtitles';
import RealtimeSubtitles from '../../components/RealtimeSubtitles';
import RealtimeSubtitlePanel from '../../components/RealtimeSubtitlePanel';

export default function AudioSessionRoom() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [connectionState, setConnectionState] = useState('new');
  const [callDuration, setCallDuration] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState('ko');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [participants, setParticipants] = useState(new Map());
  const [connectionStats, setConnectionStats] = useState({});
  const [error, setError] = useState('');
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [translationEnabled, setTranslationEnabled] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());

  const intervalRef = useRef(null);
  const statsIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const localAudioRef = useRef(null);
  const remoteAudiosRef = useRef(new Map());

  // Initialize audio session
  useEffect(() => {
    initializeAudioSession();

    return () => {
      cleanup();
    };
  }, [roomId]);

  // Initialize audio session
  const initializeAudioSession = async () => {
    try {
      setConnectionState('connecting');
      log.info('음성 세션 초기화 시작', { roomId }, 'AUDIO_SESSION');

      // Setup WebRTC manager callbacks
      setupWebRTCCallbacks();

      // Initialize audio-only media
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      };

      // Initialize media and connect to room
      await webrtcManager.initializeMedia(constraints);
      
      const userId = localStorage.getItem('userId') || 'guest-' + Date.now();
      const userName = localStorage.getItem('userName') || 'Anonymous';
      
      await webrtcManager.connect(roomId, { userId, userName }, {
        autoReconnect: true,
        connectionTimeout: 15000
      });

    } catch (error) {
      log.error('음성 세션 초기화 실패', error, 'AUDIO_SESSION');
      setConnectionState('failed');
      setError(error.message || '연결 실패');
    }
  };

  // Setup WebRTC manager callbacks
  const setupWebRTCCallbacks = () => {
    // Local stream callback
    webrtcManager.on('onLocalStream', (stream) => {
      log.info('로컬 오디오 스트림 수신', null, 'AUDIO_SESSION');
      setLocalStream(stream);
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }
    });

    // Remote stream callback
    webrtcManager.on('onRemoteStream', (userId, stream) => {
      log.info('원격 오디오 스트림 수신', { userId }, 'AUDIO_SESSION');
      
      // Update remote streams state
      setRemoteStreams(prev => new Map(prev).set(userId, stream));
      
      let audioElement = remoteAudiosRef.current.get(userId);
      if (!audioElement) {
        audioElement = document.createElement('audio');
        audioElement.autoplay = true;
        audioElement.playsInline = true;
        audioElement.id = `remote-audio-${userId}`;
        document.body.appendChild(audioElement);
        remoteAudiosRef.current.set(userId, audioElement);
      }
      
      audioElement.srcObject = stream;
    });

    // Remote stream removed callback
    webrtcManager.on('onRemoteStreamRemoved', (userId, stream) => {
      log.info('원격 오디오 스트림 제거', { userId }, 'AUDIO_SESSION');
      
      // Update remote streams state
      setRemoteStreams(prev => {
        const updated = new Map(prev);
        updated.delete(userId);
        return updated;
      });
      
      const audioElement = remoteAudiosRef.current.get(userId);
      if (audioElement) {
        audioElement.srcObject = null;
        if (audioElement.parentNode) {
          audioElement.parentNode.removeChild(audioElement);
        }
        remoteAudiosRef.current.delete(userId);
      }

      // Update participants
      setParticipants(prev => {
        const updated = new Map(prev);
        updated.delete(userId);
        return updated;
      });
    });

    // Participant joined callback
    webrtcManager.on('onParticipantJoined', (participant) => {
      log.info('참가자 입장', participant, 'AUDIO_SESSION');
      setParticipants(prev => new Map(prev).set(participant.userId, participant));
    });

    // Participant left callback
    webrtcManager.on('onParticipantLeft', (participant) => {
      log.info('참가자 퇴장', participant, 'AUDIO_SESSION');
      setParticipants(prev => {
        const updated = new Map(prev);
        updated.delete(participant.userId);
        return updated;
      });
    });

    // Connection state change callback
    webrtcManager.on('onConnectionStateChange', (state) => {
      log.info('연결 상태 변경', { state }, 'AUDIO_SESSION');
      setConnectionState(state);
      
      if (state === 'connected') {
        setError('');
        startCallTimer();
        startStatsMonitoring();
        webrtcManager.startConnectionMonitoring();
      } else if (state === 'disconnected' || state === 'failed') {
        stopCallTimer();
        stopStatsMonitoring();
        webrtcManager.stopConnectionMonitoring();
        if (state === 'failed') {
          setError('연결이 끊어졌습니다');
        }
      } else if (state === 'reconnecting') {
        setError('연결을 복구하는 중입니다...');
      }
    });

    // Error callback
    webrtcManager.on('onError', (message, error) => {
      log.error('WebRTC 오류', { message, error }, 'AUDIO_SESSION');
      setConnectionState('failed');
      setError(message || '연결 오류가 발생했습니다');
    });
  };

  // Call timer management
  const startCallTimer = () => {
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setCallDuration(elapsed);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Statistics monitoring functions
  const startStatsMonitoring = () => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }

    statsIntervalRef.current = setInterval(async () => {
      try {
        const stats = await webrtcManager.getConnectionStats();
        setConnectionStats(stats);
      } catch (error) {
        log.error('통계 수집 실패', error, 'AUDIO_SESSION');
      }
    }, 3000); // Update stats every 3 seconds
  };

  const stopStatsMonitoring = () => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
  };

  // Cleanup function
  const cleanup = async () => {
    log.info('음성 세션 정리 시작', null, 'AUDIO_SESSION');

    // Stop timers and monitoring
    stopCallTimer();
    stopStatsMonitoring();

    // Clean up remote audio elements
    remoteAudiosRef.current.forEach((audio) => {
      if (audio.srcObject) {
        audio.srcObject = null;
      }
      if (audio.parentNode) {
        audio.parentNode.removeChild(audio);
      }
    });
    remoteAudiosRef.current.clear();

    // Disconnect WebRTC manager
    try {
      await webrtcManager.disconnect();
      log.info('WebRTC 연결 정리 완료', null, 'AUDIO_SESSION');
    } catch (error) {
      log.error('WebRTC 연결 정리 실패', error, 'AUDIO_SESSION');
    }

    // Clear callbacks
    webrtcManager.off('onLocalStream');
    webrtcManager.off('onRemoteStream');
    webrtcManager.off('onRemoteStreamRemoved');
    webrtcManager.off('onParticipantJoined');
    webrtcManager.off('onParticipantLeft');
    webrtcManager.off('onConnectionStateChange');
    webrtcManager.off('onError');
  };

  // Control handlers
  const handleToggleAudio = () => {
    const newAudioState = !isAudioEnabled;
    setIsAudioEnabled(newAudioState);
    webrtcManager.toggleAudio(newAudioState);
    log.info('오디오 토글', { enabled: newAudioState }, 'AUDIO_SESSION');
  };

  const handleEndCall = async () => {
    log.info('음성 통화 종료', null, 'AUDIO_SESSION');
    await cleanup();
    navigate('/sessions');
  };

  const handleToggleLanguage = () => {
    const languages = ['ko', 'en', 'ja', 'zh', 'es'];
    const currentIndex = languages.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % languages.length;
    const newLang = languages[nextIndex];
    
    setCurrentLanguage(newLang);
    
    // Notify participants about language change
    webrtcManager.sendChatMessage(JSON.stringify({
      type: 'language-change',
      language: newLang
    }));
    
    log.info('언어 전환', { from: currentLanguage, to: newLang }, 'AUDIO_SESSION');
  };

  const handleToggleSubtitles = () => {
    const newState = !subtitlesEnabled;
    setSubtitlesEnabled(newState);
    log.info('자막 토글', { enabled: newState }, 'AUDIO_SESSION');
  };

  const handleToggleTranslation = () => {
    const newState = !translationEnabled;
    setTranslationEnabled(newState);
    log.info('번역 토글', { enabled: newState }, 'AUDIO_SESSION');
  };

  // Utility functions
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionIcon = () => {
    // Calculate connection quality based on stats
    const stats = connectionStats.detailedStats;
    if (!stats || Object.keys(stats).length === 0) {
      return <Signal className="w-4 h-4 text-[var(--black-200)]" />;
    }

    let avgRtt = 0;
    let avgPacketLoss = 0;
    let statCount = 0;

    Object.values(stats).forEach(peerStats => {
      if (peerStats.rtt) {
        avgRtt += peerStats.rtt;
        statCount++;
      }
      if (peerStats.audioPacketsLost && peerStats.audioPacketsReceived) {
        const lossRate = (peerStats.audioPacketsLost / peerStats.audioPacketsReceived) * 100;
        avgPacketLoss += lossRate;
      }
    });

    if (statCount > 0) {
      avgRtt = avgRtt / statCount;
      avgPacketLoss = avgPacketLoss / statCount;

      if (avgRtt < 100 && avgPacketLoss < 2) {
        return <Signal className="w-4 h-4 text-[var(--green-500)]" />;
      } else if (avgRtt < 200 && avgPacketLoss < 5) {
        return <Signal className="w-4 h-4 text-[var(--warning-yellow)]" />;
      } else {
        return <SignalLow className="w-4 h-4 text-[var(--red)]" />;
      }
    }

    return <Signal className="w-4 h-4 text-[var(--black-200)]" />;
  };

  const getConnectionText = () => {
    const stats = connectionStats.detailedStats;
    if (!stats || Object.keys(stats).length === 0) {
      return '연결 확인 중';
    }

    let avgRtt = 0;
    let statCount = 0;

    Object.values(stats).forEach(peerStats => {
      if (peerStats.rtt) {
        avgRtt += peerStats.rtt;
        statCount++;
      }
    });

    if (statCount > 0) {
      avgRtt = Math.round(avgRtt / statCount);
      return `${avgRtt}ms`;
    }

    return '연결 확인 중';
  };

  const getLanguageName = (code) => {
    const languageNames = {
      'ko': '한국어',
      'en': 'English',
      'ja': '日本語',
      'zh': '中文',
      'es': 'Español'
    };
    return languageNames[code] || code;
  };

  return (
    <div className="min-h-screen bg-[var(--black-600)] flex flex-col">
      {/* 헤더 */}
      <div className="bg-[var(--black-700)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-white text-[18px] font-medium">음성 세션</h1>
            {connectionState === 'connected' && (
              <div className="flex items-center gap-4 text-[var(--black-200)] text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(callDuration)}</span>
                </div>
                <div className="flex items-center gap-1">
                  {getConnectionIcon()}
                  <span>{getConnectionText()}</span>
                </div>
                <div className="text-sm text-[var(--black-50)]">
                  참가자: {participants.size + 1}명
                </div>
              </div>
            )}
          </div>

          {/* 자막 및 언어 컨트롤 */}
          <div className="flex items-center gap-4">
            {/* 자막 토글 */}
            <button
              onClick={handleToggleSubtitles}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                subtitlesEnabled 
                  ? 'bg-[var(--green-500)] text-white' 
                  : 'bg-[var(--black-600)] text-[var(--black-200)] hover:bg-[var(--black-500)]'
              }`}
              title={subtitlesEnabled ? '자막 끄기' : '자막 켜기'}
            >
              <MessageSquare className="w-4 h-4" />
              <span>자막</span>
            </button>

            {/* 번역 토글 */}
            {subtitlesEnabled && (
              <button
                onClick={handleToggleTranslation}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  translationEnabled 
                    ? 'bg-[var(--green-500)] text-white' 
                    : 'bg-[var(--black-600)] text-[var(--black-200)] hover:bg-[var(--black-500)]'
                }`}
                title={translationEnabled ? '번역 끄기' : '번역 켜기'}
              >
                <Languages className="w-4 h-4" />
                <span>번역</span>
              </button>
            )}

            <div className="w-px h-6 bg-[var(--black-500)]" />

            {/* 현재 언어 표시 */}
            <div className="flex items-center gap-2">
              <span className="text-[var(--black-200)] text-sm">현재 언어:</span>
              <span className="text-white text-sm font-medium">
                {getLanguageName(currentLanguage)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          {/* 연결 상태 표시 */}
          <div className="text-center mb-12">
            {connectionState === 'new' && (
              <div className="text-[#606060]">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                <p className="text-lg">연결 준비 중...</p>
              </div>
            )}

            {connectionState === 'connecting' && (
              <div className="text-[var(--blue)]">
                <PhoneOutgoing className="w-16 h-16 animate-pulse mx-auto mb-4" />
                <p className="text-xl font-medium">상대방과 연결 중입니다...</p>
              </div>
            )}

            {connectionState === 'connected' && (
              <div>
                <div className="relative inline-block mb-6">
                  <div className="w-48 h-48 rounded-full bg-[var(--black-700)] flex items-center justify-center">
                    <Phone className="w-24 h-24 text-[var(--green-500)]" />
                  </div>
                  <div className="absolute inset-0 rounded-full">
                    <div className="absolute inset-0 rounded-full border-4 border-[var(--green-500)] animate-ping" />
                    <div className="absolute inset-0 rounded-full border-4 border-[var(--green-500)]" />
                  </div>
                </div>

                <h2 className="text-white text-[28px] font-bold mb-4">통화 연결됨</h2>
                <p className="text-[var(--green-500)] text-lg mb-2">
                  {participants.size}명의 참가자와 통화 중
                </p>

                {/* 통화 품질 정보 */}
                {connectionStats.detailedStats && Object.keys(connectionStats.detailedStats).length > 0 && (
                  <div className="flex items-center justify-center gap-6 mt-6 text-sm text-[var(--black-200)]">
                    {Object.values(connectionStats.detailedStats).map((peerStats, index) => (
                      <div key={index} className="flex items-center gap-4">
                        {peerStats.rtt && <div>지연시간: {Math.round(peerStats.rtt)}ms</div>}
                        {peerStats.audioPacketsLost && peerStats.audioPacketsReceived && (
                          <div>패킷 손실: {((peerStats.audioPacketsLost / peerStats.audioPacketsReceived) * 100).toFixed(1)}%</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {connectionState === 'disconnected' && (
              <div className="text-[var(--red)]">
                <Phone className="w-16 h-16 mx-auto mb-4" />
                <p className="text-xl font-medium">통화가 종료되었습니다</p>
              </div>
            )}

            {connectionState === 'failed' && (
              <div className="text-[var(--red)]">
                <Phone className="w-16 h-16 mx-auto mb-4" />
                <p className="text-xl font-medium">연결 실패</p>
                <p className="text-sm mt-2">네트워크 상태를 확인해주세요</p>
              </div>
            )}
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-[rgba(var(--red-rgb),0.1)] border border-[var(--red)] rounded-lg p-4 mb-8 text-center">
              <p className="text-[var(--red)]">{error}</p>
            </div>
          )}

          {/* 음성 웨이브 시각화 (연결됨 상태에서만) */}
          {connectionState === 'connected' && (
            <div className="bg-[var(--black-700)] rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center h-24">
                <div className="flex items-center gap-1">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 bg-[var(--green-500)] rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 60 + 20}px`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '1.5s'
                      }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-center text-[var(--black-200)] text-sm mt-4">
                음성 통화 진행 중...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 컨트롤 바 */}
      <div className="bg-[var(--black-600)] p-6">
        <div className="max-w-4xl mx-auto">
          <VideoControls
            isMuted={!isAudioEnabled}
            onToggleMute={handleToggleAudio}
            onEndCall={handleEndCall}
            onToggleLanguage={handleToggleLanguage}
            currentLanguage={currentLanguage}
            showVideo={false}
            showScreenShare={false}
            showLanguageToggle={true}
            showFullscreen={false}
            showSettings={false}
            showParticipants={false}
            variant="dark"
          />
        </div>
      </div>

      {/* 자막 오버레이 */}
      {subtitlesEnabled && connectionState === 'connected' && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <TranslatedSubtitles
            localStream={localStream}
            remoteStream={remoteStreams.size > 0 ? Array.from(remoteStreams.values())[0] : null}
            sourceLanguage="auto"
            defaultTargetLanguage={currentLanguage}
            showOriginal={true}
            showTranslation={translationEnabled}
            position="bottom"
          />
        </div>
      )}

      {/* 실시간 자막 패널 */}
      <div className="fixed top-4 right-4 w-96 z-50 pointer-events-auto">
        <RealtimeSubtitlePanel
          localStream={localStream}
          remoteStream={remoteStreams.size > 0 ? Array.from(remoteStreams.values())[0] : null}
        />
      </div>

      {/* 숨겨진 오디오 요소 (로컬 스트림용) */}
      <audio ref={localAudioRef} muted autoPlay style={{ display: 'none' }} />
    </div>
  );
}