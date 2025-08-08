import { useState } from "react";
import MainHeader from "../../components/MainHeader";
import Sidebar from "../../components/chat/Sidebar";
import Calendar from "../../components/Calendar";
import SessionScheduleList from "../../components/SessionScheduleList";

export default function Schedule() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 현재 월 상태 추가
  
  // 통합된 세션 데이터
  const allSessionData = [
    // 7월 세션
    {
      date: '2025-07-09',
      time: '22:00',
      participants: ['Alison'],
      language: '영어 ←> 한국어',
      duration: 25
    },
    {
      date: '2025-07-12',
      time: '22:00',
      participants: ['Dana'],
      language: '영어 ←> 한국어',
      duration: 35
    },
    {
      date: '2025-07-14',
      time: '19:00',
      participants: ['Alison'],
      language: '영어 ←> 한국어',
      duration: 15
    },
    {
      date: '2025-07-16',
      time: '21:00',
      participants: ['Dana', 'Alison', 'Park'],
      language: '영어 ←> 한국어',
      duration: 30
    },
    {
      date: '2025-07-19',
      time: '20:00',
      participants: ['Dana', 'Alison', 'Park', 'Andrew'],
      language: '영어 ←> 한국어',
      duration: 20
    },
    {
      date: '2025-07-21',
      time: '23:00',
      participants: ['Alison'],
      language: '영어 ←> 한국어',
      duration: 40
    },
    {
      date: '2025-07-23',
      time: '18:00',
      participants: ['Park'],
      language: '영어 ←> 한국어',
      duration: 45
    },
    {
      date: '2025-07-25',
      time: '15:00',
      participants: ['Andrew'],
      language: '영어 ←> 한국어',
      duration: 50
    },
    {
      date: '2025-07-28',
      time: '16:00',
      participants: ['Alison'],
      language: '영어 ←> 한국어',
      duration: 35
    },
    {
      date: '2025-07-30',
      time: '13:00',
      participants: ['Dana'],
      language: '영어 ←> 한국어',
      duration: 25
    },
    // 8월 세션
    {
      date: '2025-08-02',
      time: '17:00',
      participants: ['Dana', 'Alison'],
      language: '영어 ←> 한국어',
      duration: 40
    },
    {
      date: '2025-08-05',
      time: '18:00',
      participants: ['Park', 'Andrew'],
      language: '영어 ←> 한국어',
      duration: 30
    },
    {
      date: '2025-08-07',
      time: '14:00',
      participants: ['Alison', 'Dana', 'Park', 'Andrew'],
      language: '영어 ←> 한국어',
      duration: 60
    },
    {
      date: '2025-08-10',
      time: '19:00',
      participants: ['Alison'],
      language: '영어 ←> 한국어',
      duration: 45
    },
    {
      date: '2025-08-12',
      time: '21:00',
      participants: ['Dana', 'Park'],
      language: '영어 ←> 한국어',
      duration: 20
    },
    {
      date: '2025-08-15',
      time: '20:00',
      participants: ['Alison', 'Andrew'],
      language: '영어 ←> 한국어',
      duration: 55
    },
    // 9월 세션
    {
      date: '2025-09-03',
      time: '16:00',
      participants: ['Alison', 'Dana'],
      language: '영어 ←> 한국어',
      duration: 35
    },
    {
      date: '2025-09-08',
      time: '19:00',
      participants: ['Park', 'Andrew'],
      language: '영어 ←> 한국어',
      duration: 25
    },
    {
      date: '2025-09-12',
      time: '15:00',
      participants: ['Alison', 'Dana', 'Park'],
      language: '영어 ←> 한국어',
      duration: 50
    },
    {
      date: '2025-09-18',
      time: '20:00',
      participants: ['Andrew'],
      language: '영어 ←> 한국어',
      duration: 30
    },
    {
      date: '2025-09-25',
      time: '18:00',
      participants: ['Alison', 'Park', 'Andrew'],
      language: '영어 ←> 한국어',
      duration: 40
    }
  ];

  // 캘린더용 데이터 추출 함수
  const getCalendarData = () => {
    const eventDates = allSessionData.map(session => {
      const date = new Date(session.date);
      // 시간과 지속시간 정보를 Date 객체에 추가
      date.time = session.time;
      date.duration = session.duration;
      return date;
    });
    
    const eventInfo = {};
    allSessionData.forEach(session => {
      const dateKey = `${session.date.split('-')[0]}-${parseInt(session.date.split('-')[1])}-${session.date.split('-')[2]}`;
      const timeStr = session.time;
      const [hour, minute] = timeStr.split(':');
      const hourNum = parseInt(hour);
      const timeDisplay = hourNum >= 12 
        ? `오후 ${hourNum === 12 ? 12 : hourNum - 12}${minute === '00' ? '' : `:${minute}`}`
        : `오전 ${hourNum === 0 ? 12 : hourNum}${minute === '00' ? '' : `:${minute}`}`;
      
      eventInfo[dateKey] = `${timeDisplay} (${session.duration}분)`;
      console.log('Schedule created event info for:', dateKey, '=', eventInfo[dateKey]);
    });

    console.log('All eventInfo keys:', Object.keys(eventInfo));
    return { eventDates, eventInfo };
  };

  // 캘린더 데이터를 한 번만 계산
  const calendarData = getCalendarData();
  
  // 디버깅용 로그
  console.log('Calendar Data:', calendarData);

  // 세션 리스트용 데이터 추출 함수
  const getSessionsForMonth = (month) => {
    return allSessionData.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate.getMonth() + 1 === month;
    });
  };



  // 월 변경 시 호출되는 함수 (필요시 API 호출 등)
  const handleMonthChange = (newDate) => {
    console.log('월이 변경되었습니다:', newDate);
    setCurrentMonth(newDate.getMonth() + 1); // 월 상태 업데이트
    // 여기서 해당 월의 이벤트 데이터를 API에서 가져올 수 있습니다
  };



  return (
    <div className="bg-[#fafafa] min-h-screen flex flex-col">
      <MainHeader />
      <div className="flex flex-1 p-6 space-x-6 overflow-hidden">
        <Sidebar active="schedule" />
        
        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 flex space-x-6 overflow-y-auto">
          {/* Calendar 컴포넌트 */}
          <div className="w-[46%]">
            <Calendar 
              eventDates={calendarData.eventDates} 
              eventInfo={calendarData.eventInfo} 
              onMonthChange={handleMonthChange}
            />
          </div>
          
          {/* 세션 스케줄 리스트 */}
          <div className="w-[54%]">
            <SessionScheduleList 
              sessions={getSessionsForMonth(currentMonth)} 
              currentMonth={currentMonth} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
