import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import CommonButton from "../../components/CommonButton";
import { useNavigate } from "react-router-dom";
import api from "../../api";

export default function ObSchadule4() {
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const weekdays = [
    { id: "MON", name: "월" },
    { id: "TUE", name: "화" },
    { id: "WED", name: "수" },
    { id: "THU", name: "목" },
    { id: "FRI", name: "금" },
    { id: "SAT", name: "토" },
    { id: "SUN", name: "일" }
  ];

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00",
    "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
  ];

  const handleDaySelect = (dayId) => {
    setSelectedDays(prev => {
      if (prev.includes(dayId)) {
        // 요일 해제 시 해당 요일의 시간도 제거
        const newSelectedTimes = { ...selectedTimes };
        delete newSelectedTimes[dayId];
        setSelectedTimes(newSelectedTimes);
        return prev.filter(id => id !== dayId);
      } else {
        return [...prev, dayId];
      }
    });
  };

  const handleTimeSelect = (dayId, time) => {
    setSelectedTimes(prev => ({
      ...prev,
      [dayId]: time
    }));
  };

  const handleNext = async () => {
    if (selectedDays.length === 0) {
      alert("최소 하나의 요일을 선택해주세요.");
      return;
    }

    // 모든 선택된 요일에 시간이 설정되었는지 확인
    const hasAllTimes = selectedDays.every(day => selectedTimes[day]);
    if (!hasAllTimes) {
      alert("선택된 모든 요일에 시간을 설정해주세요.");
      return;
    }

    try {
      const requestData = {
        scheduleSelections: selectedDays.map(dayId => ({
          dayOfWeek: dayId,
          time: selectedTimes[dayId]
        }))
      };

      await api.post("/onboard/schedule/schedule-selection", requestData);
      console.log("스케줄 선택 데이터 전송 성공");
      navigate("/onboarding-schedule/complete");
    } catch (error) {
      console.error("스케줄 선택 데이터 전송 실패:", error);
      alert("데이터 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const getDayStyle = (dayId) => {
    const isSelected = selectedDays.includes(dayId);
    
    return {
      backgroundColor: isSelected ? "#e6f9f1" : "#ffffff",
      fontWeight: isSelected ? "700" : "500"
    };
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen w-[768px] mx-auto">
      <Header />
      <ProgressBar total={4} value={4} className="mt-[19px]" />
      <div className="w-full max-w-[720px] mx-auto mt-[19px]">
        <h1 className="text-[32px] font-bold leading-[42px] text-[#111111] mb-[24px]">
          원하는 수업 요일과 시간을 모두 선택해 주세요.
        </h1>
        <div className="mb-[12px] text-[16px] font-medium text-[#343a40] leading-[24px]">
          수업 요일 & 시간 (복수 선택 가능)
        </div>
        
                 {/* 요일 선택 */}
         <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-lg">
           <div className="flex gap-2">
             {weekdays.map((day) => (
               <button
                 key={day.id}
                 onClick={() => handleDaySelect(day.id)}
                 className="flex-1 h-10 rounded-full transition-all duration-200 flex items-center justify-center text-[16px] font-medium cursor-pointer"
                 style={getDayStyle(day.id)}
               >
                 {day.name}
               </button>
             ))}
           </div>
         </div>

         {/* 선택된 요일들의 시간 선택 */}
         {selectedDays.length > 0 && (
           <div className="space-y-3 w-[292px] mx-auto bg-white rounded-lg pt-[8px]">
             {selectedDays.map((dayId) => {
               const day = weekdays.find(d => d.id === dayId);
               return (
                 <div key={dayId} className="p-4 shadow-lg">
                   <div className="flex items-center justify-between">
                     <span className="text-[16px] font-medium text-[#111111]">
                       {day.name}요일
                     </span>
                     <div className="flex items-center gap-2">
                       <select
                         value={selectedTimes[dayId] || ""}
                         onChange={(e) => handleTimeSelect(dayId, e.target.value)}
                         className="px-3 py-2 rounded-md text-[16px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                       >
                         <option value="">시간 선택</option>
                         {timeSlots.map((time) => (
                           <option key={time} value={time}>
                             {time}
                           </option>
                         ))}
                       </select>
                     </div>
                   </div>
                 </div>
               );
             })}
           </div>
         )}
        
        <CommonButton
          text="다음"
          className="w-full mt-[304px]"
          disabled={loading || selectedDays.length === 0 || !selectedDays.every(day => selectedTimes[day])}
          onClick={handleNext}
        />
      </div>
    </div>
  );
} 