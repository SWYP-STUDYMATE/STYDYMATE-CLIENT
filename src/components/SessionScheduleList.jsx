import React from "react";

export default function SessionScheduleList({ sessions, currentMonth }) {
  // 오늘 날짜
  const today = new Date();

  // 날짜가 오늘인지 확인
  const isToday = (date) => {
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // 요일 이름
  const getDayName = (date) => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return days[date.getDay()];
  };

  // 시간 포맷팅
  const formatTime = (time) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    if (hourNum >= 12) {
      return `오후 ${hourNum === 12 ? 12 : hourNum - 12}${minute === '00' ? '' : `:${minute}`}`;
    } else {
      return `오전 ${hourNum === 0 ? 12 : hourNum}${minute === '00' ? '' : `:${minute}`}`;
    }
  };

  // 월 이름
  const getMonthName = (monthNumber) => {
    const months = [
      "1월", "2월", "3월", "4월", "5월", "6월",
      "7월", "8월", "9월", "10월", "11월", "12월"
    ];
    return months[monthNumber - 1];
  };

  return (
    <div className="bg-[#00A398]/[0.03] rounded-[20px] p-8 w-full h-full">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-[48px] font-bold text-[#111111] mb-2">
          세션 스케줄
        </h1>
        <p className="text-[16px] font-medium text-[#343a40]">
          {getMonthName(currentMonth)} 1일 - {getMonthName(currentMonth)} 31일
        </p>
      </div>

      {/* 세션 리스트 */}
      <div className="space-y-4">
        {sessions.map((session, index) => {
          const sessionDate = new Date(session.date);
          const isTodaySession = isToday(sessionDate);
          
          return (
            <div
              key={index}
              className={`bg-white rounded-[10px] p-6 ${
                isTodaySession 
                  ? 'border-2 border-[#00c471]' 
                  : 'border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                {/* 왼쪽: 세션 정보 */}
                <div className="flex items-center space-x-6">
                                     {/* 세션 기본 정보 */}
                   <div className="flex flex-col w-[191px]">
                    <span className="text-[18px] font-bold text-[#00c471] mb-1">
                      {isTodaySession ? '오늘 ' : ''}{sessionDate.getDate()}일 ({getDayName(sessionDate)}) {formatTime(session.time)}
                    </span>
                    <span className="text-[18px] font-bold text-[#111111] mb-1">
                      [{session.participants.length}명] {session.participants.join(', ')}
                    </span>
                    <span className="text-[18px] font-bold text-[#111111]">
                      {session.language}
                    </span>
                  </div>

                  {/* 참가자 프로필 이미지 */}
                  <div className="flex space-x-2">
                    {session.participants.slice(0, 4).map((participant, pIndex) => (
                      <div
                        key={pIndex}
                        className="w-[58px] h-[58px] rounded-full bg-gray-300 border-2 border-white flex items-center justify-center"
                      >
                        <span className="text-white font-bold text-sm">
                          {participant.charAt(0)}
                        </span>
                      </div>
                    ))}
                    {session.participants.length > 4 && (
                      <div className="w-[58px] h-[58px] rounded-full bg-gray-400 border-2 border-white flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          +{session.participants.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 오른쪽: 세션 시간 */}
                <div className="text-right">
                  <span className="text-[18px] font-bold text-[#111111]">
                    {session.duration}분 세션
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 