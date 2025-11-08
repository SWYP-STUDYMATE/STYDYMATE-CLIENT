import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import CommonButton from './CommonButton';

export default function DateTimePicker({
  value,
  onChange,
  min,
  max,
  disabled = false,
  placeholder = '날짜 및 시간 선택'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const pickerRef = useRef(null);

  // 시간 옵션 (0-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: String(i).padStart(2, '0'),
    label: String(i).padStart(2, '0')
  }));

  // 분 옵션 (00, 30만)
  const minuteOptions = [
    { value: '00', label: '00' },
    { value: '30', label: '30' }
  ];

  // 초기값 설정
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date.toISOString().split('T')[0]);
      setSelectedHour(String(date.getHours()).padStart(2, '0'));
      setSelectedMinute(String(Math.round(date.getMinutes() / 30) * 30).padStart(2, '0'));
    } else {
      setSelectedDate('');
      setSelectedHour('');
      setSelectedMinute('');
    }
  }, [value]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 최소 날짜 계산
  const getMinDate = () => {
    if (min) {
      const minDate = new Date(min);
      return minDate.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  };

  // 최대 날짜 계산
  const getMaxDate = () => {
    if (max) {
      const maxDate = new Date(max);
      return maxDate.toISOString().split('T')[0];
    }
    return '';
  };

  // 사용 가능한 시간 옵션 필터링
  const getAvailableHourOptions = () => {
    if (!min || !selectedDate) {
      return hourOptions;
    }

    const minDate = new Date(min);
    const selected = new Date(selectedDate);
    
    // 다른 날이면 모든 시간 선택 가능
    if (selected.toDateString() !== minDate.toDateString()) {
      return hourOptions;
    }

    // 같은 날이면 최소 시간 이후만 선택 가능
    const minHour = minDate.getHours();
    return hourOptions.filter(option => parseInt(option.value) >= minHour);
  };

  // 사용 가능한 분 옵션 필터링
  const getAvailableMinuteOptions = () => {
    if (!min || !selectedDate || !selectedHour) {
      return minuteOptions;
    }

    const minDate = new Date(min);
    const selected = new Date(selectedDate);
    
    // 다른 날이면 모든 분 선택 가능
    if (selected.toDateString() !== minDate.toDateString()) {
      return minuteOptions;
    }

    // 같은 날이고 같은 시간이면 최소 분 이후만 선택 가능
    const minHour = minDate.getHours();
    const minMinute = Math.ceil(minDate.getMinutes() / 30) * 30;
    
    if (parseInt(selectedHour) === minHour) {
      return minuteOptions.filter(option => parseInt(option.value) >= minMinute);
    }

    return minuteOptions;
  };

  // 시간 변경 시 분 옵션 업데이트
  const handleHourChange = (hour) => {
    setSelectedHour(hour);
    
    // 시간이 변경되면 분 초기화
    if (hour) {
      setSelectedMinute('');
      
      // 최소 시간 제한 확인
      if (min && selectedDate) {
        const minDate = new Date(min);
        const selected = new Date(selectedDate);
        
        if (selected.toDateString() === minDate.toDateString()) {
          const minHour = minDate.getHours();
          const minMinute = Math.ceil(minDate.getMinutes() / 30) * 30;
          
          if (parseInt(hour) === minHour) {
            // 같은 시간이면 최소 분으로 설정
            setSelectedMinute(String(minMinute).padStart(2, '0'));
          }
        }
      }
    } else {
      setSelectedMinute('');
    }
  };

  // 날짜 변경 시 시간 제한 확인
  const handleDateChange = (date) => {
    setSelectedDate(date);
    
    // 날짜가 변경되면 시간/분 초기화
    setSelectedHour('');
    setSelectedMinute('');
  };

  // 확인 버튼 클릭
  const handleConfirm = () => {
    if (!selectedDate || !selectedHour || selectedMinute === '') {
      return;
    }

    const dateTimeString = `${selectedDate}T${selectedHour}:${selectedMinute}`;
    const dateTime = new Date(dateTimeString);

    // 최소/최대 시간 검증
    if (min && dateTime < new Date(min)) {
      return;
    }
    if (max && dateTime > new Date(max)) {
      return;
    }

    onChange(dateTimeString);
    setIsOpen(false);
  };

  // 취소 버튼 클릭
  const handleCancel = () => {
    // 원래 값으로 복원
    if (value) {
      const date = new Date(value);
      setSelectedDate(date.toISOString().split('T')[0]);
      setSelectedHour(String(date.getHours()).padStart(2, '0'));
      setSelectedMinute(String(Math.round(date.getMinutes() / 30) * 30).padStart(2, '0'));
    } else {
      setSelectedDate('');
      setSelectedHour('');
      setSelectedMinute('');
    }
    setIsOpen(false);
  };

  // 표시용 텍스트
  const displayText = value
    ? new Date(value).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    : placeholder;

  // 현재 선택된 시간이 유효한지 확인
  const isValid = selectedDate && selectedHour !== '' && selectedMinute !== '';

  return (
    <div className="relative" ref={pickerRef}>
      {/* 입력 필드 */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full h-[56px] pl-12 pr-4 border rounded-lg
          focus:outline-none text-[16px] transition-colors text-left
          ${disabled
            ? 'bg-[var(--black-50)] cursor-not-allowed border-[var(--black-50)]'
            : isOpen
              ? 'border-[var(--black-500)]'
              : 'border-[var(--black-50)] hover:border-[var(--black-200)]'
          }
          ${value ? 'text-[var(--black-500)]' : 'text-[var(--black-300)]'}
        `}
      >
        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--black-200)]" />
        <span className={value ? '' : 'text-[var(--black-300)]'}>{displayText}</span>
      </button>

      {/* 팝업 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-[var(--black-100)] rounded-lg shadow-xl z-[100] w-full min-w-[320px]">
          <div className="p-4 space-y-4">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-[var(--black-500)]">날짜 및 시간 선택</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-[var(--black-50)] rounded transition-colors"
              >
                <X className="w-5 h-5 text-[var(--black-300)]" />
              </button>
            </div>

            {/* 날짜 선택 */}
            <div>
              <label className="block text-[14px] font-medium text-[var(--black-500)] mb-2">
                날짜
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--black-200)]" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full h-[48px] pl-12 pr-4 border border-[var(--black-50)] rounded-lg
                           focus:border-[var(--black-500)] focus:outline-none text-[16px]"
                />
              </div>
            </div>

            {/* 시간 선택 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[14px] font-medium text-[var(--black-500)] mb-2">
                  시간
                </label>
                <select
                  value={selectedHour}
                  onChange={(e) => handleHourChange(e.target.value)}
                  className="w-full h-[48px] px-4 border border-[var(--black-50)] rounded-lg
                           focus:border-[var(--black-500)] focus:outline-none text-[16px]"
                >
                  <option value="">선택</option>
                  {getAvailableHourOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}시
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[var(--black-500)] mb-2">
                  분
                </label>
                <select
                  value={selectedMinute}
                  onChange={(e) => setSelectedMinute(e.target.value)}
                  disabled={!selectedHour}
                  className="w-full h-[48px] px-4 border border-[var(--black-50)] rounded-lg
                           focus:border-[var(--black-500)] focus:outline-none text-[16px]
                           disabled:bg-[var(--black-50)] disabled:cursor-not-allowed"
                >
                  <option value="">선택</option>
                  {getAvailableMinuteOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}분
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 안내 문구 */}
            <p className="text-[12px] text-[var(--black-300)]">
              30분 단위로만 선택 가능합니다
            </p>

            {/* 확인/취소 버튼 */}
            <div className="flex gap-3 pt-2">
              <CommonButton
                onClick={handleConfirm}
                variant="primary"
                className="flex-1"
                disabled={!isValid}
              >
                확인
              </CommonButton>
              <CommonButton
                onClick={handleCancel}
                variant="secondary"
                className="flex-1"
              >
                취소
              </CommonButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

