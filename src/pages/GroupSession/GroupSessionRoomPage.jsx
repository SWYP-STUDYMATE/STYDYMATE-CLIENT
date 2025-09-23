import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getGroupSessionDetails,
  endGroupSession,
  leaveGroupSession,
  submitSessionFeedback
} from '../../api/groupSession';
import {
  getIcebreakers,
  analyzeConversation,
  generateSessionSummary,
  translateExpression,
  transcribeAudio,
  saveSessionFeedback
} from '../../api/groupSessionAI';
import Header from '../../components/Header';
import { useAlert } from '../../hooks/useAlert';
import { 
  Video, VideoOff, Mic, MicOff, MessageSquare, Users, 
  PhoneOff, Settings, Share, Grid, Maximize2, Volume2,
  VolumeX, Camera, CameraOff, Monitor, Hand, Smile,
  FileText, Clock, Star, ChevronLeft, Send, Bot,
  Lightbulb, Languages, HelpCircle, BrainCircuit
} from 'lucide-react';

export default function GroupSessionRoomPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess, showInfo } = useAlert();
  
  // 비디오/오디오 상태
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  
  // 세션 정보
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // UI 상태
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gridView, setGridView] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  
  // 채팅
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef(null);
  
  // 피드백
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: '',
    hostRating: 0,
    wouldJoinAgain: true
  });
  
  // 세션 시간 추적
  const [sessionDuration, setSessionDuration] = useState(0);
  const [startTime, setStartTime] = useState(null);
  
  // AI 기능 상태
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [icebreakers, setIcebreakers] = useState([]);
  const [conversationFeedback, setConversationFeedback] = useState(null);
  const [sessionTranscript, setSessionTranscript] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [translationInput, setTranslationInput] = useState('');
  const [translationResult, setTranslationResult] = useState(null);
  
  const currentUserId = localStorage.getItem('userId');
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  useEffect(() => {
    loadSessionAndJoin();
    
    // 세션 타이머 시작
    setStartTime(Date.now());
    const timer = setInterval(() => {
      setSessionDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => {
      clearInterval(timer);
      handleCleanup();
    };
  }, [sessionId]);

  const loadSessionAndJoin = async () => {
    try {
      setLoading(true);
      
      // 세션 정보 로드
      const sessionResponse = await getGroupSessionDetails(sessionId);
      const sessionData = sessionResponse.data;
      setSession(sessionData);
      
      // 호스트 여부 확인
      setIsHost(sessionData.hostId === currentUserId);
      
      // 참가자 목록 로드
      setParticipants(sessionData.participants || []);
      
      // WebRTC 초기화 (실제 구현 시)
      initializeWebRTC();
      
      // AI 아이스브레이커 로드
      loadIcebreakers();
      
    } catch (error) {
      console.error('Failed to load session:', error);
      showError('세션 입장에 실패했습니다.');
      navigate('/group-session');
    } finally {
      setLoading(false);
    }
  };
  
  // AI 기능들
  const loadIcebreakers = async () => {
    try {
      const response = await getIcebreakers(
        session?.language || 'English',
        session?.targetLevel || 'Intermediate',
        session?.topic
      );
      if (response.success) {
        setIcebreakers(response.data);
      }
    } catch (error) {
      console.error('Failed to load icebreakers:', error);
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        await processRecording(blob);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      showInfo('녹음을 시작했습니다.');
    } catch (error) {
      console.error('Failed to start recording:', error);
      showError('녹음을 시작할 수 없습니다.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      showInfo('녹음을 종료했습니다.');
    }
  };
  
  const processRecording = async (audioBlob) => {
    try {
      // 음성을 텍스트로 변환
      const transcriptionResponse = await transcribeAudio(audioBlob);
      if (transcriptionResponse.success) {
        const transcript = transcriptionResponse.data.transcript;
        
        // 대화 기록에 추가
        setSessionTranscript(prev => [...prev, {
          userId: currentUserId,
          text: transcript,
          timestamp: new Date().toISOString()
        }]);
        
        // AI 피드백 받기
        const feedbackResponse = await analyzeConversation(
          transcript,
          session?.language || 'English',
          currentUserId
        );
        
        if (feedbackResponse.success) {
          setConversationFeedback(feedbackResponse.data);
          saveSessionFeedback(sessionId, feedbackResponse.data);
        }
      }
    } catch (error) {
      console.error('Failed to process recording:', error);
    }
  };
  
  const handleTranslate = async () => {
    if (!translationInput.trim()) return;
    
    try {
      const response = await translateExpression(
        translationInput,
        session?.language || 'English',
        'Korean'
      );
      
      if (response.success) {
        setTranslationResult(response.data);
      }
    } catch (error) {
      console.error('Translation failed:', error);
      showError('번역에 실패했습니다.');
    }
  };

  const initializeWebRTC = async () => {
    // 실제 WebRTC 구현
    // 여기서는 더미 구현
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled,
        audio: audioEnabled
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Failed to access media devices:', error);
      showError('카메라/마이크 접근에 실패했습니다.');
    }
  };

  const handleCleanup = () => {
    // WebRTC 정리
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
    // WebRTC 비디오 트랙 토글
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const videoTrack = localVideoRef.current.srcObject.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled;
      }
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    // WebRTC 오디오 트랙 토글
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const audioTrack = localVideoRef.current.srcObject.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled;
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
        setScreenSharing(true);
        showSuccess('화면 공유를 시작했습니다.');
      } catch (error) {
        console.error('Screen share failed:', error);
        showError('화면 공유에 실패했습니다.');
      }
    } else {
      setScreenSharing(false);
      showInfo('화면 공유를 종료했습니다.');
    }
  };

  const toggleHandRaise = () => {
    setHandRaised(!handRaised);
    if (!handRaised) {
      showInfo('손을 들었습니다.');
      // WebSocket으로 손들기 알림 전송
    } else {
      showInfo('손을 내렸습니다.');
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now(),
      userId: currentUserId,
      userName: '나',
      content: newMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
    
    // WebSocket으로 메시지 전송
    
    // 스크롤 최하단으로
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleEndSession = async () => {
    if (!confirm('정말 세션을 종료하시겠습니까?')) return;
    
    try {
      // AI 세션 요약 생성
      if (sessionTranscript.length > 0) {
        const transcriptText = sessionTranscript.map(t => t.text).join(' ');
        const duration = Math.floor(sessionDuration / 60);
        
        try {
          const summaryResponse = await generateSessionSummary(
            sessionId,
            transcriptText,
            duration,
            participants.length
          );
          
          if (summaryResponse.success) {
            // 요약을 로컬 스토리지에 저장
            localStorage.setItem(`session_summary_${sessionId}`, JSON.stringify(summaryResponse.data));
          }
        } catch (summaryError) {
          console.error('Failed to generate summary:', summaryError);
        }
      }
      
      if (isHost) {
        await endGroupSession(sessionId);
        showSuccess('세션이 종료되었습니다.');
      } else {
        await leaveGroupSession(sessionId);
        showInfo('세션에서 나갔습니다.');
      }
      
      setShowFeedback(true);
    } catch (error) {
      showError('세션 종료에 실패했습니다.');
      console.error(error);
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      await submitSessionFeedback(sessionId, feedback);
      showSuccess('피드백이 제출되었습니다.');
      navigate('/group-session');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      // 피드백 실패해도 나가기
      navigate('/group-session');
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white">세션 연결 중...</div>
      </div>
    );
  }

  // 피드백 화면
  if (showFeedback) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen max-w-[768px] w-full mx-auto">
        <Header />
        <div className="p-6">
          <h1 className="text-[24px] font-bold text-[#111111] mb-6">세션 피드백</h1>
          
          <div className="bg-white rounded-[10px] p-6 space-y-6">
            <div>
              <p className="text-[16px] font-medium text-[#111111] mb-3">
                세션은 어떠셨나요?
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedback({ ...feedback, rating: star })}
                    className="p-2"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= feedback.rating
                          ? 'fill-[#FFD700] text-[#FFD700]'
                          : 'text-[#E7E7E7]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {isHost === false && (
              <div>
                <p className="text-[16px] font-medium text-[#111111] mb-3">
                  호스트 평가
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedback({ ...feedback, hostRating: star })}
                      className="p-2"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= feedback.hostRating
                            ? 'fill-[#FFD700] text-[#FFD700]'
                            : 'text-[#E7E7E7]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[16px] font-medium text-[#111111] mb-2">
                추가 의견
              </label>
              <textarea
                value={feedback.comment}
                onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                placeholder="세션에 대한 의견을 남겨주세요"
                rows={4}
                className="w-full px-4 py-3 border border-[#E7E7E7] rounded-[6px]
                  focus:border-[#111111] outline-none resize-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={feedback.wouldJoinAgain}
                  onChange={(e) => setFeedback({ ...feedback, wouldJoinAgain: e.target.checked })}
                  className="w-5 h-5 text-[#00C471] rounded"
                />
                <span className="text-[14px] text-[#606060]">
                  다음에도 이 호스트의 세션에 참가하고 싶습니다
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/group-session')}
                className="flex-1 py-3 bg-[#F1F3F5] text-[#606060] rounded-[6px]
                  font-medium hover:bg-[#E7E7E7] transition-colors"
              >
                건너뛰기
              </button>
              <button
                onClick={handleSubmitFeedback}
                className="flex-1 py-3 bg-[#00C471] text-white rounded-[6px]
                  font-medium hover:bg-[#00B267] transition-colors"
              >
                제출하기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 메인 세션 룸
  return (
    <div className="bg-black min-h-screen relative">
      {/* 상단 바 */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/group-session/${sessionId}`)}
              className="p-2 text-white/80 hover:text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-white font-medium">{session?.title}</h1>
              <div className="flex items-center gap-3 text-white/60 text-[14px]">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {participants.length}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(sessionDuration)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGridView(!gridView)}
              className="p-2 text-white/80 hover:text-white"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button className="p-2 text-white/80 hover:text-white">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 비디오 그리드 */}
      <div className="h-screen flex items-center justify-center px-4 py-20">
        <div className={`grid gap-4 w-full max-w-[1440px] ${
          gridView 
            ? participants.length <= 2 
              ? 'grid-cols-1 md:grid-cols-2' 
              : 'grid-cols-2 md:grid-cols-3'
            : 'grid-cols-1'
        }`}>
          {/* 본인 비디오 */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {!videoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <CameraOff className="w-12 h-12 text-gray-500" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-white text-[12px]">
              나 {isHost && '(호스트)'}
            </div>
            {!audioEnabled && (
              <div className="absolute top-2 right-2 p-1 bg-red-500 rounded">
                <MicOff className="w-4 h-4 text-white" />
              </div>
            )}
            {handRaised && (
              <div className="absolute top-2 left-2 p-1 bg-yellow-500 rounded">
                <Hand className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* 다른 참가자 비디오 */}
          {participants.filter(p => p.id !== currentUserId).map((participant) => (
            <div key={participant.id} className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
              <video
                ref={(el) => remoteVideoRefs.current[participant.id] = el}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-white text-[12px]">
                {participant.name} {participant.id === session?.hostId && '(호스트)'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 컨트롤 바 */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-full transition-colors ${
                audioEnabled 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-colors ${
                videoEnabled 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            
            <button
              onClick={toggleScreenShare}
              className={`p-3 rounded-full transition-colors ${
                screenSharing 
                  ? 'bg-[#00C471] text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              <Monitor className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleEndSession}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full
              font-medium transition-colors flex items-center gap-2"
          >
            <PhoneOff className="w-5 h-5" />
            세션 나가기
          </button>

          <div className="flex gap-2">
            <button
              onClick={toggleHandRaise}
              className={`p-3 rounded-full transition-colors ${
                handRaised 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              <Hand className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowChat(!showChat)}
              className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full relative"
            >
              <MessageSquare className="w-5 h-5" />
              {messages.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white 
                  text-[10px] rounded-full flex items-center justify-center">
                  {messages.length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full"
            >
              <Users className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={`p-3 rounded-full transition-colors ${
                showAIPanel 
                  ? 'bg-[#00C471] text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title="AI 도우미"
            >
              <Bot className="w-5 h-5" />
            </button>
            
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-3 rounded-full transition-colors ${
                isRecording 
                  ? 'bg-red-500 animate-pulse text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title={isRecording ? "녹음 중지" : "AI 피드백 녹음"}
            >
              <BrainCircuit className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 채팅 패널 */}
      {showChat && (
        <div className="absolute right-0 top-0 bottom-0 w-[320px] bg-white shadow-xl z-30">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-[#E7E7E7] flex items-center justify-between">
              <h2 className="font-medium text-[#111111]">채팅</h2>
              <button
                onClick={() => setShowChat(false)}
                className="text-[#606060] hover:text-[#111111]"
              >
                ✕
              </button>
            </div>
            
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`${msg.userId === currentUserId ? 'text-right' : ''}`}>
                  <p className="text-[12px] text-[#929292] mb-1">{msg.userName}</p>
                  <div className={`inline-block px-3 py-2 rounded-lg max-w-[80%] ${
                    msg.userId === currentUserId 
                      ? 'bg-[#00C471] text-white' 
                      : 'bg-[#F1F3F5] text-[#111111]'
                  }`}>
                    <p className="text-[14px]">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-[#E7E7E7]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="메시지 입력..."
                  className="flex-1 px-3 py-2 border border-[#E7E7E7] rounded-[6px]
                    focus:border-[#111111] outline-none text-[14px]"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-[#00C471] text-white rounded-[6px] hover:bg-[#00B267]"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 참가자 패널 */}
      {showParticipants && (
        <div className="absolute right-0 top-0 bottom-0 w-[320px] bg-white shadow-xl z-30">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-[#E7E7E7] flex items-center justify-between">
              <h2 className="font-medium text-[#111111]">
                참가자 ({participants.length})
              </h2>
              <button
                onClick={() => setShowParticipants(false)}
                className="text-[#606060] hover:text-[#111111]"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {participants.map((participant) => (
                <div 
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-[#F1F3F5] rounded-[6px]"
                >
                  <div className="flex items-center gap-3">
                    {participant.profileImage ? (
                      <img
                        src={participant.profileImage}
                        alt={participant.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#E7E7E7] 
                        flex items-center justify-center">
                        <Users className="w-4 h-4 text-[#929292]" />
                      </div>
                    )}
                    <div>
                      <p className="text-[14px] font-medium text-[#111111]">
                        {participant.name}
                        {participant.id === currentUserId && ' (나)'}
                      </p>
                      {participant.id === session?.hostId && (
                        <span className="text-[11px] text-[#00C471]">호스트</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {participant.audioMuted && (
                      <MicOff className="w-4 h-4 text-[#929292]" />
                    )}
                    {participant.videoMuted && (
                      <VideoOff className="w-4 h-4 text-[#929292]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI 도우미 패널 */}
      {showAIPanel && (
        <div className="absolute left-0 top-0 bottom-0 w-[380px] bg-white shadow-xl z-30">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-[#E7E7E7] flex items-center justify-between bg-[#00C471]">
              <h2 className="font-medium text-white flex items-center gap-2">
                <Bot className="w-5 h-5" />
                AI 학습 도우미
              </h2>
              <button
                onClick={() => setShowAIPanel(false)}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {/* 아이스브레이커 */}
              <div className="p-4 border-b border-[#E7E7E7]">
                <h3 className="text-[14px] font-medium text-[#111111] mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[#00C471]" />
                  대화 시작하기
                </h3>
                <div className="space-y-2">
                  {icebreakers.length > 0 ? (
                    icebreakers.map((question, index) => (
                      <div
                        key={index}
                        className="p-3 bg-[#F1F3F5] rounded-[6px] text-[13px] text-[#606060]
                          hover:bg-[#E7E7E7] cursor-pointer transition-colors"
                        onClick={() => {
                          setNewMessage(question);
                          setShowChat(true);
                        }}
                      >
                        {question}
                      </div>
                    ))
                  ) : (
                    <p className="text-[12px] text-[#929292]">아이스브레이커 로딩 중...</p>
                  )}
                </div>
              </div>

              {/* 실시간 피드백 */}
              {conversationFeedback && (
                <div className="p-4 border-b border-[#E7E7E7]">
                  <h3 className="text-[14px] font-medium text-[#111111] mb-3 flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-[#00C471]" />
                    AI 피드백
                  </h3>
                  <div className="space-y-2">
                    {conversationFeedback.grammar && (
                      <div className="p-2 bg-blue-50 rounded text-[12px]">
                        <strong>문법:</strong> {conversationFeedback.grammar}
                      </div>
                    )}
                    {conversationFeedback.vocabulary && (
                      <div className="p-2 bg-green-50 rounded text-[12px]">
                        <strong>어휘:</strong> {conversationFeedback.vocabulary}
                      </div>
                    )}
                    {conversationFeedback.pronunciation && (
                      <div className="p-2 bg-yellow-50 rounded text-[12px]">
                        <strong>발음:</strong> {conversationFeedback.pronunciation}
                      </div>
                    )}
                    {conversationFeedback.suggestions && (
                      <div className="p-2 bg-purple-50 rounded text-[12px]">
                        <strong>제안:</strong>
                        <ul className="mt-1 ml-4 list-disc">
                          {conversationFeedback.suggestions.map((suggestion, i) => (
                            <li key={i}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 번역 도구 */}
              <div className="p-4 border-b border-[#E7E7E7]">
                <h3 className="text-[14px] font-medium text-[#111111] mb-3 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-[#00C471]" />
                  실시간 번역
                </h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={translationInput}
                    onChange={(e) => setTranslationInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTranslate()}
                    placeholder="번역할 문장을 입력하세요..."
                    className="w-full px-3 py-2 border border-[#E7E7E7] rounded-[6px]
                      focus:border-[#00C471] outline-none text-[13px]"
                  />
                  <button
                    onClick={handleTranslate}
                    className="w-full py-2 bg-[#00C471] text-white rounded-[6px]
                      text-[13px] font-medium hover:bg-[#00B267] transition-colors"
                  >
                    번역하기
                  </button>
                  {translationResult && (
                    <div className="mt-2 p-3 bg-[#E6F9F1] rounded-[6px] text-[12px]">
                      <p className="font-medium text-[#111111]">{translationResult.translation}</p>
                      {translationResult.literal && (
                        <p className="text-[#606060] mt-1">직역: {translationResult.literal}</p>
                      )}
                      {translationResult.context && (
                        <p className="text-[#929292] mt-1">{translationResult.context}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 대화 기록 */}
              {sessionTranscript.length > 0 && (
                <div className="p-4">
                  <h3 className="text-[14px] font-medium text-[#111111] mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#00C471]" />
                    대화 기록
                  </h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {sessionTranscript.map((entry, index) => (
                      <div key={index} className="p-2 bg-[#F1F3F5] rounded text-[12px]">
                        <p className="text-[#606060]">{entry.text}</p>
                        <p className="text-[#929292] text-[10px] mt-1">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 녹음 상태 표시 */}
            {isRecording && (
              <div className="p-4 bg-red-50 border-t border-red-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[13px] text-red-600 font-medium">
                    녹음 중... AI가 분석 중입니다
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
