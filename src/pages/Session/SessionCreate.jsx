import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Mic,
  Users,
  Clock,
  Globe,
  Settings,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import CommonButton from '../../components/CommonButton';
import { webrtcAPI } from '../../api/webrtc';
import { log } from '../../utils/logger';

export default function SessionCreate() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [createdRoom, setCreatedRoom] = useState(null);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mediaPermissions, setMediaPermissions] = useState({
    audio: null,
    video: null,
    checked: false
  });

  // 임시 시간 상태 (확인 전)
  const [tempStartTime, setTempStartTime] = useState('');
  const [tempEndTime, setTempEndTime] = useState('');

  // 세션 설정
  const [sessionConfig, setSessionConfig] = useState({
    roomType: 'audio', // 'audio' | 'video'
    maxParticipants: 2,
    title: '',
    description: '',
    language: 'ko', // 기본 언어
    isPrivate: false,
    allowRecording: true,
    autoTranscription: false,
    scheduledStartTime: '', // 세션 시작 시간
    scheduledEndTime: '' // 세션 종료 시간
  });

  // 시간을 30분 단위로 반올림하는 함수
  const roundTo30Minutes = (dateTimeString) => {
    if (!dateTimeString) return '';
    
    const date = new Date(dateTimeString);
    const minutes = date.getMinutes();
    const roundedMinutes = Math.round(minutes / 30) * 30;
    
    date.setMinutes(roundedMinutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    
    // 만약 60분이 되면 시간을 올림
    if (date.getMinutes() === 60) {
      date.setMinutes(0);
      date.setHours(date.getHours() + 1);
    }
    
    // datetime-local 형식으로 변환
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${mins}`;
  };

  // 현재 시간을 30분 단위로 반올림한 ISO 형식으로 반환
  const getRoundedCurrentTime = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 30) * 30;
    const roundedTime = new Date(now);
    roundedTime.setMinutes(roundedMinutes);
    roundedTime.setSeconds(0);
    roundedTime.setMilliseconds(0);
    
    // 만약 60분이 되면 시간을 올림
    if (roundedTime.getMinutes() === 60) {
      roundedTime.setMinutes(0);
      roundedTime.setHours(roundedTime.getHours() + 1);
    }
    
    // ISO 형식을 datetime-local 형식으로 변환 (YYYY-MM-DDTHH:mm)
    const year = roundedTime.getFullYear();
    const month = String(roundedTime.getMonth() + 1).padStart(2, '0');
    const day = String(roundedTime.getDate()).padStart(2, '0');
    const hours = String(roundedTime.getHours()).padStart(2, '0');
    const mins = String(roundedTime.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${mins}`;
  };

  // 시작 시간을 기반으로 종료 시간의 최소값 계산
  const getMinEndTime = () => {
    const startTime = tempStartTime || sessionConfig.scheduledStartTime;
    if (!startTime) {
      return getRoundedCurrentTime();
    }
    
    const startDate = new Date(startTime);
    // 시작 시간에 30분 추가
    startDate.setMinutes(startDate.getMinutes() + 30);
    
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    const hours = String(startDate.getHours()).padStart(2, '0');
    const mins = String(startDate.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${mins}`;
  };

  // 시작 시간을 기반으로 종료 시간의 최대값 계산 (2시간)
  const getMaxEndTime = () => {
    const startTime = tempStartTime || sessionConfig.scheduledStartTime;
    if (!startTime) {
      return '';
    }
    
    const startDate = new Date(startTime);
    // 시작 시간에 2시간 추가
    startDate.setHours(startDate.getHours() + 2);
    
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    const hours = String(startDate.getHours()).padStart(2, '0');
    const mins = String(startDate.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${mins}`;
  };

  // 시간 선택 확인 버튼 핸들러
  const handleConfirmTime = () => {
    // 시작 시간이 없으면 기존 설정된 시간 사용
    const startTimeToUse = tempStartTime || sessionConfig.scheduledStartTime;
    
    if (!startTimeToUse) {
      setError('시작 시간을 선택해주세요.');
      return;
    }

    // 시작 시간을 30분 단위로 반올림
    const roundedStartTime = roundTo30Minutes(startTimeToUse);
    
    // 시작 시간이 현재 시간보다 이전인지 확인
    const startDate = new Date(roundedStartTime);
    const now = new Date();
    if (startDate <= now) {
      setError('시작 시간은 현재 시간 이후로 선택해주세요.');
      return;
    }

    // 종료 시간이 선택된 경우
    const endTimeToUse = tempEndTime || sessionConfig.scheduledEndTime;
    if (endTimeToUse) {
      const roundedEndTime = roundTo30Minutes(endTimeToUse);
      const endDate = new Date(roundedEndTime);
      
      // 종료 시간이 시작 시간보다 이전인지 확인
      if (endDate <= startDate) {
        setError('종료 시간은 시작 시간보다 30분 이상 이후로 선택해주세요.');
        return;
      }

      // 최소 30분 이상인지 확인
      const duration = endDate.getTime() - startDate.getTime();
      if (duration < 30 * 60 * 1000) {
        setError('세션은 최소 30분 이상이어야 합니다.');
        return;
      }

      // 최대 2시간(120분) 이하인지 확인
      if (duration > 120 * 60 * 1000) {
        setError('세션은 최대 2시간까지만 가능합니다.');
        return;
      }

      setSessionConfig(prev => ({
        ...prev,
        scheduledStartTime: roundedStartTime,
        scheduledEndTime: roundedEndTime
      }));
    } else {
      // 종료 시간이 선택되지 않은 경우 시작 시간만 저장
      setSessionConfig(prev => ({
        ...prev,
        scheduledStartTime: roundedStartTime,
        scheduledEndTime: ''
      }));
    }

    // 임시 상태 초기화
    setTempStartTime('');
    setTempEndTime('');
    setError('');
  };

  // 시간 선택 취소 버튼 핸들러
  const handleCancelTime = () => {
    setTempStartTime('');
    setTempEndTime('');
    setError('');
  };

  // 컴포넌트 마운트 시 권한 확인
  useEffect(() => {
    checkMediaPermissions();
  }, []);

  // 선택한 세션 타입에 따라 권한 상태 표시용으로만 사용
  const checkMediaPermissions = async () => {
    try {
      // Permissions API는 지원되지 않을 수 있으므로 try-catch
      let audioAllowed = null;
      let videoAllowed = null;

      try {
        const audioPermissions = await navigator.permissions.query({ name: 'microphone' });
        audioAllowed = audioPermissions.state === 'granted';
      } catch (err) {
        // Permissions API를 지원하지 않는 브라우저
        audioAllowed = null;
      }

      try {
        const cameraPermissions = await navigator.permissions.query({ name: 'camera' });
        videoAllowed = cameraPermissions.state === 'granted';
      } catch (err) {
        // Permissions API를 지원하지 않는 브라우저
        videoAllowed = null;
      }

      setMediaPermissions({
        audio: audioAllowed,
        video: videoAllowed,
        checked: true
      });
    } catch (err) {
      console.error('Failed to check media permissions:', err);
      setMediaPermissions({
        audio: null,
        video: null,
        checked: true
      });
    }
  };

  // 권한 요청
  const requestPermissions = async () => {
    try {
      const constraints = {
        audio: true,
        video: sessionConfig.roomType === 'video'
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // 즉시 스트림 정리
      stream.getTracks().forEach(track => track.stop());
      
      // 권한 상태 업데이트
      await checkMediaPermissions();
      
      return true;
    } catch (err) {
      console.error('Permission request failed:', err);
      setError('미디어 권한이 필요합니다. 브라우저 설정에서 마이크/카메라 접근을 허용해주세요.');
      return false;
    }
  };

  // 세션 생성
  const handleCreateSession = async () => {
    setIsCreating(true);
    setError('');

    try {
      // 1. 미디어 권한 확인
      const hasAudioPermission = mediaPermissions.audio;
      const hasVideoPermission = sessionConfig.roomType === 'video' ? mediaPermissions.video : true;

      if (!hasAudioPermission || !hasVideoPermission) {
        const granted = await requestPermissions();
        if (!granted) {
          setIsCreating(false);
          return;
        }
      }

      // 2. 세션 설정 검증
      if (!sessionConfig.title.trim()) {
        setError('세션 제목을 입력해주세요.');
        setIsCreating(false);
        return;
      }

      if (sessionConfig.maxParticipants < 2 || sessionConfig.maxParticipants > 8) {
        setError('참가자 수는 2-8명 사이로 설정해주세요.');
        setIsCreating(false);
        return;
      }

      // 3. 시간 검증
      if (sessionConfig.scheduledStartTime && sessionConfig.scheduledEndTime) {
        const startTime = new Date(sessionConfig.scheduledStartTime).getTime();
        const endTime = new Date(sessionConfig.scheduledEndTime).getTime();

        if (startTime >= endTime) {
          setError('종료 시간은 시작 시간보다 나중이어야 합니다.');
          setIsCreating(false);
          return;
        }

        const duration = endTime - startTime;
        
        if (duration < 30 * 60 * 1000) {
          setError('세션은 최소 30분 이상이어야 합니다.');
          setIsCreating(false);
          return;
        }

        if (duration > 120 * 60 * 1000) {
          setError('세션은 최대 2시간까지만 가능합니다.');
          setIsCreating(false);
          return;
        }
      }

      // 4. Workers API를 통한 룸 생성
      const roomData = await webrtcAPI.createRoom({
        roomType: sessionConfig.roomType,
        maxParticipants: sessionConfig.maxParticipants,
        metadata: {
          title: sessionConfig.title,
          description: sessionConfig.description,
          language: sessionConfig.language,
          isPrivate: sessionConfig.isPrivate,
          allowRecording: sessionConfig.allowRecording,
          autoTranscription: sessionConfig.autoTranscription,
          scheduledStartTime: sessionConfig.scheduledStartTime || undefined,
          scheduledEndTime: sessionConfig.scheduledEndTime || undefined,
          createdBy: localStorage.getItem('userId') || 'anonymous',
          hostName: localStorage.getItem('userName') || 'Host',
          createdByName: localStorage.getItem('userName') || 'Host',
          createdAt: new Date().toISOString()
        }
      });

      log.info('세션이 성공적으로 생성되었습니다', roomData, 'SESSION');

      setCreatedRoom({
        ...roomData,
        config: sessionConfig
      });

    } catch (err) {
      console.error('Failed to create session:', err);
      setError(err.message || '세션 생성 중 오류가 발생했습니다.');
      log.error('세션 생성 실패', err, 'SESSION');
    } finally {
      setIsCreating(false);
    }
  };

  // 세션 참가
  const handleJoinSession = () => {
    if (!createdRoom) return;
    
    const roomId = createdRoom.roomId || createdRoom.id;
    if (sessionConfig.roomType === 'video') {
      navigate(`/session/video/${roomId}`);
    } else {
      navigate(`/session/audio/${roomId}`);
    }
  };

  // 룸 ID 복사
  const handleCopyRoomId = async () => {
    if (!createdRoom) return;
    
    try {
      const roomId = createdRoom.roomId || createdRoom.id;
      await navigator.clipboard.writeText(roomId);
      // 복사 완료 피드백 (간단한 방법)
      const button = document.getElementById('copy-room-id');
      if (button) {
        const originalText = button.textContent;
        button.textContent = '복사됨!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to copy room ID:', err);
    }
  };

  // 설정 변경 핸들러 (권한 요청 포함)
  const handleConfigChange = async (field, value) => {
    // 시작 시간이 변경되면 종료 시간 검증
    if (field === 'scheduledStartTime') {
      setSessionConfig(prev => {
        const updated = {
          ...prev,
          [field]: value
        };
        
        // 종료 시간이 시작 시간보다 이전이면 초기화
        if (updated.scheduledEndTime && value) {
          const startTime = new Date(value).getTime();
          const endTime = new Date(updated.scheduledEndTime).getTime();
          if (endTime <= startTime) {
            updated.scheduledEndTime = '';
          }
        }
        
        return updated;
      });
      return;
    }
    
    // 1. 먼저 상태 업데이트
    setSessionConfig(prev => ({
      ...prev,
      [field]: value
    }));

    // 2. 세션 타입 변경 시 권한 요청
    if (field === 'roomType') {
      try {
        const constraints = {
          audio: true,
          video: value === 'video'
        };

        // 권한 요청
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        // 즉시 스트림 정리
        stream.getTracks().forEach(track => track.stop());

        // 권한 상태 업데이트
        await checkMediaPermissions();

        setError(''); // 성공 시 에러 메시지 클리어
      } catch (err) {
        console.error('Permission request failed:', err);

        // 권한 거부 시 에러 메시지 표시
        const mediaType = value === 'video' ? '카메라와 마이크' : '마이크';
        setError(`${mediaType} 권한이 필요합니다. 브라우저 설정에서 접근을 허용해주세요.`);

        // 권한 실패 시 이전 타입으로 롤백
        setSessionConfig(prev => ({
          ...prev,
          roomType: prev.roomType === 'video' ? 'audio' : prev.roomType
        }));
      }
    }
  };

  const getLanguageName = (code) => {
    const languageNames = {
      'ko': '한국어',
      'en': 'English',
      'ja': '日本語',
      'zh': '中文',
      'es': 'Español',
      'fr': 'Français',
      'de': 'Deutsch'
    };
    return languageNames[code] || code;
  };

  // 세션 생성 완료 화면
  if (createdRoom) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <div className="bg-white rounded-[20px] p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-[var(--green-500)] mx-auto mb-4" />
            <h2 className="text-[24px] font-bold text-[var(--black-500)] mb-2">
              세션 생성 완료!
            </h2>
            <p className="text-[var(--black-200)] text-[14px]">
              세션이 성공적으로 생성되었습니다
            </p>
          </div>

          <div className="bg-[var(--neutral-100)] rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[var(--black-500)] mb-3">세션 정보</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--black-200)]">제목:</span>
                <span className="text-[var(--black-500)]">{sessionConfig.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--black-200)]">유형:</span>
                <div className="flex items-center gap-1">
                  {sessionConfig.roomType === 'video' ? (
                    <Video className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                  <span className="text-[var(--black-500)]">
                    {sessionConfig.roomType === 'video' ? '화상' : '음성'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--black-200)]">최대 참가자:</span>
                <span className="text-[var(--black-500)]">{sessionConfig.maxParticipants}명</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--black-200)]">언어:</span>
                <span className="text-[var(--black-500)]">{getLanguageName(sessionConfig.language)}</span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--green-50)] rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--black-300)] text-[14px]">룸 ID</span>
              <CommonButton
                id="copy-room-id"
                onClick={handleCopyRoomId}
                variant="link"
                size="xs"
                fullWidth={false}
                icon={<Copy className="w-3 h-3" />}
                className="text-[12px]"
              >
                복사
              </CommonButton>
            </div>
            <div className="font-mono text-[16px] text-[var(--black-500)] break-all">
              {createdRoom.roomId || createdRoom.id}
            </div>
          </div>

          <div className="space-y-3">
            <CommonButton
              onClick={handleJoinSession}
              variant="primary"
              className="w-full"
            >
              세션 시작하기
            </CommonButton>
            
            <CommonButton
              onClick={() => navigate('/sessions')}
              variant="secondary"
              className="w-full"
            >
              세션 목록으로
            </CommonButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg">
      {/* Header */}
      <div className="bg-white border-b border-[var(--black-50)] px-6 py-4">
        <div className="flex items-center gap-4">
          <CommonButton
            onClick={() => navigate('/sessions')}
            variant="ghost"
            size="icon"
            fullWidth={false}
            icon={<ChevronLeft className="w-5 h-5" />}
            className="text-[var(--black-300)]"
            aria-label="뒤로가기"
          />
          <h1 className="text-[20px] font-bold text-[var(--black-500)]">새 세션 만들기</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {/* 에러 메시지 */}
        {error && (
          <div className="bg-[rgba(234,67,53,0.1)] border border-[var(--red)] rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--red)] flex-shrink-0" />
            <p className="text-[var(--red)] text-[14px]">{error}</p>
          </div>
        )}

        {/* 세션 유형 선택 */}
        <div className="bg-white rounded-[20px] p-6 mb-6">
          <h2 className="text-[18px] font-bold text-[var(--black-500)] mb-4">세션 유형</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleConfigChange('roomType', 'audio')}
              className={`p-4 rounded-lg border-2 transition-all ${
                sessionConfig.roomType === 'audio'
                  ? 'border-[var(--green-500)] bg-[var(--green-50)]'
                  : 'border-[var(--black-50)] hover:border-[var(--black-100)]'
              }`}
            >
              <Mic className={`w-8 h-8 mx-auto mb-2 ${
                sessionConfig.roomType === 'audio' ? 'text-[var(--green-500)]' : 'text-[var(--black-300)]'
              }`} />
              <div className="text-center">
                <p className="font-semibold text-[var(--black-500)]">음성 세션</p>
                <p className="text-[12px] text-[var(--black-200)]">음성만으로 대화</p>
              </div>
            </button>

            <button
              onClick={() => handleConfigChange('roomType', 'video')}
              className={`p-4 rounded-lg border-2 transition-all ${
                sessionConfig.roomType === 'video'
                  ? 'border-[var(--green-500)] bg-[var(--green-50)]'
                  : 'border-[var(--black-50)] hover:border-[var(--black-100)]'
              }`}
            >
              <Video className={`w-8 h-8 mx-auto mb-2 ${
                sessionConfig.roomType === 'video' ? 'text-[var(--green-500)]' : 'text-[var(--black-300)]'
              }`} />
              <div className="text-center">
                <p className="font-semibold text-[var(--black-500)]">화상 세션</p>
                <p className="text-[12px] text-[var(--black-200)]">음성과 화상으로 대화</p>
              </div>
            </button>
          </div>
        </div>

        {/* 세션 기본 정보 */}
        <div className="bg-white rounded-[20px] p-6 mb-6">
          <h2 className="text-[18px] font-bold text-[var(--black-500)] mb-4">세션 정보</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[14px] font-medium text-[var(--black-500)] mb-2">
                세션 제목 *
              </label>
              <input
                type="text"
                value={sessionConfig.title}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                placeholder="세션 제목을 입력하세요"
                className="w-full h-[56px] px-4 border border-[var(--black-50)] rounded-lg 
                         focus:border-[var(--black-500)] focus:outline-none text-[16px]"
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[var(--black-500)] mb-2">
                세션 설명 (선택)
              </label>
              <textarea
                value={sessionConfig.description}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                placeholder="세션에 대한 간단한 설명을 입력하세요"
                rows={3}
                className="w-full px-4 py-3 border border-[var(--black-50)] rounded-lg 
                         focus:border-[var(--black-500)] focus:outline-none text-[16px] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[14px] font-medium text-[var(--black-500)] mb-2">
                  최대 참가자
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--black-200)]" />
                  <select
                    value={sessionConfig.maxParticipants}
                    onChange={(e) => handleConfigChange('maxParticipants', parseInt(e.target.value))}
                    className="w-full h-[56px] pl-12 pr-4 border border-[var(--black-50)] rounded-lg
                             focus:border-[var(--black-500)] focus:outline-none text-[16px] appearance-none"
                  >
                    {[2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num}명</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[var(--black-500)] mb-2">
                  주요 언어
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--black-200)]" />
                  <select
                    value={sessionConfig.language}
                    onChange={(e) => handleConfigChange('language', e.target.value)}
                    className="w-full h-[56px] pl-12 pr-4 border border-[var(--black-50)] rounded-lg
                             focus:border-[var(--black-500)] focus:outline-none text-[16px] appearance-none"
                  >
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                    <option value="zh">中文</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 세션 시간 설정 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[14px] font-medium text-[var(--black-500)]">세션 시간</h3>
                {(tempStartTime || tempEndTime) && (
                  <span className="text-[12px] text-[var(--black-300)]">
                    변경사항이 있습니다
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-medium text-[var(--black-500)] mb-2">
                    시작 시간
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--black-200)]" />
                    <input
                      type="datetime-local"
                      value={tempStartTime || sessionConfig.scheduledStartTime}
                      onChange={(e) => {
                        const rounded = roundTo30Minutes(e.target.value);
                        setTempStartTime(rounded);
                        setError('');
                      }}
                      min={getRoundedCurrentTime()}
                      step="1800"
                      className={`w-full h-[56px] pl-12 pr-4 border rounded-lg
                               focus:outline-none text-[16px] transition-colors
                               ${tempStartTime && tempStartTime !== sessionConfig.scheduledStartTime
                                 ? 'border-[var(--blue)] bg-[rgba(66,133,244,0.05)]'
                                 : 'border-[var(--black-50)] focus:border-[var(--black-500)]'
                               }`}
                    />
                  </div>
                  <p className="text-[12px] text-[var(--black-200)] mt-1">
                    {tempStartTime || sessionConfig.scheduledStartTime ? (
                      <span className="flex items-center gap-1">
                        <span className="font-medium text-[var(--black-400)]">
                          {new Date(tempStartTime || sessionConfig.scheduledStartTime).toLocaleString('ko-KR', { 
                            year: 'numeric', 
                            month: '2-digit', 
                            day: '2-digit', 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false 
                          })}
                        </span>
                        {tempStartTime && tempStartTime !== sessionConfig.scheduledStartTime && (
                          <span className="text-[var(--blue)]">(변경됨)</span>
                        )}
                      </span>
                    ) : (
                      '30분 단위로 선택 가능 (현재 시간 이후)'
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[var(--black-500)] mb-2">
                    종료 시간
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--black-200)]" />
                    <input
                      type="datetime-local"
                      value={tempEndTime || sessionConfig.scheduledEndTime}
                      onChange={(e) => {
                        const rounded = roundTo30Minutes(e.target.value);
                        setTempEndTime(rounded);
                        setError('');
                      }}
                      min={getMinEndTime()}
                      max={getMaxEndTime()}
                      step="1800"
                      disabled={!tempStartTime && !sessionConfig.scheduledStartTime}
                      className={`w-full h-[56px] pl-12 pr-4 border rounded-lg
                               focus:outline-none text-[16px] transition-colors
                               ${tempEndTime && tempEndTime !== sessionConfig.scheduledEndTime
                                 ? 'border-[var(--blue)] bg-[rgba(66,133,244,0.05)]'
                                 : 'border-[var(--black-50)] focus:border-[var(--black-500)]'
                               }
                               ${!tempStartTime && !sessionConfig.scheduledStartTime
                                 ? 'bg-[var(--black-50)] cursor-not-allowed'
                                 : ''
                               }`}
                    />
                  </div>
                  <p className="text-[12px] text-[var(--black-200)] mt-1">
                    {tempEndTime || sessionConfig.scheduledEndTime ? (
                      <span className="flex items-center gap-1">
                        <span className="font-medium text-[var(--black-400)]">
                          {new Date(tempEndTime || sessionConfig.scheduledEndTime).toLocaleString('ko-KR', { 
                            year: 'numeric', 
                            month: '2-digit', 
                            day: '2-digit', 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false 
                          })}
                        </span>
                        {tempEndTime && tempEndTime !== sessionConfig.scheduledEndTime && (
                          <span className="text-[var(--blue)]">(변경됨)</span>
                        )}
                      </span>
                    ) : (
                      tempStartTime || sessionConfig.scheduledStartTime 
                        ? '30분 단위로 선택 가능 (시작 시간 + 30분 이후, 최대 2시간)' 
                        : '시작 시간을 먼저 선택하세요'
                    )}
                  </p>
                </div>
              </div>

              {/* 세션 지속 시간 표시 */}
              {(tempStartTime && tempEndTime) || (sessionConfig.scheduledStartTime && sessionConfig.scheduledEndTime) ? (
                <div className="bg-[var(--neutral-100)] rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[var(--black-300)]">세션 지속 시간</span>
                    <span className="text-[14px] font-semibold text-[var(--black-500)]">
                      {(() => {
                        const start = tempStartTime || sessionConfig.scheduledStartTime;
                        const end = tempEndTime || sessionConfig.scheduledEndTime;
                        if (!start || !end) return '';
                        const duration = new Date(end).getTime() - new Date(start).getTime();
                        const hours = Math.floor(duration / (60 * 60 * 1000));
                        const minutes = (duration % (60 * 60 * 1000)) / (60 * 1000);
                        if (hours > 0) {
                          return `${hours}시간 ${minutes}분`;
                        }
                        return `${minutes}분`;
                      })()}
                    </span>
                  </div>
                </div>
              ) : null}

              {/* 확인/취소 버튼 - 항상 표시하되, 변경사항이 있을 때만 활성화 */}
              <div className="flex gap-3 pt-2">
                <CommonButton
                  onClick={handleConfirmTime}
                  variant="primary"
                  className="flex-1"
                  disabled={!tempStartTime && !tempEndTime && !sessionConfig.scheduledStartTime}
                >
                  {tempStartTime || tempEndTime ? '시간 확인' : sessionConfig.scheduledStartTime ? '시간 수정' : '시간 설정'}
                </CommonButton>
                {(tempStartTime || tempEndTime) && (
                  <CommonButton
                    onClick={handleCancelTime}
                    variant="secondary"
                    className="flex-1"
                  >
                    취소
                  </CommonButton>
                )}
              </div>

              {/* 설정된 시간 표시 */}
              {sessionConfig.scheduledStartTime && !tempStartTime && !tempEndTime && (
                <div className="bg-[var(--green-50)] border border-[var(--green-200)] rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--green-500)] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-[12px] font-medium text-[var(--green-700)] mb-1">
                        시간이 설정되었습니다
                      </p>
                      <p className="text-[12px] text-[var(--black-400)]">
                        {new Date(sessionConfig.scheduledStartTime).toLocaleString('ko-KR', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: false 
                        })}
                        {sessionConfig.scheduledEndTime && (
                          <> ~ {new Date(sessionConfig.scheduledEndTime).toLocaleString('ko-KR', { 
                            year: 'numeric', 
                            month: '2-digit', 
                            day: '2-digit', 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false 
                          })}</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 고급 설정 */}
        <div className="bg-white rounded-[20px] p-6 mb-6">
          <CommonButton
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="ghost"
            fullWidth={true}
            icon={showAdvanced ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            iconPosition="right"
            className="flex items-center justify-between mb-4 text-[var(--black-300)] hover:bg-transparent"
          >
            <h2 className="text-[18px] font-bold text-[var(--black-500)]">고급 설정</h2>
          </CommonButton>

          {showAdvanced && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium text-[var(--black-500)]">비공개 세션</p>
                  <p className="text-[12px] text-[var(--black-200)]">룸 ID를 아는 사람만 참가 가능</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sessionConfig.isPrivate}
                    onChange={(e) => handleConfigChange('isPrivate', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--black-100)] peer-focus:outline-none peer-focus:ring-4 
                               peer-focus:ring-[rgba(0,196,113,0.3)] rounded-full peer 
                               peer-checked:after:translate-x-full peer-checked:after:border-white 
                               after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                               after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                               peer-checked:bg-[var(--green-500)]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium text-[var(--black-500)]">녹화 허용</p>
                  <p className="text-[12px] text-[var(--black-200)]">참가자가 세션을 녹화할 수 있음</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sessionConfig.allowRecording}
                    onChange={(e) => handleConfigChange('allowRecording', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--black-100)] peer-focus:outline-none peer-focus:ring-4 
                               peer-focus:ring-[rgba(0,196,113,0.3)] rounded-full peer 
                               peer-checked:after:translate-x-full peer-checked:after:border-white 
                               after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                               after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                               peer-checked:bg-[var(--green-500)]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium text-[var(--black-500)]">자동 전사</p>
                  <p className="text-[12px] text-[var(--black-200)]">음성을 자동으로 텍스트로 변환</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sessionConfig.autoTranscription}
                    onChange={(e) => handleConfigChange('autoTranscription', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--black-100)] peer-focus:outline-none peer-focus:ring-4 
                               peer-focus:ring-[rgba(0,196,113,0.3)] rounded-full peer 
                               peer-checked:after:translate-x-full peer-checked:after:border-white 
                               after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                               after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                               peer-checked:bg-[var(--green-500)]"></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* 미디어 권한 상태 - 권한을 확인한 경우에만 표시 */}
        {mediaPermissions.checked && (mediaPermissions.audio !== null || mediaPermissions.video !== null) && (
          <div className="bg-white rounded-[20px] p-6 mb-6">
            <h2 className="text-[18px] font-bold text-[var(--black-500)] mb-4">미디어 권한 상태</h2>
            <div className="space-y-3">
              {mediaPermissions.audio !== null && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mic className="w-5 h-5 text-[var(--black-300)]" />
                    <span className="text-[14px] text-[var(--black-500)]">마이크</span>
                  </div>
                  <div className={`text-[12px] px-3 py-1 rounded-full ${
                    mediaPermissions.audio
                      ? 'bg-[var(--green-50)] text-[var(--green-600)]'
                      : 'bg-[rgba(234,67,53,0.1)] text-[var(--red)]'
                  }`}>
                    {mediaPermissions.audio ? '허용됨' : '거부됨'}
                  </div>
                </div>
              )}

              {sessionConfig.roomType === 'video' && mediaPermissions.video !== null && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-[var(--black-300)]" />
                    <span className="text-[14px] text-[var(--black-500)]">카메라</span>
                  </div>
                  <div className={`text-[12px] px-3 py-1 rounded-full ${
                    mediaPermissions.video
                      ? 'bg-[var(--green-50)] text-[var(--green-600)]'
                      : 'bg-[rgba(234,67,53,0.1)] text-[var(--red)]'
                  }`}>
                    {mediaPermissions.video ? '허용됨' : '거부됨'}
                  </div>
                </div>
              )}
            </div>

            {(!mediaPermissions.audio || (sessionConfig.roomType === 'video' && !mediaPermissions.video)) && (
              <div className="mt-4 p-3 bg-[var(--neutral-100)] rounded-lg">
                <p className="text-[12px] text-[var(--black-300)] text-center">
                  브라우저 설정에서 권한을 허용한 후 다시 시도해주세요
                </p>
              </div>
            )}
          </div>
        )}

        {/* 생성 버튼 */}
        <div className="space-y-3">
          <CommonButton
            onClick={handleCreateSession}
            disabled={isCreating || !sessionConfig.title.trim()}
            variant="primary"
            className="w-full"
          >
            {isCreating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                세션 생성 중...
              </div>
            ) : (
              '세션 생성하기'
            )}
          </CommonButton>

          <CommonButton
            onClick={() => navigate('/sessions')}
            variant="secondary"
            className="w-full"
          >
            취소
          </CommonButton>
        </div>
      </div>
    </div>
  );
}
