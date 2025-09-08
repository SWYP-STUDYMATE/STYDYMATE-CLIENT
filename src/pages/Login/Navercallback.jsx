import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/index";
import useProfileStore from "../../store/profileStore";
import { getOnboardingStatus } from "../../api/user";

export default function Navercallback() {
  const [message, setMessage] = useState("네이버 로그인 처리 중...");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔍 네이버 콜백 페이지 로드됨");
    console.log("🔍 현재 URL:", window.location.href);
    
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");
    const errorDescription = params.get("error_description");

    // 콘솔로 토큰과 기타 파라미터들 찍기
    console.log("🔍 네이버 콜백 accessToken:", accessToken);
    console.log("🔍 네이버 콜백 refreshToken:", refreshToken);
    console.log("🔍 네이버 콜백 code:", code);
    console.log("🔍 네이버 콜백 state:", state);
    
    if (error) {
      console.log("🔍 네이버 콜백 error:", error, errorDescription);
      setMessage("네이버 로그인 실패: " + (errorDescription || error));
    } else if (accessToken && refreshToken) {
      console.log("🔍 토큰이 URL 파라미터로 전달됨, 처리 시작");
      // 백엔드에서 토큰을 직접 전달받은 경우
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setMessage("네이버 로그인 성공! 사용자 정보를 가져오는 중...");
      
      const fetchUserInfo = async () => {
        try {
          const nameRes = await api.get("/user/name");
          const setName = useProfileStore.getState().setName;
          setName(nameRes.data.name);
          localStorage.setItem("userName", nameRes.data.name);
          console.log("유저 이름 저장 완료:", nameRes.data.name);
          
          setMessage("네이버 로그인 성공! 이동 중...");
          setTimeout(async () => {
            try {
              // 신규 사용자인지 확인
              if (localStorage.getItem('isNewUser') === 'true') {
                navigate("/agreement", { replace: true });
              } else {
                // 기존 사용자라면 온보딩 상태 확인
                const onboardingStatus = await getOnboardingStatus();
                if (!onboardingStatus.isCompleted) {
                  const nextStep = onboardingStatus.nextStep || 1;
                  navigate(`/onboarding-info/${nextStep}`, { replace: true });
                } else {
                  navigate("/main", { replace: true });
                }
              }
            } catch (error) {
              console.error("사용자 상태 확인 실패:", error);
              navigate("/agreement", { replace: true });
            }
          }, 2000);
        } catch (e) {
          console.error("🔍 유저 정보 불러오기 실패:", e);
          console.error("🔍 에러 상세:", e.response?.data, e.message);
          setMessage("로그인 완료되었지만 사용자 정보를 가져오지 못했습니다.");
          setTimeout(() => {
            navigate("/agreement", { replace: true });
          }, 2000);
        }
      };
      fetchUserInfo();
    } else if (code && state) {
      const fetchTokens = async () => { 
        try {
          // 백엔드 요청 URL도 콘솔에 찍기
          const url = `/login/oauth2/code/naver?code=${code}&state=${state}`;
          console.log("백엔드 요청 URL:", url);

          const res = await api.get(url);
          // 백엔드 응답 전체 콘솔에 찍기
          console.log("백엔드 응답:", res.data);

          if (res.data && res.data.accessToken && res.data.refreshToken) {
            localStorage.setItem("accessToken", res.data.accessToken);
            localStorage.setItem("refreshToken", res.data.refreshToken);
            if (res.data.name) {
              localStorage.setItem("userName", res.data.name);
            }
            if (typeof res.data.isNewUser !== 'undefined') {
              localStorage.setItem('isNewUser', String(res.data.isNewUser));
            }
            // 유저 이름을 zustand에 저장 (동기화)
            try {
              const nameRes = await api.get("/user/name");
              const setName = useProfileStore.getState().setName;
              setName(nameRes.data.name);
              console.log("유저 이름 저장 완료:", nameRes.data.name);
            } catch (e) {
              console.error("유저 이름 불러오기 실패:", e);
            }
            setMessage("네이버 로그인 성공! 이동 중...");
            setTimeout(async () => {
              try {
                // 신규 사용자인지 확인
                if (localStorage.getItem('isNewUser') === 'true') {
                  navigate("/agreement", { replace: true });
                } else {
                  // 기존 사용자라면 온보딩 상태 확인
                  const onboardingStatus = await getOnboardingStatus();
                  if (!onboardingStatus.isCompleted) {
                    const nextStep = onboardingStatus.nextStep || 1;
                    navigate(`/onboarding-info/${nextStep}`, { replace: true });
                  } else {
                    navigate("/main", { replace: true });
                  }
                }
              } catch (error) {
                console.error("사용자 상태 확인 실패:", error);
                navigate("/agreement", { replace: true });
              }
            }, 2000);
          } else {
            setMessage("토큰을 받아오지 못했습니다.");
          }
        } catch (e) {
          // 에러 객체도 콘솔에 찍기
          console.error("토큰 요청 실패:", e);
          setMessage("토큰 요청 실패: " + (e.response?.data?.message || e.message));
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 3000);
        }
      };
      fetchTokens();
    } else {
      console.log("🔍 어떤 조건도 만족하지 않음");
      console.log("🔍 조건 체크:");
      console.log("  error:", !!error);
      console.log("  accessToken && refreshToken:", !!(accessToken && refreshToken));
      console.log("  code && state:", !!(code && state));
      setMessage("오류가 발생했습니다. 다시 시도해주세요.");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 3000);
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white max-w-[768px] w-full mx-auto">
      <h2 className="text-2xl font-bold mb-4">{message}</h2>
    </div>
  );
}