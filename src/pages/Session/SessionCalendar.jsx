import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Mic,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import CommonButton from '../../components/CommonButton';
import useSessionStore from '../../store/sessionStore';

export default function SessionCalendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day

  const {
    sessions,
    upcomingSessions,
    loadUpcomingSessions,
    addSession
  } = useSessionStore();

  useEffect(() => {
    loadUpcomingSessions();
  }, [loadUpcomingSessions]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // 이전 달 날짜들
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }

    // 현재 달 날짜들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // 다음 달 날짜들
    const remainingDays = 42 - days.length; // 6주 * 7일 = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const getSessionsForDate = (date) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate.getFullYear() === date.getFullYear() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getDate() === date.getDate();
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleScheduleNew = () => {
    navigate('/session/schedule/new');
  };

  const SessionCard = ({ session }) => (
    <div
      className="bg-white rounded-lg p-3 mb-2 border border-[#E7E7E7] 
      hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/session/${session.type}/${session.id}`)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <img
            src={session.partnerImage}
            alt={session.partnerName}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <p className="text-[12px] font-semibold text-[#111111]">
              {session.partnerName}
            </p>
            <p className="text-[10px] text-[#606060]">
              {formatTime(session.date)} • {session.duration}분
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {session.type === 'video' ? (
            <Video className="w-4 h-4 text-[#606060]" />
          ) : (
            <Mic className="w-4 h-4 text-[#606060]" />
          )}
          {session.participants && (
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3 text-[#606060]" />
              <span className="text-[10px] text-[#606060]">{session.participants}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${session.status === 'completed'
          ? 'bg-[#E8F5E9] text-[#4CAF50]'
          : 'bg-[#E3F2FD] text-[#2196F3]'
          }`}>
          {session.status === 'completed' ? '완료' : '예정'}
        </span>
        <span className="text-[10px] text-[#929292]">
          {session.language === 'en' ? 'English' : '한국어'}
        </span>
      </div>
    </div>
  );

  const days = getDaysInMonth(currentDate);
  const selectedDateSessions = getSessionsForDate(selectedDate);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E7E7E7] px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-[#111111]">세션 캘린더</h1>
          <CommonButton
            onClick={handleScheduleNew}
            variant="primary"
            size="small"
          >
            <Plus className="w-4 h-4 mr-1" />
            새 세션
          </CommonButton>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[18px] font-bold text-[#111111]">
                  {currentDate.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-[#F1F3F5] rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#606060]" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1 text-[14px] text-[#606060] hover:bg-[#F1F3F5] 
                    rounded-lg transition-colors"
                  >
                    오늘
                  </button>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-[#F1F3F5] rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-[#606060]" />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                  <div key={day} className="text-center py-2">
                    <span className="text-[12px] font-medium text-[#929292]">{day}</span>
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const isToday = day.date.toDateString() === new Date().toDateString();
                  const isSelected = day.date.toDateString() === selectedDate.toDateString();
                  const sessions = getSessionsForDate(day.date);

                  return (
                    <div
                      key={index}
                      onClick={() => day.isCurrentMonth && handleDateClick(day.date)}
                      className={`
                        min-h-[80px] p-2 border border-[#E7E7E7] rounded-lg cursor-pointer
                        transition-all duration-200
                        ${!day.isCurrentMonth ? 'bg-[#FAFAFA] text-[#929292]' : 'bg-white'}
                        ${isSelected ? 'ring-2 ring-[#00C471]' : ''}
                        ${day.isCurrentMonth ? 'hover:bg-[#F8F9FA]' : ''}
                      `}
                    >
                      <div className={`text-[14px] font-medium mb-1 ${isToday ? 'text-[#00C471]' : day.isCurrentMonth ? 'text-[#111111]' : ''
                        }`}>
                        {day.date.getDate()}
                      </div>

                      {/* Session Indicators */}
                      {sessions.length > 0 && (
                        <div className="space-y-1">
                          {sessions.slice(0, 2).map((session, idx) => (
                            <div
                              key={idx}
                              className={`h-1.5 rounded-full ${session.status === 'completed'
                                ? 'bg-[#4CAF50]'
                                : 'bg-[#2196F3]'
                                }`}
                            />
                          ))}
                          {sessions.length > 2 && (
                            <span className="text-[10px] text-[#929292]">
                              +{sessions.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Date Sessions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
              <h3 className="text-[16px] font-bold text-[#111111] mb-4">
                {selectedDate.toLocaleDateString('ko-KR', {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </h3>

              {selectedDateSessions.length > 0 ? (
                <div className="space-y-2">
                  {selectedDateSessions.map(session => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-[#E7E7E7] mx-auto mb-3" />
                  <p className="text-[14px] text-[#929292] mb-4">
                    예정된 세션이 없습니다
                  </p>
                  <CommonButton
                    onClick={handleScheduleNew}
                    variant="secondary"
                    size="small"
                  >
                    세션 예약하기
                  </CommonButton>
                </div>
              )}
            </div>

            {/* Session Stats */}
            <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7] mt-4">
              <h3 className="text-[16px] font-bold text-[#111111] mb-4">
                이번 달 통계
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-[#606060]">예정된 세션</span>
                  <span className="text-[16px] font-semibold text-[#111111]">
                    {sessions.filter(s => s.status === 'scheduled').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-[#606060]">완료된 세션</span>
                  <span className="text-[16px] font-semibold text-[#111111]">
                    {sessions.filter(s => s.status === 'completed').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-[#606060]">총 학습시간</span>
                  <span className="text-[16px] font-semibold text-[#111111]">
                    {sessions.reduce((acc, s) => acc + s.duration, 0)}분
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}