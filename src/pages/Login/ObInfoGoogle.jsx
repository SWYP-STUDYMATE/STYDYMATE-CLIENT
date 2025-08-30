import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import Header from '../../components/Header';
import CommonButton from '../../components/CommonButton';
import commonSelectStyles from '../../components/SelectStyles';
import api from '../../api';

// ObInfoGoogle 전용 드롭박스 스타일 (가운데 정렬 포함)
const googleSelectStyles = {
  ...commonSelectStyles,
  placeholder: (base) => ({
    ...base,
    color: "#929292",
    fontWeight: 500,
    textAlign: "center",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#111111",
    fontWeight: 500,
    textAlign: "center",
  }),
};

const ObInfoGoogle = () => {
  const navigate = useNavigate();
  
  // 상태 관리
  const [gender, setGender] = useState('');
  const [selectedGenderType, setSelectedGenderType] = useState(null); // API 전송용 genderType 저장
  const [genderTypes, setGenderTypes] = useState([]);
  const [birthYear, setBirthYear] = useState(null);
  const [birthMonth, setBirthMonth] = useState(null);
  const [birthDay, setBirthDay] = useState(null);
  const [agreements, setAgreements] = useState({
    age14: false,
    service: false,
    privacy: false,
    marketing: false
  });
  const [selectAll, setSelectAll] = useState(false);

  // 성별 타입 가져오기
  useEffect(() => {
    const fetchGenderTypes = async () => {
      try {
        const response = await api.get('/user/gender-type');
        // API 응답이 객체 배열인 경우 {name, description} 구조 처리
        const genderOptions = Array.isArray(response.data) 
          ? response.data.map(item => ({
              name: item.name,
              description: item.description
            }))
          : [
              { name: 'MALE', description: '남성' },
              { name: 'FEMALE', description: '여성' },
              { name: 'NONE', description: '없음' }
            ];
        setGenderTypes(genderOptions);
      } catch (error) {
        console.error('성별 타입을 가져오는데 실패했습니다:', error);
        // 기본값 설정
        setGenderTypes([
          { name: 'MALE', description: '남성' },
          { name: 'FEMALE', description: '여성' },
          { name: 'NONE', description: '없음' }
        ]);
      }
    };

    fetchGenderTypes();
  }, []);

  // 생년월일 옵션 생성
  const years = Array.from({ length: 100 }, (_, i) => ({
    value: 2024 - i,
    label: (2024 - i).toString()
  }));
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: (i + 1).toString()
  }));
  const days = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: (i + 1).toString()
  }));

  // 전체 동의 처리
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setAgreements({
      age14: checked,
      service: checked,
      privacy: checked,
      marketing: checked
    });
  };

  // 개별 동의 처리
  const handleAgreementChange = (key, checked) => {
    const newAgreements = { ...agreements, [key]: checked };
    setAgreements(newAgreements);
    
    // 모든 필수 항목이 체크되었는지 확인
    const allRequiredChecked = newAgreements.age14 && newAgreements.service && newAgreements.privacy;
    setSelectAll(allRequiredChecked && newAgreements.marketing);
  };

  // 완료 버튼 활성화 조건
  const isCompleteEnabled = () => {
    return gender && birthYear && birthMonth && birthDay && 
           agreements.age14 && agreements.service && agreements.privacy;
  };

  const handleComplete = async () => {
    if (isCompleteEnabled()) {
      try {
        // 1. 성별 저장 API 호출
        await api.post('/user/gender', {
          genderType: selectedGenderType // API 명세서에 따라 name 값 사용
        });

        // 2. 출생 연도 저장 API 호출
        await api.post('/user/birthyear', {
          birthyear: birthYear.value.toString()
        });

        // 3. 생일 저장 API 호출 (MM-DD 형식)
        const month = birthMonth.value.toString().padStart(2, '0');
        const day = birthDay.value.toString().padStart(2, '0');
        await api.post('/user/birthday', {
          birthday: `${month}-${day}`
        });

        console.log('회원가입 완료:', {
          gender: selectedGenderType,
          birthYear: birthYear.value,
          birthMonth: birthMonth.value,
          birthDay: birthDay.value,
          agreements
        });

        navigate('/signup-complete');
      } catch (error) {
        console.error('회원가입 중 오류가 발생했습니다:', error);
        alert('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <div className="bg-[#FFFFFF] h-screen max-w-[768px] w-full mx-auto">
      <Header />
      <div className="mx-auto mt-[52px] max-w-[720px] w-full">
        {/* 제목 */}
        <div className="mb-[24px]">
          <h1 className="text-[32px] font-bold text-[#111111] mb-[12px] leading-[42px] tracking-[-0.8px]">
            Language Mate에 오신 것을 환영해요!
          </h1>
          <p className="text-[16px] text-[#767676] leading-[24px] tracking-[-0.4px]">
            몇 가지 간단한 로그인 절차만 거치면 바로 서비스를 시작할 수 있어요.
          </p>
        </div>

        {/* 성별 선택 */}
        <div className="mb-[32px]">
          <label className="block text-[16px] font-bold text-[#343a40] mb-[16px] leading-[24px] tracking-[-0.4px]">
            성별
          </label>
          <div className="flex gap-[16px]">
            {genderTypes.map((option, index) => (
              <button
                key={index} // Changed key to index to ensure uniqueness
                onClick={() => {
                  setGender(option.description);
                  setSelectedGenderType(option.name); // API 전송용 name 값 저장
                }}
                className={`flex-1 h-[56px] px-[16px] border rounded-[6px] text-[16px] font-medium transition-colors ${
                  gender === option.description
                    ? 'border-[#ced4da] bg-white text-[#111111]'
                    : 'border-[#ced4da] bg-white text-[#868e96] hover:bg-[#F7F7FB]'
                }`}
              >
                {option.description}
              </button>
            ))}
          </div>
        </div>

        {/* 생년월일 선택 */}
        <div className="mb-[32px]">
          <label className="block text-[16px] font-bold text-[#343a40] mb-[16px] leading-[24px] tracking-[-0.4px]">
            생년월일
          </label>
          <div className="flex gap-[16px]">
            <div className="flex-1">
              <Select
                value={birthYear}
                onChange={setBirthYear}
                options={years}
                placeholder="출생 연도"
                styles={googleSelectStyles}
                isSearchable={false}
              />
            </div>
            <div className="flex-1">
              <Select
                value={birthMonth}
                onChange={setBirthMonth}
                options={months}
                placeholder="월"
                styles={googleSelectStyles}
                isSearchable={false}
              />
            </div>
            <div className="flex-1">
              <Select
                value={birthDay}
                onChange={setBirthDay}
                options={days}
                placeholder="일"
                styles={googleSelectStyles}
                isSearchable={false}
              />
            </div>
          </div>
        </div>

        {/* 약관 동의 */}
        <div className="mb-[110px]">
          {/* 전체 동의 */}
          <div className="mb-[16px] p-[16px] bg-[#f8f9fa] rounded-[6px]">
            <div className="flex items-center">
              <div className="relative w-5 h-5 mr-3 flex items-center justify-center">
                <input
                  type="checkbox"
                  className={`appearance-none w-5 h-5 rounded-[4px] border cursor-pointer transition ${selectAll ? 'bg-[#00c471] border-[#00c471]' : 'bg-white border-[#ced4da]'}`}
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <svg
                  className="absolute left-0 top-0 w-5 h-5 pointer-events-none"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M5 10.5L9 14.5L15 7.5"
                    stroke={selectAll ? "#fff" : "#e0e0e0"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-lg font-bold select-none">전체 동의</span>
            </div>
          </div>

          {/* 개별 동의 항목 */}
          <div>
            {[
              { key: 'age14', label: '만 14세 이상 확인', required: true },
              { key: 'service', label: '서비스 이용약관 동의', required: true },
              { key: 'privacy', label: '개인정보 처리 방침 동의', required: true },
              { key: 'marketing', label: '마케팅 및 광고 수신 동의', required: false }
            ].map(({ key, label, required }) => (
              <div key={key} className="flex items-center py-[12px] px-[16px]">
                <div className="relative w-5 h-5 mr-3 flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="appearance-none w-5 h-5 bg-white rounded cursor-pointer"
                    checked={agreements[key]}
                    onChange={(e) => handleAgreementChange(key, e.target.checked)}
                  />
                  <svg
                    className="absolute left-0 top-0 w-5 h-5 pointer-events-none"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M5 10.5L9 14.5L15 7.5"
                      stroke={agreements[key] ? "#212529" : "#e0e0e0"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-base select-none">
                  {label} <span className={required ? "text-[#EA4335]" : "text-gray-400"}>({required ? '필수' : '선택'})</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 완료 버튼 */}
        <CommonButton 
          text="완료" 
          disabled={!isCompleteEnabled()} 
          onClick={handleComplete} 
        />
      </div>
    </div>
  );
};

export default ObInfoGoogle; 