import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import CommonButton from "../../components/CommonButton";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import Select from "react-select";
import commonSelectStyles from "../../components/SelectStyles";
import { useAlert } from "../../hooks/useAlert";

export default function ObSchadule4() {
  const { showError } = useAlert();
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const weekdays = [
    { id: "MONDAY", name: "월" },
    { id: "TUESDAY", name: "화" },
    { id: "WEDNESDAY", name: "수" },
    { id: "THURSDAY", name: "목" },
    { id: "FRIDAY", name: "금" },
    { id: "SATURDAY", name: "토" },
    { id: "SUNDAY", name: "일" }
  ];

  // 30분 단위 시간 옵션 생성
  const timeOptions = [
    { value: "00:00", label: "00:00" },
    { value: "00:30", label: "00:30" },
    { value: "01:00", label: "01:00" },
    { value: "01:30", label: "01:30" },
    { value: "02:00", label: "02:00" },
    { value: "02:30", label: "02:30" },
    { value: "03:00", label: "03:00" },
    { value: "03:30", label: "03:30" },
    { value: "04:00", label: "04:00" },
    { value: "04:30", label: "04:30" },
    { value: "05:00", label: "05:00" },
    { value: "05:30", label: "05:30" },
    { value: "06:00", label: "06:00" },
    { value: "06:30", label: "06:30" },
    { value: "07:00", label: "07:00" },
    { value: "07:30", label: "07:30" },
    { value: "08:00", label: "08:00" },
    { value: "08:30", label: "08:30" },
    { value: "09:00", label: "09:00" },
    { value: "09:30", label: "09:30" },
    { value: "10:00", label: "10:00" },
    { value: "10:30", label: "10:30" },
    { value: "11:00", label: "11:00" },
    { value: "11:30", label: "11:30" },
    { value: "12:00", label: "12:00" },
    { value: "12:30", label: "12:30" },
    { value: "13:00", label: "13:00" },
    { value: "13:30", label: "13:30" },
    { value: "14:00", label: "14:00" },
    { value: "14:30", label: "14:30" },
    { value: "15:00", label: "15:00" },
    { value: "15:30", label: "15:30" },
    { value: "16:00", label: "16:00" },
    { value: "16:30", label: "16:30" },
    { value: "17:00", label: "17:00" },
    { value: "17:30", label: "17:30" },
    { value: "18:00", label: "18:00" },
    { value: "18:30", label: "18:30" },
    { value: "19:00", label: "19:00" },
    { value: "19:30", label: "19:30" },
    { value: "20:00", label: "20:00" },
    { value: "20:30", label: "20:30" },
    { value: "21:00", label: "21:00" },
    { value: "21:30", label: "21:30" },
    { value: "22:00", label: "22:00" },
    { value: "22:30", label: "22:30" },
    { value: "23:00", label: "23:00" },
    { value: "23:30", label: "23:30" }
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
      showError("최소 하나의 요일을 선택해주세요.");
      return;
    }

    // 모든 선택된 요일에 시간이 설정되었는지 확인
    const hasAllTimes = selectedDays.every(day => selectedTimes[day]);
    if (!hasAllTimes) {
      showError("선택된 모든 요일에 시간을 설정해주세요.");
      return;
    }

    try {
      const requestData = {
        schedules: selectedDays.map(dayId => ({
          dayOfWeek: dayId,
          classTime: selectedTimes[dayId]
        }))
      };

      await api.post("/onboarding/schedule", requestData);
      console.log("스케줄 선택 데이터 전송 성공");
      navigate("/onboarding-schedule/complete");
    } catch (error) {
      console.error("스케줄 선택 데이터 전송 실패:", error);
      showError("데이터 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const getDayStyle = (dayId) => {
    const isSelected = selectedDays.includes(dayId);
    
    return {
      backgroundColor: isSelected ? "#e6f9f1" : "#ffffff",
      fontWeight: isSelected ? "700" : "500"
    };
  };

  // 시간 선택 드롭박스용 스타일 (border 제거)
  const timeSelectStyles = {
    ...commonSelectStyles,
    control: (base, state) => ({
      ...base,
      minHeight: 40,
      minWidth: 110,
      width: 110,
      borderRadius: 6,
      border: "none",
      boxShadow: "none",
      paddingLeft: 8,
      paddingRight: 0,
      fontSize: 16,
      fontWeight: 500,
      "&:hover": {
        border: "none",
      },
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "#212529",
      paddingRight: 8,
    }),
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen max-w-[768px] w-full mx-auto">
      <Header />
      <ProgressBar total={5} value={4} className="mt-[19px]" />
      <div className="max-w-[720px] w-full mx-auto mt-[19px]">
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
             <div className="w-[292px] mx-auto bg-white rounded-lg border border-gray-200 shadow-lg ">
               {weekdays
                 .filter(day => selectedDays.includes(day.id))
                 .map((day, index, filteredDays) => {
                   return (
                     <div key={day.id} className={`pl-[11px] py-[2px] ${index !== filteredDays.length - 1 ? '' : ''}`}>
                       <div className="flex items-center justify-between">
                         <span className="text-[16px] font-medium text-[#111111]">
                           {day.name}요일
                         </span>
                                                    <div className="flex items-center gap-2">
                             <div className="w-[110px]">
                                                               <Select
                                  options={timeOptions}
                                  value={timeOptions.find(option => option.value === selectedTimes[day.id])}
                                  onChange={(selectedOption) => handleTimeSelect(day.id, selectedOption?.value || "")}
                                  styles={timeSelectStyles}
                                  isSearchable={false}
                                  placeholder="시간"
                                />
                             </div>
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