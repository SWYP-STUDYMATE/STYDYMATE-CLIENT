import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from './Toast';

/**
 * ProtectedRoute 컴포넌트
 * 로그인이 필요한 페이지를 보호하는 라우트 가드
 * 토큰이 없으면 자동으로 로그인 페이지로 리다이렉트
 */
export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const decodePayload = (token) => {
      try {
        const base64 = token.split('.')[1];
        return JSON.parse(atob(base64));
      } catch (err) {
        console.warn('🔒 ProtectedRoute: JWT 디코드 실패', err);
        return null;
      }
    };

    const isExpired = (token) => {
      const payload = decodePayload(token);
      if (!payload?.exp) return true;
      return payload.exp * 1000 <= Date.now();
    };

    const checkAuth = () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        // 토큰이 없으면 미인증 상태
        if (!accessToken && !refreshToken) {
          console.log('🔒 ProtectedRoute: 토큰 없음 - 미인증 상태');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // JWT 토큰 형식 간단 검증 (xxx.yyy.zzz 형식)
        const isValidJWT = (token) => {
          if (!token || typeof token !== 'string') return false;
          const parts = token.split('.');
          return parts.length === 3 && parts.every(part => part.length > 0);
        };

        // accessToken 검증
        const accessTokenInvalidFormat = accessToken && !isValidJWT(accessToken);
        const accessTokenExpired = accessToken && !accessTokenInvalidFormat && isExpired(accessToken);

        // refreshToken 검증
        const refreshTokenInvalidFormat = refreshToken && !isValidJWT(refreshToken);
        const refreshTokenExpired = refreshToken && !refreshTokenInvalidFormat && isExpired(refreshToken);

        if (refreshTokenInvalidFormat || refreshTokenExpired) {
          console.warn('🔒 ProtectedRoute: refreshToken 사용 불가', {
            invalidFormat: refreshTokenInvalidFormat,
            expired: refreshTokenExpired
          });
          localStorage.removeItem('refreshToken');
        }

        if (accessTokenInvalidFormat || accessTokenExpired) {
          console.warn('🔒 ProtectedRoute: accessToken 사용 불가', {
            invalidFormat: accessTokenInvalidFormat,
            expired: accessTokenExpired
          });
          localStorage.removeItem('accessToken');

          // refreshToken으로 복구 시도 가능
          if (refreshToken && !refreshTokenInvalidFormat && !refreshTokenExpired) {
            console.log('🔒 ProtectedRoute: refreshToken은 유효함');
            setIsAuthenticated(true);
          } else {
            console.log('🔒 ProtectedRoute: refreshToken도 유효하지 않음');
            localStorage.removeItem('refreshToken');
            setIsAuthenticated(false);
          }
        } else if (accessToken) {
          // 유효한 accessToken이 있음
          console.log('✅ ProtectedRoute: 인증됨');
          setIsAuthenticated(true);
        } else if (refreshToken && !refreshTokenInvalidFormat && !refreshTokenExpired) {
          // accessToken은 없지만 유효한 refreshToken이 있음
          // API 호출시 인터셉터가 자동으로 accessToken을 재발급받을 것임
          console.log('🔒 ProtectedRoute: refreshToken만 있음 - 재발급 대기');
          setIsAuthenticated(true);
        } else {
          console.log('🔒 ProtectedRoute: 유효한 토큰 없음');
          setIsAuthenticated(false);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('🔒 ProtectedRoute: 인증 체크 중 오류', error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuth();

    // storage 이벤트 리스너 추가 (다른 탭에서 로그아웃 감지)
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken' || e.key === 'refreshToken') {
        console.log('🔒 ProtectedRoute: 토큰 변경 감지');
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 로딩 중일 때는 로딩 표시
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

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    console.log('🔒 ProtectedRoute: 로그인 페이지로 리다이렉트');

    // 현재 경로 저장 (로그인 후 돌아올 수 있도록)
    const currentPath = window.location.pathname + window.location.search;
    if (currentPath !== '/' && currentPath !== '/login') {
      sessionStorage.setItem('redirectPath', currentPath);
    }

    // 토스트 메시지는 한 번만 표시
    if (!sessionStorage.getItem('authToastShown')) {
      toast.error('로그인 필요', '로그인이 필요한 서비스입니다.');
      sessionStorage.setItem('authToastShown', 'true');

      // 다음 로그인 시도를 위해 플래그 제거 (3초 후)
      setTimeout(() => {
        sessionStorage.removeItem('authToastShown');
      }, 3000);
    }

    return <Navigate to="/" replace />;
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return children;
}
