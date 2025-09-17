import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { getOnboardingStatus } from '../api/user';
import { AppError, ERROR_TYPES } from '../utils/errorHandler';
import { resolveNextOnboardingStep } from '../utils/onboardingStatus';

/**
 * OnboardingProtectedRoute 컴포넌트
 * 로그인 체크 + 온보딩 완료 체크를 함께 수행
 * 온보딩이 완료되지 않았으면 온보딩 페이지로 리다이렉트
 */
export default function OnboardingProtectedRoute({ children }) {
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        console.log('🔍 온보딩 상태 확인 중...');
        const status = await getOnboardingStatus();
        console.log('🔍 온보딩 상태:', status);
        setOnboardingStatus(status);
      } catch (error) {
        console.error('🔍 온보딩 상태 확인 실패:', error);

        const originalError = error instanceof AppError
          ? error.details?.originalError ?? null
          : error;
        const status = error?.response?.status
          ?? (error instanceof AppError ? error.statusCode : undefined)
          ?? originalError?.response?.status;
        const errorType = error instanceof AppError ? error.type : undefined;

        const hasAnyToken = Boolean(localStorage.getItem('accessToken') || localStorage.getItem('refreshToken'));

        if (!hasAnyToken) {
          console.log('🔍 저장된 토큰 없음 - 인증 상태 해제');
          setError('AUTH_ERROR');
        } else if (
          error.message &&
          (error.message.includes('refresh token') || error.message.includes('로그인이 필요'))
        ) {
          console.log('🔍 토큰 오류 메시지 감지 - 인증 에러 처리');
          setError('AUTH_ERROR');
        } else if (status === 404) {
          console.log('🔍 온보딩 미시작 - 온보딩 페이지로 이동');
          setOnboardingStatus({ isCompleted: false, nextStep: 1 });
        } else if (
          status === 401 ||
          status === 403 ||
          errorType === ERROR_TYPES.AUTH ||
          errorType === ERROR_TYPES.PERMISSION
        ) {
          console.log('🔍 인증 에러 감지 - 로그인 페이지로 이동 예정');
          setError('AUTH_ERROR');
        } else {
          // 기타 에러 (서버 에러 등)
          console.error('🔍 온보딩 API 오류');
          setError('API_ERROR');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, []);

  // ProtectedRoute로 먼저 로그인 체크를 수행
  return (
    <ProtectedRoute>
      {/* 로그인이 되어있는 상태에서만 이 부분이 실행됨 */}
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C471] mx-auto"></div>
            <p className="mt-4 text-[#929292]">온보딩 상태 확인 중...</p>
          </div>
        </div>
      ) : error === 'AUTH_ERROR' ? (
        <Navigate to="/" replace />
      ) : error === 'API_ERROR' ? (
        // API 에러시 기본 온보딩 페이지로
        <Navigate to="/onboarding-info/1" replace />
      ) : onboardingStatus && !onboardingStatus.isCompleted ? (
        // 온보딩이 완료되지 않았으면 해당 단계로 이동
        <Navigate
          to={`/onboarding-info/${resolveNextOnboardingStep(onboardingStatus)}`}
          replace
        />
      ) : (
        // 온보딩이 완료되었으면 자식 컴포넌트 렌더링
        children
      )}
    </ProtectedRoute>
  );
}
