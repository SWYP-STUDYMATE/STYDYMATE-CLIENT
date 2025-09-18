import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { getOnboardingStatus } from '../api/user';
import { AppError, ERROR_TYPES } from '../utils/errorHandler';
import { resolveNextOnboardingStep } from '../utils/onboardingStatus';
import { log } from '../utils/logger';

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
      const startedAt = performance.now();
      log.info('온보딩 상태 조회 시작', {
        path: window.location.pathname,
        hasAccessToken: Boolean(localStorage.getItem('accessToken')),
        hasRefreshToken: Boolean(localStorage.getItem('refreshToken'))
      }, 'ONBOARDING_GUARD');

      try {
        const status = await getOnboardingStatus();

        log.info('온보딩 상태 조회 성공', {
          durationMs: Math.round(performance.now() - startedAt),
          response: status
        }, 'ONBOARDING_GUARD');

        setOnboardingStatus(status);
      } catch (error) {
        const diagnostics = buildOnboardingErrorDiagnostics(error);

        log.error('온보딩 상태 조회 실패', diagnostics, 'ONBOARDING_GUARD');

        if (!diagnostics.hasAnyToken) {
          setError('AUTH_ERROR');
        } else if (diagnostics.indicatesTokenIssue) {
          setError('AUTH_ERROR');
        } else if (diagnostics.status === 404) {
          log.warn('온보딩 미완료 상태 감지 - 온보딩 플로우로 이동', diagnostics, 'ONBOARDING_GUARD');
          setOnboardingStatus({ isCompleted: false, nextStep: 1 });
        } else if (
          diagnostics.status === 401 ||
          diagnostics.status === 403 ||
          diagnostics.errorType === ERROR_TYPES.AUTH ||
          diagnostics.errorType === ERROR_TYPES.PERMISSION
        ) {
          setError('AUTH_ERROR');
        } else {
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
        // API 에러시 에러 메시지 표시
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
          <div className="text-center max-w-md">
            <img
              src="/images/error-icon.svg"
              alt="Error"
              className="w-20 h-20 mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-[#111111] mb-2">
              문제가 발생했습니다
            </h2>
            <p className="text-[#929292] mb-6">
              오류가 발생했습니다. 다시 시도해주세요.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-6 bg-[#111111] text-white rounded-lg hover:bg-[#414141] transition-colors"
              >
                다시 시도
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-3 px-6 bg-[#E7E7E7] text-[#111111] rounded-lg hover:bg-[#B5B5B5] transition-colors"
              >
                홈으로 이동
              </button>
            </div>
          </div>
        </div>
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

function buildOnboardingErrorDiagnostics(error) {
  const originalError = error instanceof AppError
    ? error.details?.originalError ?? null
    : error;

  const status = error?.response?.status
    ?? (error instanceof AppError ? error.statusCode : undefined)
    ?? originalError?.response?.status;

  const errorType = error instanceof AppError ? error.type : undefined;

  const responseBody = error?.response?.data ?? originalError?.response?.data ?? null;
  const requestConfig = error?.config ?? originalError?.config ?? null;

  const hasAccessToken = Boolean(localStorage.getItem('accessToken'));
  const hasRefreshToken = Boolean(localStorage.getItem('refreshToken'));
  const hasAnyToken = hasAccessToken || hasRefreshToken;

  const message = error?.message || originalError?.message;
  const indicatesTokenIssue = Boolean(
    message && (
      message.includes('refresh token') ||
      message.includes('로그인이 필요') ||
      message.toLowerCase().includes('token')
    )
  );

  return {
    status,
    errorType,
    message,
    responseBody,
    request: requestConfig ? {
      method: requestConfig.method,
      url: requestConfig.url,
      baseURL: requestConfig.baseURL
    } : null,
    hasAccessToken,
    hasRefreshToken,
    hasAnyToken,
    indicatesTokenIssue,
    stack: error?.stack || originalError?.stack || null
  };
}
