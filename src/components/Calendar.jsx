import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const getDateKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const formatTime = (date) => {
  if (!date) return "";
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "오후" : "오전";
  const hour12 = hours % 12 || 12;
  const minuteText = minutes === 0 ? "" : `:${minutes.toString().padStart(2, "0")}`;
  return `${period} ${hour12}${minuteText}`;
};

const formatMonthHeading = (date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월 세션 일정`;

export default function Calendar({
  events = [],
  isLoading = false,
  currentMonthDate,
  onMonthChange,
  onRetry,
  error,
}) {
  const [currentDate, setCurrentDate] = useState(currentMonthDate ?? new Date());
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (currentMonthDate) {
      setCurrentDate(new Date(currentMonthDate));
    }
  }, [currentMonthDate]);

  const eventsByDate = useMemo(() => {
    const grouped = new Map();
    events.forEach((event) => {
      if (!event.start) return;
      const eventDateKey = getDateKey(event.start);
      const bucket = grouped.get(eventDateKey) ?? [];
      bucket.push(event);
      grouped.set(eventDateKey, bucket);
    });

    grouped.forEach((bucket) => {
      bucket.sort((a, b) => {
        if (!a.start || !b.start) return 0;
        return a.start - b.start;
      });
    });

    return grouped;
  }, [events]);

  const firstDayOfMonth = useMemo(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    [currentDate]
  );
  const lastDayOfMonth = useMemo(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
    [currentDate]
  );

  const startDate = useMemo(() => {
    const date = new Date(firstDayOfMonth);
    date.setDate(date.getDate() - firstDayOfMonth.getDay());
    return date;
  }, [firstDayOfMonth]);

  const endDate = useMemo(() => {
    const date = new Date(lastDayOfMonth);
    date.setDate(date.getDate() + (6 - lastDayOfMonth.getDay()));
    return date;
  }, [lastDayOfMonth]);

  const calendarDays = useMemo(() => {
    const days = [];
    const cursor = new Date(startDate);

    while (cursor <= endDate) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    return days;
  }, [startDate, endDate]);

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  };

  const isSameDay = (dateA, dateB) =>
    dateA.getDate() === dateB.getDate() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getFullYear() === dateB.getFullYear();

  const isCurrentMonth = (date) => date.getMonth() === currentDate.getMonth();

  const shouldHighlight = (date, hasEvent) => {
    if (isSameDay(date, today)) return true;
    if (hasEvent && date >= today) return true;
    return false;
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm p-4 md:p-8 h-full">
      {/* 모바일: 세로 레이아웃, 데스크탑: 가로 레이아웃 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-8">
        {/* 모바일: 제목과 버튼을 세로로 배치 */}
        <div className="flex items-center justify-between md:flex-1 mb-2 md:mb-0">
          <div className="md:flex-1" />
          <h1 className="text-lg md:text-4xl font-extrabold text-black text-center flex-1 md:flex-none">
            {formatMonthHeading(currentDate)}
          </h1>
          <div className="flex items-center space-x-1 md:space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="이전 달"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-black" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="다음 달"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-black" />
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center h-[240px] md:h-[420px] bg-[#f8f9fa] rounded-lg">
          <p className="text-sm md:text-[16px] text-[#343a40] mb-4">
            캘린더 데이터를 불러오는 중 문제가 발생했습니다.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 bg-[#00c471] text-white rounded-lg text-sm md:text-[14px] transition-colors duration-200 hover:bg-[#00B267]"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-0 mb-3 md:mb-6">
            {weekDays.map((day) => (
              <div key={day} className="h-8 md:h-12 flex items-center justify-center">
                <span className="text-[#6e7781] font-semibold text-sm md:text-xl">{day}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1" style={{ rowGap: "40px" }}>
            <style jsx>{`
              @media (min-width: 768px) {
                .grid {
                  row-gap: 70px;
                }
              }
            `}</style>
            {calendarDays.map((date) => {
              const dateKey = getDateKey(date);
              const dayEvents = eventsByDate.get(dateKey) ?? [];
              const hasEvent = dayEvents.length > 0;
              const firstEvent = hasEvent ? dayEvents[0] : null;
              const highlight = shouldHighlight(date, hasEvent);
              const additionalCount = hasEvent && dayEvents.length > 1 ? dayEvents.length - 1 : 0;

              return (
                <div
                  key={dateKey}
                  className={`h-[50px] md:h-[71px] flex flex-col items-center relative rounded-lg ${
                    !isCurrentMonth(date) ? "text-[#262d33] opacity-50" : "text-[#262d33]"
                  }`}
                  style={{ minHeight: "50px" }}
                >
                  {highlight ? (
                    <div className="relative flex flex-col items-center h-full">
                      <div className="relative w-[28px] h-[28px] md:w-[35px] md:h-[35px] flex items-center justify-center mt-1 md:mt-2">
                        <div className="absolute inset-0 bg-[#e6f9f1] rounded-full" />
                        <span className="relative z-10 text-[#00c471] font-bold text-base md:text-xl">
                          {date.getDate()}
                        </span>
                      </div>
                      {hasEvent && (
                        <span className="relative z-10 text-[10px] md:text-xs mt-2 md:mt-4 text-[#00c471] text-center leading-tight">
                          {formatTime(firstEvent?.start)}
                          {additionalCount > 0 ? ` 외 ${additionalCount}건` : ""}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center h-full">
                      <span className={`font-normal text-base md:text-xl mt-1 md:mt-2 ${
                        isCurrentMonth(date) ? "text-[#262d33]" : "text-[#262d33] opacity-50"
                      }`}>
                        {date.getDate()}
                      </span>
                      {hasEvent && (
                        <span className="text-[10px] md:text-xs mt-2 md:mt-4 text-[#343A40] text-center leading-tight">
                          {formatTime(firstEvent?.start)}
                          {additionalCount > 0 ? ` 외 ${additionalCount}건` : ""}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {isLoading && (
            <div className="mt-4 md:mt-6 text-center text-xs md:text-[14px] text-[#6e7781]">
              캘린더 데이터를 불러오는 중입니다...
            </div>
          )}
        </>
      )}
    </div>
  );
}
