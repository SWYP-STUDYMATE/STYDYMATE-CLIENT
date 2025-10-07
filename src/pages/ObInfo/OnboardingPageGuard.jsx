import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOnboardingStatus } from "../../api/user";
import { getToken, removeToken } from "../../utils/tokenStorage";

const STATUS = {
  LOADING: "loading",
  READY: "ready",
  ERROR: "error"
};

export default function OnboardingPageGuard({ children }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState(STATUS.LOADING);

  useEffect(() => {
    const accessToken = getToken("accessToken");
    if (!accessToken) {
      const refreshToken = getToken("refreshToken");
      if (refreshToken) {
        removeToken('refreshToken');
      }
      console.log('[OnboardingPageGuard] accessToken missing -> redirect home');
      navigate("/", { replace: true });
      return;
    }

    const checkOnboarding = async () => {
      try {
        const onboardingStatus = await getOnboardingStatus();
        console.log('[OnboardingPageGuard] onboardingStatus', onboardingStatus);
        if (onboardingStatus?.isCompleted) {
          navigate("/main", { replace: true });
          return;
        }

        setStatus(STATUS.READY);
      } catch (error) {
        console.log('[OnboardingPageGuard] error requesting status', error);
        const statusCode = error?.statusCode || error?.response?.status;
        if (statusCode === 401 || statusCode === 403) {
          console.log('[OnboardingPageGuard] unauthorized -> redirect home');
          navigate("/", { replace: true });
          return;
        }

        if (statusCode === 404) {
          console.log('[OnboardingPageGuard] status 404 -> onboarding step 1');
          navigate(`/onboarding-info/1`, { replace: true });
          return;
        }

        setStatus(STATUS.ERROR);
      }
    };

    checkOnboarding();
  }, [navigate]);

  if (status === STATUS.LOADING) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C471] mx-auto"></div>
          <p className="mt-4 text-[#929292]">온보딩 상태 확인 중...</p>
        </div>
      </div>
    );
  }

  if (status === STATUS.ERROR) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-[#111111] mb-2">문제가 발생했습니다</h2>
          <p className="text-[#929292] mb-6">온보딩 정보를 가져오는데 실패했습니다. 잠시 후 다시 시도해 주세요.</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-6 bg-[#111111] text-white rounded-lg hover:bg-[#414141] transition-colors"
            >
              다시 시도
            </button>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full py-3 px-6 bg-[#E7E7E7] text-[#111111] rounded-lg hover:bg-[#B5B5B5] transition-colors"
            >
              홈으로 이동
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
