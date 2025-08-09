import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Calendar,
    Clock,
    Video,
    Mic,
    Users,
    Globe,
    RepeatIcon,
    Bell,
    User,
    Check
} from 'lucide-react';
import CommonButton from '../../components/CommonButton';
import useSessionStore from '../../store/sessionStore';
import useProfileStore from '../../store/profileStore';

export default function SessionScheduleNew() {
    const navigate = useNavigate();
    const { addSession } = useSessionStore();
    const { englishName } = useProfileStore();

    const [step, setStep] = useState(1); // 1: 기본정보, 2: 시간선택, 3: 확인
    const [sessionData, setSessionData] = useState({
        type: 'video', // video, audio
        participantType: 'individual', // individual, group
        partnerId: '',
        partnerName: '',
        language: 'en',
        date: new Date(),
        time: '',
        duration: 30,
        isRecurring: false,
        recurringType: 'weekly', // weekly, biweekly, monthly
        recurringEndDate: null,
        reminderTime: 30, // 분 단위
        notes: ''
    });

    // 더미 파트너 데이터 (실제로는 API에서 가져와야 함)
    const availablePartners = [
        { id: 'emma123', name: 'Emma Wilson', level: 'B2', languages: ['en', 'ko'], avatar: '/assets/basicProfilePic.png' },
        { id: 'john456', name: 'John Smith', level: 'C1', languages: ['en', 'es'], avatar: '/assets/basicProfilePic.png' },
        { id: 'sarah111', name: 'Sarah Johnson', level: 'B1', languages: ['en', 'ja'], avatar: '/assets/basicProfilePic.png' },
        { id: 'mike222', name: 'Mike Chen', level: 'A2', languages: ['en', 'zh'], avatar: '/assets/basicProfilePic.png' }
    ];

    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
        '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
        '20:00', '20:30', '21:00'
    ];

    const handleNext = () => {
        if (step === 1 && sessionData.partnerId) {
            setStep(2);
        } else if (step === 2 && sessionData.time) {
            setStep(3);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            navigate(-1);
        }
    };

    const handleSchedule = () => {
        const [hours, minutes] = sessionData.time.split(':').map(Number);
        const scheduledDate = new Date(sessionData.date);
        scheduledDate.setHours(hours, minutes, 0, 0);

        const newSession = {
            id: Date.now().toString(),
            date: scheduledDate,
            partnerId: sessionData.partnerId,
            partnerName: sessionData.partnerName,
            partnerImage: availablePartners.find(p => p.id === sessionData.partnerId)?.avatar || '/assets/basicProfilePic.png',
            type: sessionData.type,
            duration: sessionData.duration,
            language: sessionData.language,
            status: 'scheduled',
            participants: sessionData.participantType === 'group' ? 4 : undefined,
            isRecurring: sessionData.isRecurring,
            recurringType: sessionData.recurringType,
            reminderTime: sessionData.reminderTime,
            notes: sessionData.notes
        };

        addSession(newSession);
        navigate('/sessions/calendar');
    };

    const handlePartnerSelect = (partner) => {
        setSessionData({
            ...sessionData,
            partnerId: partner.id,
            partnerName: partner.name
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    };

    return (
        <div className="min-h-screen page-bg">
            {/* Header */}
            <div className="bg-white border-b border-[var(--black-50)] px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleBack}
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-[20px] font-bold text-[var(--black-500)]">새 세션 예약</h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className={`w-8 h-1 rounded-full ${step >= 1 ? 'bg-[var(--green-500)]' : 'bg-[var(--black-50)]'}`} />
                        <div className={`w-8 h-1 rounded-full ${step >= 2 ? 'bg-[var(--green-500)]' : 'bg-[var(--black-50)]'}`} />
                        <div className={`w-8 h-1 rounded-full ${step >= 3 ? 'bg-[var(--green-500)]' : 'bg-[var(--black-50)]'}`} />
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-6">
                {step === 1 && (
                    <div className="space-y-6">
                        {/* 세션 타입 선택 */}
                        <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
                            <h2 className="text-[18px] font-bold text-[var(--black-500)] mb-4">세션 타입</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setSessionData({ ...sessionData, type: 'video' })}
                                    className={`p-4 rounded-lg border-2 transition-all ${sessionData.type === 'video'
                                        ? 'border-[var(--green-500)] bg-[rgba(0,196,113,0.05)]'
                                        : 'border-[var(--black-50)]'
                                        }`}
                                >
                                    <Video className={`w-6 h-6 mx-auto mb-2 ${sessionData.type === 'video' ? 'text-[var(--green-500)]' : 'text-[var(--black-200)]'
                                        }`} />
                                    <p className="text-[14px] font-medium">비디오 세션</p>
                                </button>
                                <button
                                    onClick={() => setSessionData({ ...sessionData, type: 'audio' })}
                                    className={`p-4 rounded-lg border-2 transition-all ${sessionData.type === 'audio'
                                        ? 'border-[var(--green-500)] bg-[rgba(0,196,113,0.05)]'
                                        : 'border-[var(--black-50)]'
                                        }`}
                                >
                                    <Mic className={`w-6 h-6 mx-auto mb-2 ${sessionData.type === 'audio' ? 'text-[var(--green-500)]' : 'text-[var(--black-200)]'
                                        }`} />
                                    <p className="text-[14px] font-medium">오디오 세션</p>
                                </button>
                            </div>
                        </div>

                        {/* 참가자 타입 */}
                        <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
                            <h2 className="text-[18px] font-bold text-[var(--black-500)] mb-4">참가자 타입</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setSessionData({ ...sessionData, participantType: 'individual' })}
                                    className={`p-4 rounded-lg border-2 transition-all ${sessionData.participantType === 'individual'
                                        ? 'border-[var(--green-500)] bg-[rgba(0,196,113,0.05)]'
                                        : 'border-[var(--black-50)]'
                                        }`}
                                >
                                    <User className={`w-6 h-6 mx-auto mb-2 ${sessionData.participantType === 'individual' ? 'text-[var(--green-500)]' : 'text-[var(--black-200)]'
                                        }`} />
                                    <p className="text-[14px] font-medium">1:1 세션</p>
                                </button>
                                <button
                                    onClick={() => setSessionData({ ...sessionData, participantType: 'group' })}
                                    className={`p-4 rounded-lg border-2 transition-all ${sessionData.participantType === 'group'
                                        ? 'border-[var(--green-500)] bg-[rgba(0,196,113,0.05)]'
                                        : 'border-[var(--black-50)]'
                                        }`}
                                >
                                    <Users className={`w-6 h-6 mx-auto mb-2 ${sessionData.participantType === 'group' ? 'text-[var(--green-500)]' : 'text-[var(--black-200)]'
                                        }`} />
                                    <p className="text-[14px] font-medium">그룹 세션</p>
                                </button>
                            </div>
                        </div>

                        {/* 파트너 선택 */}
                        <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
                            <h2 className="text-[18px] font-bold text-[var(--black-500)] mb-4">파트너 선택</h2>
                            <div className="space-y-3">
                                {availablePartners.map(partner => (
                                    <button
                                        key={partner.id}
                                        onClick={() => handlePartnerSelect(partner)}
                                        className={`w-full p-4 rounded-lg border-2 transition-all ${sessionData.partnerId === partner.id
                                            ? 'border-[var(--green-500)] bg-[rgba(0,196,113,0.05)]'
                                            : 'border-[var(--black-50)] hover:border-[color-mix(in_srgb,var(--green-500),#fff 50%)]'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={partner.avatar}
                                                    alt={partner.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                                <div className="text-left">
                                                    <p className="text-[14px] font-medium text-[var(--black-500)]">{partner.name}</p>
                                                    <p className="text-[12px] text-[var(--black-300)]">
                                                        Level {partner.level} • {partner.languages.join(', ').toUpperCase()}
                                                    </p>
                                                </div>
                                            </div>
                                            {sessionData.partnerId === partner.id && (
                                                <Check className="w-5 h-5 text-[var(--green-500)]" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 언어 선택 */}
                        <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
                            <h2 className="text-[18px] font-bold text-[var(--black-500)] mb-4">세션 언어</h2>
                            <div className="flex items-center space-x-3">
                                <Globe className="w-5 h-5 text-[var(--black-300)]" />
                                <select
                                    value={sessionData.language}
                                    onChange={(e) => setSessionData({ ...sessionData, language: e.target.value })}
                                    className="flex-1 p-3 rounded-lg border border-[var(--black-50)] text-[14px] outline-none focus:border-[var(--green-500)]"
                                >
                                    <option value="en">English</option>
                                    <option value="ko">한국어</option>
                                    <option value="ja">日本語</option>
                                    <option value="zh">中文</option>
                                    <option value="es">Español</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        {/* 날짜 선택 */}
                        <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
                            <h2 className="text-[18px] font-bold text-[var(--black-500)] mb-4">날짜 선택</h2>
                            <div className="flex items-center space-x-3 mb-4">
                                <Calendar className="w-5 h-5 text-[var(--black-300)]" />
                                <input
                                    type="date"
                                    value={sessionData.date.toISOString().split('T')[0]}
                                    onChange={(e) => setSessionData({ ...sessionData, date: new Date(e.target.value) })}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="flex-1 p-3 rounded-lg border border-[var(--black-50)] text-[14px] outline-none focus:border-[var(--green-500)]"
                                />
                            </div>
                            <p className="text-[14px] text-[var(--black-300)]">{formatDate(sessionData.date)}</p>
                        </div>

                        {/* 시간 선택 */}
                        <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
                            <h2 className="text-[18px] font-bold text-[var(--black-500)] mb-4">시간 선택</h2>
                            <div className="grid grid-cols-3 gap-2">
                                {timeSlots.map(time => (
                                    <button
                                        key={time}
                                        onClick={() => setSessionData({ ...sessionData, time })}
                                        className={`p-3 rounded-lg text-[14px] font-medium transition-all ${sessionData.time === time
                                            ? 'bg-[var(--green-500)] text-white'
                                            : 'bg-[var(--neutral-100)] text-[var(--black-300)] hover:bg-[var(--black-50)]'
                                            }`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 세션 길이 */}
                        <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
                            <h2 className="text-[18px] font-bold text-[var(--black-500)] mb-4">세션 길이</h2>
                            <div className="flex items-center space-x-4">
                                <Clock className="w-5 h-5 text-[var(--black-300)]" />
                                <div className="flex items-center space-x-3">
                                    {[30, 45, 60].map(duration => (
                                        <button
                                            key={duration}
                                            onClick={() => setSessionData({ ...sessionData, duration })}
                                            className={`px-4 py-2 rounded-lg text-[14px] font-medium transition-all ${sessionData.duration === duration
                                                ? 'bg-[var(--green-500)] text-white'
                                                : 'bg-[var(--neutral-100)] text-[var(--black-300)] hover:bg-[var(--black-50)]'
                                                }`}
                                        >
                                            {duration}분
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 반복 설정 */}
                        <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <RepeatIcon className="w-5 h-5 text-[var(--black-300)]" />
                                    <h2 className="text-[18px] font-bold text-[var(--black-500)]">반복 설정</h2>
                                </div>
                                <button
                                    onClick={() => setSessionData({ ...sessionData, isRecurring: !sessionData.isRecurring })}
                                    className={`w-12 h-6 rounded-full transition-colors ${sessionData.isRecurring ? 'bg-[var(--green-500)]' : 'bg-[var(--black-50)]'
                                        } relative`}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${sessionData.isRecurring ? 'translate-x-6' : 'translate-x-0.5'
                                        }`} />
                                </button>
                            </div>

                            {sessionData.isRecurring && (
                                <div className="space-y-3">
                                    <select
                                        value={sessionData.recurringType}
                                        onChange={(e) => setSessionData({ ...sessionData, recurringType: e.target.value })}
                                        className="w-full p-3 rounded-lg border border-[#E7E7E7] text-[14px] outline-none focus:border-[#00C471]"
                                    >
                                        <option value="weekly">매주</option>
                                        <option value="biweekly">격주</option>
                                        <option value="monthly">매월</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* 리마인더 */}
                        <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
                            <div className="flex items-center space-x-3 mb-4">
                                <Bell className="w-5 h-5 text-[var(--black-300)]" />
                                <h2 className="text-[18px] font-bold text-[var(--black-500)]">리마인더</h2>
                            </div>
                            <select
                                value={sessionData.reminderTime}
                                onChange={(e) => setSessionData({ ...sessionData, reminderTime: parseInt(e.target.value) })}
                                className="w-full p-3 rounded-lg border border-[var(--black-50)] text-[14px] outline-none focus:border-[var(--green-500)]"
                            >
                                <option value="15">15분 전</option>
                                <option value="30">30분 전</option>
                                <option value="60">1시간 전</option>
                                <option value="1440">하루 전</option>
                            </select>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        {/* 예약 확인 */}
                        <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
                            <h2 className="text-[18px] font-bold text-[var(--black-500)] mb-6">예약 확인</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-[var(--black-50)]">
                                    <span className="text-[14px] text-[var(--black-300)]">세션 타입</span>
                                    <div className="flex items-center space-x-2">
                                        {sessionData.type === 'video' ? <Video className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                        <span className="text-[14px] font-medium text-[var(--black-500)]">
                                            {sessionData.type === 'video' ? '비디오' : '오디오'} 세션
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-[var(--black-50)]">
                                    <span className="text-[14px] text-[var(--black-300)]">파트너</span>
                                    <div className="flex items-center space-x-2">
                                        <img
                                            src={availablePartners.find(p => p.id === sessionData.partnerId)?.avatar}
                                            alt={sessionData.partnerName}
                                            className="w-6 h-6 rounded-full"
                                        />
                                        <span className="text-[14px] font-medium text-[var(--black-500)]">{sessionData.partnerName}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-[var(--black-50)]">
                                    <span className="text-[14px] text-[var(--black-300)]">날짜/시간</span>
                                    <span className="text-[14px] font-medium text-[var(--black-500)]">
                                        {formatDate(sessionData.date)} {sessionData.time}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-[var(--black-50)]">
                                    <span className="text-[14px] text-[var(--black-300)]">세션 길이</span>
                                    <span className="text-[14px] font-medium text-[var(--black-500)]">{sessionData.duration}분</span>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-[var(--black-50)]">
                                    <span className="text-[14px] text-[var(--black-300)]">언어</span>
                                    <span className="text-[14px] font-medium text-[var(--black-500)]">
                                        {sessionData.language === 'en' ? 'English' :
                                            sessionData.language === 'ko' ? '한국어' :
                                                sessionData.language === 'ja' ? '日本語' :
                                                    sessionData.language === 'zh' ? '中文' : 'Español'}
                                    </span>
                                </div>

                                {sessionData.isRecurring && (
                                    <div className="flex items-center justify-between py-3 border-b border-[var(--black-50)]">
                                        <span className="text-[14px] text-[var(--black-300)]">반복</span>
                                        <span className="text-[14px] font-medium text-[var(--black-500)]">
                                            {sessionData.recurringType === 'weekly' ? '매주' :
                                                sessionData.recurringType === 'biweekly' ? '격주' : '매월'}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between py-3">
                                    <span className="text-[14px] text-[var(--black-300)]">리마인더</span>
                                    <span className="text-[14px] font-medium text-[var(--black-500)]">
                                        {sessionData.reminderTime === 15 ? '15분 전' :
                                            sessionData.reminderTime === 30 ? '30분 전' :
                                                sessionData.reminderTime === 60 ? '1시간 전' : '하루 전'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 메모 */}
                        <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
                            <h2 className="text-[18px] font-bold text-[#111111] mb-4">메모 (선택사항)</h2>
                            <textarea
                                value={sessionData.notes}
                                onChange={(e) => setSessionData({ ...sessionData, notes: e.target.value })}
                                placeholder="세션에 대한 메모를 입력하세요..."
                                className="w-full p-4 rounded-lg border border-[#E7E7E7] text-[14px] outline-none focus:border-[#00C471] resize-none"
                                rows={3}
                            />
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div className="mt-8 flex gap-3">
                    {step > 1 && (
                        <CommonButton
                            onClick={handleBack}
                            variant="secondary"
                            className="flex-1"
                        >
                            이전
                        </CommonButton>
                    )}
                    {step < 3 ? (
                        <CommonButton
                            onClick={handleNext}
                            variant="primary"
                            className="flex-1"
                            disabled={
                                (step === 1 && !sessionData.partnerId) ||
                                (step === 2 && !sessionData.time)
                            }
                        >
                            다음
                        </CommonButton>
                    ) : (
                        <CommonButton
                            onClick={handleSchedule}
                            variant="primary"
                            className="flex-1"
                        >
                            예약 완료
                        </CommonButton>
                    )}
                </div>
            </div>
        </div>
    );
}