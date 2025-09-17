import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { getOnboardingStatus } from "../../api/user";
import { resolveNextOnboardingStep } from "../../utils/onboardingStatus";

const Agreement = () => {
  // 체크박스 상태 관리
  const [allChecked, setAllChecked] = useState(false);
  const [checked, setChecked] = useState({
    age: false,
    terms: false,
    privacy: false,
    marketing: false,
  });

  // 전체 동의 체크박스 핸들러
  const handleAllCheck = () => {
    const newValue = !allChecked;
    setAllChecked(newValue);
    setChecked({
      age: newValue,
      terms: newValue,
      privacy: newValue,
      marketing: newValue,
    });
  };

  // 개별 체크박스 핸들러
  const handleCheck = (key) => {
    const newChecked = { ...checked, [key]: !checked[key] };
    setChecked(newChecked);
    setAllChecked(
      newChecked.age && newChecked.terms && newChecked.privacy && newChecked.marketing
    );
  };

  // 필수 항목 모두 체크 시에만 완료 버튼 활성화
  const isRequiredChecked = checked.age && checked.terms && checked.privacy;

  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/", { replace: true });
    }

    if (localStorage.getItem('isNewUser') !== 'true') {
      navigate("/main", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="bg-[#FFFFFF] h-screen max-w-[768px] w-full mx-auto">
        {/* 로고/타이틀 */}
        <Header />
        <div className="pt-[52px] px-[24px]">
        {/* 환영 메시지 */}
        <h1 className="font-bold text-[32px] mb-[12px] leading-[42px]">
          Language Mate에 오신 것을 환영해요!
        </h1>
        <p className="text-gray-500 mb-8">몆 가지 간단한 동의 절차만 거치면 바로 서비스를 시작할 수 있어요.</p>
        {/* 전체 동의 */}
        <div className="mb-6">
          <div className="flex items-center bg-[#F8F9FA] rounded-[6px] p-4">
            <div className="relative w-5 h-5 mr-3 flex items-center justify-center">
              <input
                type="checkbox"
                className={`appearance-none w-5 h-5 rounded-[4px] border cursor-pointer transition ${allChecked ? 'bg-[#00c471] border-[#00c471]' : 'bg-white border-[#ced4da]'}`}
                checked={allChecked}
                onChange={handleAllCheck}
                id="all-agree"
              />
              <svg
                className="absolute left-0 top-0 w-5 h-5 pointer-events-none"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M5 10.5L9 14.5L15 7.5"
                  stroke={allChecked ? "#fff" : "#e0e0e0"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-lg font-bold select-none">전체 동의</span>
          </div>
        </div>
        {/* 개별 약관 체크박스 */}
        <div className="mb-[38px]">
          <div className="flex items-center py-[12px] px-[16px]">
            <div className="relative w-5 h-5 mr-3 flex items-center justify-center">
              <input
                type="checkbox"
                className="appearance-none w-5 h-5 bg-white rounded cursor-pointer"
                checked={checked.age}
                onChange={() => handleCheck("age")}
                id="age-checkbox"
              />
              {/* 체크표시 항상 보이게, 체크 시 #00c471, 아니면 #e0e0e0 */}
              <svg
                className="absolute left-0 top-0 w-5 h-5 pointer-events-none"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M5 10.5L9 14.5L15 7.5"
                  stroke={checked.age ? "#212529" : "#e0e0e0"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-base select-none">만 14세 이상 확인 <span className="text-[#EA4335]">(필수)</span></span>
          </div>
          <div className="flex items-center py-[12px] px-[16px]">
            <div className="relative w-5 h-5 mr-3 flex items-center justify-center">
              <input
                type="checkbox"
                className="appearance-none w-5 h-5 bg-white rounded cursor-pointer"
                checked={checked.terms}
                onChange={() => handleCheck("terms")}
                id="terms-checkbox"
              />
              {/* 체크표시 항상 보이게, 체크 시 #00c471, 아니면 #e0e0e0 */}
              <svg
                className="absolute left-0 top-0 w-5 h-5 pointer-events-none"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M5 10.5L9 14.5L15 7.5"
                  stroke={checked.terms ? "#212529" : "#e0e0e0"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-base select-none">서비스 이용약관 동의 <span className="text-[#EA4335]">(필수)</span></span>
          </div>
          <div className="flex items-center py-[12px] px-[16px]">
            <div className="relative w-5 h-5 mr-3 flex items-center justify-center">
              <input
                type="checkbox"
                className="appearance-none w-5 h-5 bg-white rounded cursor-pointer"
                checked={checked.privacy}
                onChange={() => handleCheck("privacy")}
                id="privacy-checkbox"
              />
              {/* 체크표시 항상 보이게, 체크 시 #00c471, 아니면 #e0e0e0 */}
              <svg
                className="absolute left-0 top-0 w-5 h-5 pointer-events-none"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M5 10.5L9 14.5L15 7.5"
                  stroke={checked.privacy ? "#212529" : "#e0e0e0"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-base select-none">개인정보 처리 방침 동의 <span className="text-[#EA4335]">(필수)</span></span>
          </div>
          <div className="flex items-center py-[12px] px-[16px] ">
            <div className="relative w-5 h-5 mr-3 flex items-center justify-center">
              <input
                type="checkbox"
                className="appearance-none w-5 h-5 bg-white rounded cursor-pointer"
                checked={checked.marketing}
                onChange={() => handleCheck("marketing")}
                id="marketing-checkbox"
              />
              {/* 체크표시 항상 보이게, 체크 시 #00c471, 아니면 #e0e0e0 */}
              <svg
                className="absolute left-0 top-0 w-5 h-5 pointer-events-none"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M5 10.5L9 14.5L15 7.5"
                  stroke={checked.marketing ? "#212529" : "#e0e0e0"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-base select-none">마케팅 및 광고 수신 동의 <span className="text-gray-400">(선택)</span></span>
          </div>
        </div>
        {/* 개인정보 수집 안내 */}
        <div className="bg-green-50 border border-green-100 rounded-lg p-6 mb-[81px] flex flex-col gap-3">
          <div className="font-semibold mb-2">개인정보 수집 이용 동의</div>
          <div className="text-sm mb-1">저는 ‘Language Mate’가 아래 항목의 개인정보를 수집 이용하는 것에 동의합니다.</div>
          <ul className="text-sm list-disc pl-5 mb-1 space-y-2">
            <li>이름, 이메일, 언어선호 등 기본 프로필</li>
            <li>서비스 제공과 매칭을 위한 이용 정보</li>
          </ul>
          <div className="text-sm text-gray-700">자세한 내용은 <span className="underline cursor-pointer text-[#4285F4]">개인정보 처리 방침</span>에서 확인할 수 있습니다.</div>
        </div>
        {/* 완료 버튼 */}
        <button
          className={`w-full py-3 rounded-lg font-bold text-lg transition-colors ${
            isRequiredChecked
              ? "bg-[#111111] text-white cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-default pointer-events-none"
          }`}
          disabled={!isRequiredChecked}
          onClick={async () => {
            if (isRequiredChecked) {
              try {
                // 온보딩 상태 확인
                const onboardingStatus = await getOnboardingStatus();
                
                if (!onboardingStatus.isCompleted) {
                  // 온보딩 미완료 시 바로 온보딩 페이지로
                  const nextStep = resolveNextOnboardingStep(onboardingStatus);
                  navigate(`/onboarding-info/${nextStep}`, { replace: true });
                } else {
                  // 온보딩 완료 시 메인 페이지로
                  navigate("/main", { replace: true });
                }
              } catch (error) {
                console.error("온보딩 상태 확인 실패:", error);
                // 오류 시 기존 플로우 유지 (signup-complete로)
                navigate("/signup-complete");
              }
            }
          }}
        >
          완료
        </button>
        </div>
      </div>

  );
};

export default Agreement; 
