import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOnboardingStatus } from '../api/user';
import { AppError, ERROR_TYPES } from '../utils/errorHandler';
import { resolveNextOnboardingStep } from '../utils/onboardingStatus';
import { log } from '../utils/logger';
import { getToken, removeToken, isAutoLoginEnabled } from '../utils/tokenStorage';
import { toast } from './toast-manager.jsx';

/**
 * OnboardingProtectedRoute 컴포넌트
 * 로그인 체크 + 온보딩 완료 체크를 함께 수행
 * 온보딩이 완료되지 않았으면 온보딩 페이지로 리다이렉트
 */
export default function OnboardingProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [state, setState] = useState({
    isAuthenticated: null,
    onboardingStatus: null,
    isLoading: true,
    error: null,
  });
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // 중복 실행 방지
    if (hasFetchedRef.current) {
      console.log('🔒 OnboardingProtectedRoute: 이미 체크 완료, 스킵');
      return;
    }

    const checkAuthAndOnboarding = async () => {
      hasFetchedRef.current = true;
      console.log('🔒 OnboardingProtectedRoute: 체크 시작');

      // 1단계: 인증 체크 (ProtectedRoute 로직 통합)
      try {
        const accessToken = getToken('accessToken');
        const refreshToken = getToken('refreshToken');
        const autoLogin = isAutoLoginEnabled();

        // JWT 형식 검증
        const isValidJWT = (token) => {
          if (!token || typeof token !== 'string') return false;
          const parts = token.split('.');
          return parts.length === 3 && parts.every(part => part.length > 0);
        };

        const decodePayload = (token) => {
          try {
            const base64 = token.split('.')[1];
            return JSON.parse(atob(base64));
          } catch {
            return null;
          }
        };

        const isExpired = (token) => {
          const payload = decodePayload(token);
          if (!payload?.exp) return true;
          return payload.exp * 1000 <= Date.now();
        };

        // 토큰 검증
        if (!accessToken && !refreshToken) {
          console.log('🔒 OnboardingProtectedRoute: 토큰 없음');
          setState({
            isAuthenticated: false,
            onboardingStatus: null,
            isLoading: false,
            error: null,
          });
          return;
        }

        const accessTokenValid = accessToken && isValidJWT(accessToken) && !isExpired(accessToken);
        const refreshTokenValid = refreshToken && isValidJWT(refreshToken) && !isExpired(refreshToken);

        if (!accessTokenValid && !refreshTokenValid) {
          console.log('🔒 OnboardingProtectedRoute: 유효한 토큰 없음');
          removeToken('accessToken');
          removeToken('refreshToken');
          setState({
            isAuthenticated: false,
            onboardingStatus: null,
            isLoading: false,
            error: null,
          });
          return;
        }

        if (!autoLogin && !accessToken) {
          console.log('🔒 OnboardingProtectedRoute: 자동 로그인 해제 상태');
          removeToken('refreshToken');
          setState({
            isAuthenticated: false,
            onboardingStatus: null,
            isLoading: false,
            error: null,
          });
          return;
        }

        // 인증 성공
        console.log('✅ OnboardingProtectedRoute: 인증됨');

        // 2단계: 온보딩 상태 체크
        const startedAt = performance.now();
        log.info('온보딩 상태 조회 시작', {
          path: window.location.pathname,
          hasAccessToken: Boolean(accessToken),
          hasRefreshToken: Boolean(refreshToken)
        }, 'ONBOARDING_GUARD');

        try {
          const status = await getOnboardingStatus();

          log.info('온보딩 상태 조회 성공', {
            durationMs: Math.round(performance.now() - startedAt),
            response: status
          }, 'ONBOARDING_GUARD');

          console.log('✅ OnboardingProtectedRoute: 체크 완료');

          setState({
            isAuthenticated: true,
            onboardingStatus: status,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const diagnostics = buildOnboardingErrorDiagnostics(error);
          log.error('온보딩 상태 조회 실패', diagnostics, 'ONBOARDING_GUARD');

          if (!diagnostics.hasAnyToken) {
            setState({
              isAuthenticated: true,
              onboardingStatus: null,
              isLoading: false,
              error: 'AUTH_ERROR',
            });
          } else if (diagnostics.indicatesTokenIssue) {
            setState({
              isAuthenticated: true,
              onboardingStatus: null,
              isLoading: false,
              error: 'AUTH_ERROR',
            });
          } else if (diagnostics.status === 404) {
            log.warn('온보딩 미완료 상태 감지', diagnostics, 'ONBOARDING_GUARD');
            setState({
              isAuthenticated: true,
              onboardingStatus: { isCompleted: false, nextStep: 1 },
              isLoading: false,
              error: null,
            });
          } else if (typeof diagnostics.status === 'number' && diagnostics.status >= 500) {
            log.warn('온보딩 상태 조회 서버 오류', diagnostics, 'ONBOARDING_GUARD');
            setState({
              isAuthenticated: true,
              onboardingStatus: { isCompleted: false, nextStep: 1, inferredFromError: true },
              isLoading: false,
              error: null,
            });
          } else if (
            diagnostics.status === 401 ||
            diagnostics.status === 403 ||
            diagnostics.errorType === ERROR_TYPES.AUTH ||
            diagnostics.errorType === ERROR_TYPES.PERMISSION
          ) {
            setState({
              isAuthenticated: true,
              onboardingStatus: null,
              isLoading: false,
              error: 'AUTH_ERROR',
            });
          } else {
            setState({
              isAuthenticated: true,
              onboardingStatus: null,
              isLoading: false,
              error: 'API_ERROR',
            });
          }
        }
      } catch (error) {
        console.error('🔒 OnboardingProtectedRoute: 체크 중 오류', error);

        setState({
          isAuthenticated: false,
          onboardingStatus: null,
          isLoading: false,
          error: null,
        });
      }
    };

    checkAuthAndOnboarding();
  }, []);

  const { isAuthenticated, onboardingStatus, isLoading, error } = state;

  // 인증 실패 시 네비게이션 처리
  useEffect(() => {
    if (isAuthenticated === false) {
      console.log('🔒 OnboardingProtectedRoute: 로그인 페이지로 리다이렉트');

      const currentPath = window.location.pathname + window.location.search;
      if (currentPath !== '/' && currentPath !== '/login') {
        sessionStorage.setItem('redirectPath', currentPath);
      }

      if (!sessionStorage.getItem('authToastShown')) {
        toast.error('로그인 필요', '로그인이 필요한 서비스입니다.');
        sessionStorage.setItem('authToastShown', 'true');
        setTimeout(() => {
          sessionStorage.removeItem('authToastShown');
        }, 3000);
      }

      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 인증 에러 시 네비게이션 처리
  useEffect(() => {
    if (error === 'AUTH_ERROR') {
      navigate('/', { replace: true });
    }
  }, [error, navigate]);

  // 온보딩 미완료 시 네비게이션 처리
  useEffect(() => {
    if (onboardingStatus && !onboardingStatus.isCompleted) {
      navigate(`/onboarding-info/${resolveNextOnboardingStep(onboardingStatus)}`, { replace: true });
    }
  }, [onboardingStatus, navigate]);

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C471] mx-auto"></div>
          <p className="mt-4 text-[#929292]">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증 실패 또는 에러 - 로딩 화면 유지 (네비게이션은 useEffect에서 처리)
  if (isAuthenticated === false || error === 'AUTH_ERROR') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C471] mx-auto"></div>
          <p className="mt-4 text-[#929292]">리다이렉트 중...</p>
        </div>
      </div>
    );
  }

  if (error === 'API_ERROR') {
    return (
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
    );
  }

  // 온보딩 미완료 - 로딩 화면 유지 (네비게이션은 useEffect에서 처리)
  if (onboardingStatus && !onboardingStatus.isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C471] mx-auto"></div>
          <p className="mt-4 text-[#929292]">온보딩 페이지로 이동 중...</p>
        </div>
      </div>
    );
  }

  // 온보딩 완료 - 자식 컴포넌트 렌더링
  return children;
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

  const hasAccessToken = Boolean(getToken('accessToken'));
  const hasRefreshToken = Boolean(getToken('refreshToken'));
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
