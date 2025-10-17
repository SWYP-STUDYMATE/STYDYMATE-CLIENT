import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainHeader from "../../components/MainHeader";
import Sidebar from "../../components/chat/Sidebar";
import MobileTabBar from "../../components/MobileTabBar";
import Calendar from "../../components/Calendar";
import SessionScheduleList from "../../components/SessionScheduleList";
import useSessionStore from "../../store/sessionStore";

const getMonthBounds = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

export default function Schedule() {
  const navigate = useNavigate();
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const calendarEvents = useSessionStore((state) => state.calendarEvents);
  const calendarLoading = useSessionStore((state) => state.calendarLoading);
  const calendarError = useSessionStore((state) => state.calendarError);

  const fetchCalendar = useCallback(async () => {
    const { start, end } = getMonthBounds(currentMonthDate);
    try {
      const loadCalendar = useSessionStore.getState().loadCalendar;
      await loadCalendar({ startDate: start, endDate: end });
    } catch (error) {
      // 상위 컴포넌트에서 에러 메시지를 표시하므로 여기서는 무시
    }
  }, [currentMonthDate]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const currentMonthSessions = useMemo(() => {
    const month = currentMonthDate.getMonth();
    const year = currentMonthDate.getFullYear();

    return calendarEvents
      .filter((event) => {
        if (!event.start) return false;
        return (
          event.start.getMonth() === month &&
          event.start.getFullYear() === year
        );
      })
      .sort((a, b) => {
        if (!a.start || !b.start) return 0;
        return a.start - b.start;
      })
      .map((event) => ({
        id: event.sessionId,
        title: event.title,
        description: event.description,
        start: event.start,
        end: event.end,
        status: (event.rawStatus || event.status || "").toUpperCase(),
        isHost: event.isHost,
        color: event.color,
        participantNames: event.participantNames || [],
        languageCode: event.languageCode,
        durationMinutes: event.durationMinutes,
        currentParticipants: event.currentParticipants,
        maxParticipants: event.maxParticipants,
      }));
  }, [calendarEvents, currentMonthDate]);

  const handleMonthChange = (newDate) => {
    setCurrentMonthDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
  };

  const handleRetry = () => {
    fetchCalendar();
  };

  const handleCreateSession = () => {
    navigate('/session/schedule/new');
  };

  // 모바일 탭 상태 (캘린더/리스트)
  const [mobileTab, setMobileTab] = useState('list');

  return (
    <div className="bg-[#fafafa] min-h-screen flex flex-col">
      <MainHeader />

      {/* 모바일: 하단 탭바 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <MobileTabBar active="schedule" />
      </div>

      <div className="flex flex-1 p-4 md:p-6 md:space-x-6 overflow-hidden pb-20 md:pb-0">
        {/* 데스크탑: 사이드바 */}
        <div className="hidden md:block">
          <Sidebar active="schedule" />
        </div>

        {/* 모바일: 탭 네비게이션 */}
        <div className="md:hidden w-full mb-4">
          <div className="flex bg-white rounded-lg p-1 border border-[#E7E7E7]">
            <button
              onClick={() => setMobileTab('list')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
                mobileTab === 'list'
                  ? 'bg-[#00C471] text-white'
                  : 'text-[#929292]'
              }`}
            >
              세션 리스트
            </button>
            <button
              onClick={() => setMobileTab('calendar')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
                mobileTab === 'calendar'
                  ? 'bg-[#00C471] text-white'
                  : 'text-[#929292]'
              }`}
            >
              캘린더
            </button>
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="flex-1 flex flex-col md:flex-row md:space-x-6 overflow-y-auto">
          {/* 모바일: 조건부 렌더링, 데스크탑: 항상 표시 */}
          <div className={`${mobileTab === 'calendar' ? 'block' : 'hidden'} md:block md:w-[46%] mb-4 md:mb-0`}>
            <Calendar
              events={calendarEvents}
              isLoading={calendarLoading}
              currentMonthDate={currentMonthDate}
              onMonthChange={handleMonthChange}
              onRetry={handleRetry}
              error={calendarError}
            />
          </div>

          <div className={`${mobileTab === 'list' ? 'block' : 'hidden'} md:block md:w-[54%]`}>
            <SessionScheduleList
              sessions={currentMonthSessions}
              currentMonthDate={currentMonthDate}
              isLoading={calendarLoading}
              error={calendarError}
              onRetry={handleRetry}
              onCreateSession={handleCreateSession}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
