import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/index";
import useProfileStore from "../../store/profileStore";
import { getOnboardingStatus } from "../../api/user";
import { resolveNextOnboardingStep } from "../../utils/onboardingStatus";
import { setTokens, logTokenState } from "../../utils/tokenStorage";

// JWT 토큰 형식 검증 함수
const isValidJWT = (token) => {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

export default function GoogleCallback() {
  const [message, setMessage] = useState("Google 로그인 처리 중...");
  const navigate = useNavigate();

  const navigateAfterLogin = useCallback(async () => {
    try {
      if (localStorage.getItem('isNewUser') === 'true') {
        navigate("/agreement", { replace: true });
        return;
      }

      const onboardingStatus = await getOnboardingStatus();
      if (!onboardingStatus.isCompleted) {
        const nextStep = resolveNextOnboardingStep(onboardingStatus);
        navigate(`/onboarding-info/${nextStep}`, { replace: true });
        return;
      }

      const redirectPath = sessionStorage.getItem("redirectPath");
      if (redirectPath) {
        sessionStorage.removeItem("redirectPath");
        navigate(redirectPath, { replace: true });
      } else {
        navigate("/main", { replace: true });
      }
    } catch (error) {
      console.error("사용자 상태 확인 실패:", error);
      navigate("/agreement", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");
    const errorDescription = params.get("error_description");

    // 콘솔로 토큰과 기타 파라미터들 찍기
    console.log("Google 콜백 accessToken:", accessToken);
    logTokenState('google:init');
    console.log("Google 콜백 refreshToken:", refreshToken);
    console.log("Google 콜백 code:", code);
    console.log("Google 콜백 state:", state);
    
    if (error) {
      console.log("Google 콜백 error:", error, errorDescription);
      setMessage("Google 로그인 실패: " + (errorDescription || error));
    } else if (accessToken && refreshToken) {
      // 토큰 형식 검증
      if (!isValidJWT(accessToken)) {
        console.error("🔍 ❌ Invalid accessToken format from URL params");
        setMessage("토큰 형식 오류: 다시 로그인해주세요.");
        setTimeout(() => navigate("/", { replace: true }), 3000);
        return;
      }

      if (!isValidJWT(refreshToken)) {
        console.error("🔍 ❌ Invalid refreshToken format from URL params");
        setMessage("토큰 형식 오류: 다시 로그인해주세요.");
        setTimeout(() => navigate("/", { replace: true }), 3000);
        return;
      }

      // 백엔드에서 토큰을 직접 전달받은 경우
      setTokens({ accessToken, refreshToken });
      logTokenState('google:after-setTokens:url');
      setMessage("Google 로그인 성공! 사용자 정보를 가져오는 중...");
      
      const fetchUserInfo = async () => {
        try {
          const nameRes = await api.get("/user/name");
          const setName = useProfileStore.getState().setName;
          const fetchedName = nameRes?.data?.name;

          if (typeof fetchedName === "string" && fetchedName.trim().length > 0) {
            setName(fetchedName);
            localStorage.setItem("userName", fetchedName);
            console.log("유저 이름 저장 완료:", fetchedName);
          } else {
            setName("");
            localStorage.removeItem("userName");
            console.warn("유저 이름이 응답에 없어 기본값으로 초기화했습니다.");
          }
          
          setMessage("Google 로그인 성공! 이동 중...");
          await navigateAfterLogin();
        } catch (e) {
          console.error("유저 정보 불러오기 실패:", e);
          setMessage("로그인 완료되었지만 사용자 정보를 가져오지 못했습니다.");
          setTimeout(() => {
            navigate("/agreement", { replace: true });
          }, 2000);
        }
      };
      fetchUserInfo();
    } else if (code && state) {
      // 기존 방식 (code를 통한 토큰 교환)
      const fetchTokens = async () => { 
        try {
          const url = `/auth/callback/google?code=${code}&state=${state}`;
          console.log("백엔드 요청 URL:", url);

          const res = await api.get(url);
          console.log("백엔드 응답:", res.data);

          if (res.data && res.data.accessToken && res.data.refreshToken) {
            // 서버 응답 토큰 형식 검증
            if (!isValidJWT(res.data.accessToken)) {
              console.error("🔍 ❌ Invalid accessToken format from server response");
              setMessage("토큰 형식 오류: 다시 로그인해주세요.");
              setTimeout(() => navigate("/", { replace: true }), 3000);
              return;
            }

            if (!isValidJWT(res.data.refreshToken)) {
              console.error("🔍 ❌ Invalid refreshToken format from server response");
              setMessage("토큰 형식 오류: 다시 로그인해주세요.");
              setTimeout(() => navigate("/", { replace: true }), 3000);
              return;
            }

            setTokens({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken });
            logTokenState('google:after-setTokens:fetch');
            if (typeof res.data.name === "string" && res.data.name.trim().length > 0) {
              localStorage.setItem("userName", res.data.name);
            } else {
              localStorage.removeItem("userName");
            }
            if (typeof res.data.isNewUser !== 'undefined') {
              localStorage.setItem('isNewUser', String(res.data.isNewUser));
            }
            
            try {
              const nameRes = await api.get("/user/name");
              const fetchedName = nameRes?.data?.name;
              const setName = useProfileStore.getState().setName;

              if (typeof fetchedName === "string" && fetchedName.trim().length > 0) {
                setName(fetchedName);
                localStorage.setItem("userName", fetchedName);
                console.log("유저 이름 저장 완료:", fetchedName);
              } else {
                setName("");
                localStorage.removeItem("userName");
                console.warn("유저 이름이 응답에 없어 기본값으로 초기화했습니다.");
              }
            } catch (e) {
              console.error("유저 이름 불러오기 실패:", e);
            }

            setMessage("Google 로그인 성공! 이동 중...");
            await navigateAfterLogin();
          } else {
            setMessage("토큰을 받아오지 못했습니다.");
          }
        } catch (e) {
          console.error("토큰 요청 실패:", e);
          setMessage("토큰 요청 실패: " + (e.response?.data?.message || e.message));
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 3000);
        }
      };
      fetchTokens();
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white max-w-[768px] w-full mx-auto">
      <h2 className="text-2xl font-bold mb-4">{message}</h2>
    </div>
  );
}
