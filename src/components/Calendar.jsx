import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Calendar({ eventDates, eventInfo, onMonthChange }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // 오늘 날짜
  const today = new Date();

  // 현재 월의 첫 번째 날과 마지막 날 계산
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // 달력 시작일 (이전 달의 마지막 주부터)
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
  
  // 달력 종료일 (다음 달의 첫 번째 주까지)
  const endDate = new Date(lastDayOfMonth);
  endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));

  // 달력에 표시할 모든 날짜 생성
  const calendarDays = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    calendarDays.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // 이전/다음 월 이동
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    if (onMonthChange) {
      onMonthChange(newDate);
    }
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    if (onMonthChange) {
      onMonthChange(newDate);
    }
  };

  // 날짜가 이벤트가 있는 날인지 확인
  const hasEvent = (date) => {
    return eventDates.some(eventDate => 
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear()
    );
  };

  // 이벤트 정보 가져오기
  const getEventInfo = (date) => {
    // 여러 형식의 날짜 키를 시도
    const dateKey1 = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const dateKey2 = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    console.log('Calendar looking for:', dateKey1, dateKey2, 'Available keys:', Object.keys(eventInfo));
    
    // 키로 찾기 시도
    let result = eventInfo[dateKey1] || eventInfo[dateKey2];
    
    // 키로 찾지 못한 경우 직접 날짜 비교
    if (!result) {
      const matchingEvent = eventDates.find(eventDate => 
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
      
      if (matchingEvent) {
        // 매칭되는 이벤트가 있으면 시간 포맷팅
        const timeStr = matchingEvent.time || '00:00';
        const [hour, minute] = timeStr.split(':');
        const hourNum = parseInt(hour);
        const timeDisplay = hourNum >= 12 
          ? `오후 ${hourNum === 12 ? 12 : hourNum - 12}${minute === '00' ? '' : `:${minute}`}`
          : `오전 ${hourNum === 0 ? 12 : hourNum}${minute === '00' ? '' : `:${minute}`}`;
        
        result = `${timeDisplay} (${matchingEvent.duration || 0}분)`;
      }
    }
    
    return result;
  };

  // 오늘 날짜에 이벤트가 있는지 확인
  const hasEventToday = (date) => {
    return isToday(date) && hasEvent(date);
  };

  // 날짜가 오늘인지 확인
  const isToday = (date) => {
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // 오늘 날짜이거나 오늘 날짜에 이벤트가 있는 경우 하이라이트
  const shouldHighlight = (date) => {
    return isToday(date) || hasEventToday(date);
  };

  // 날짜가 오늘 이전인지 확인
  const isBeforeToday = (date) => {
    return date < today;
  };

  // 날짜가 오늘 이후인지 확인
  const isAfterToday = (date) => {
    return date > today;
  };

  // 이벤트 텍스트 색상 결정
  const getEventTextColor = (date) => {
    if (isToday(date)) {
      return 'text-[#00c471]'; // 오늘: 초록색
    } else if (isBeforeToday(date)) {
      return 'text-[#929292]'; // 이전 날짜: 회색
    } else {
      return 'text-[#343A40]'; // 이후 날짜: 진한 회색
    }
  };

  // 날짜가 현재 월의 날짜인지 확인
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // 한국어 월 이름 (API에서 받은 월 번호를 쉽게 변환)
  const getMonthName = (monthNumber) => {
    const months = [
      "1월", "2월", "3월", "4월", "5월", "6월",
      "7월", "8월", "9월", "10월", "11월", "12월"
    ];
    // monthNumber는 1부터 시작 (API에서 7을 받으면 7월)
    return months[monthNumber - 1];
  };

  // 요일 이름
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm p-8 h-full">
      {/* 달력 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1"></div>
        <div className="flex items-center space-x-4">
          <h1 className="text-4xl font-extrabold text-black text-center">
            {getMonthName(currentDate.getMonth() + 1)} {currentDate.getFullYear()}년 세션 일정
          </h1>
        </div>
        <div className="flex-1 flex justify-end">
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-black" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-black" />
            </button>
          </div>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-0 mb-6">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="h-12 flex items-center justify-center"
          >
            <span className="text-[#6e7781] font-semibold text-xl">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 gap-1" style={{ rowGap: '70px' }}>
        {calendarDays.map((date, index) => {
          const isHighlighted = shouldHighlight(date);
          const isCurrentMonthDay = isCurrentMonth(date);
          const hasEventOnDate = hasEvent(date);
          const eventText = getEventInfo(date);
          
          return (
                         <div
               key={index}
               className={`h-[71px] flex flex-col items-center relative rounded-lg ${
                 !isCurrentMonthDay ? 'text-[#262d33] opacity-50' : 'text-[#262d33]'
               }`}
               style={{ minHeight: '71px' }}
             >
                                            {isHighlighted ? (
                 <div className="relative flex flex-col items-center h-full">
                   {/* 하이라이트 배경과 날짜 텍스트를 함께 중앙 정렬 */}
                   <div className="relative w-[35px] h-[35px] flex items-center justify-center mt-2">
                     <div className="absolute inset-0 bg-[#e6f9f1] rounded-full"></div>
                     <span className="relative z-10 text-[#00c471] font-bold text-xl">
                       {date.getDate()}
                     </span>
                   </div>
                                       {/* 이벤트 텍스트 */}
                    <span className={`relative z-10 text-xs mt-4 ${getEventTextColor(date)}`}>
                      {eventText}
                    </span>
                 </div>
               ) : (
                 <div className="flex flex-col items-center h-full">
                   <span className={`font-normal text-xl mt-2 ${
                     isCurrentMonthDay ? 'text-[#262d33]' : 'text-[#262d33] opacity-50'
                   }`}>
                     {date.getDate()}
                   </span>
                   {/* 이벤트가 있는 경우 작은 텍스트 표시 */}
                   {hasEventOnDate && (
                     <span className={`text-xs mt-4 ${getEventTextColor(date)}`}>
                       {eventText}
                     </span>
                   )}
                 </div>
               )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 