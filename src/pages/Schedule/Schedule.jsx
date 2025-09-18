import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainHeader from "../../components/MainHeader";
import Sidebar from "../../components/chat/Sidebar";
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

  const {
    calendarEvents,
    calendarLoading,
    calendarError,
    loadCalendar,
  } = useSessionStore((state) => ({
    calendarEvents: state.calendarEvents,
    calendarLoading: state.calendarLoading,
    calendarError: state.calendarError,
    loadCalendar: state.loadCalendar,
  }));

  const fetchCalendar = useCallback(async () => {
    const { start, end } = getMonthBounds(currentMonthDate);
    try {
      await loadCalendar({ startDate: start, endDate: end });
    } catch (error) {
      // 상위 컴포넌트에서 에러 메시지를 표시하므로 여기서는 무시
    }
  }, [currentMonthDate, loadCalendar]);

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

  return (
    <div className="bg-[#fafafa] min-h-screen flex flex-col">
      <MainHeader />
      <div className="flex flex-1 p-6 space-x-6 overflow-hidden">
        <Sidebar active="schedule" />

        <div className="flex-1 flex space-x-6 overflow-y-auto">
          <div className="w-[46%]">
            <Calendar
              events={calendarEvents}
              isLoading={calendarLoading}
              currentMonthDate={currentMonthDate}
              onMonthChange={handleMonthChange}
              onRetry={handleRetry}
              error={calendarError}
            />
          </div>

          <div className="w-[54%]">
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
