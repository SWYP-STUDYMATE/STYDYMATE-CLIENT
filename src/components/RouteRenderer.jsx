/**
 * 라우트 렌더링 컴포넌트
 * 라우트 타입에 따라 적절한 보호 로직과 레이아웃을 적용
 */

import { Route } from 'react-router-dom';
import OnboardingProtectedRoute from './OnboardingProtectedRoute';
import Layout from './Layout';
import { routes, ROUTE_TYPES } from '../config/routes';

/**
 * 단일 라우트를 렌더링하는 헬퍼 함수
 */
const renderRoute = (route) => {
  const { path, component: Component, type, layout } = route;

  // 라우트 타입에 따른 처리
  switch (type) {
    case ROUTE_TYPES.PUBLIC:
      // 공개 라우트 (보호 없음)
      return (
        <Route
          key={path}
          path={path}
          element={<Component />}
        />
      );

    case ROUTE_TYPES.AUTH:
      // 인증만 필요 (온보딩 미완료 허용)
      // TODO: 필요시 ProtectedRoute 컴포넌트 추가
      return (
        <Route
          key={path}
          path={path}
          element={<Component />}
        />
      );

    case ROUTE_TYPES.PROTECTED:
      // 인증 + 온보딩 완료 필요
      // OnboardingProtectedRoute는 이미 내부에서 ProtectedRoute를 사용함
      return (
        <Route
          key={path}
          path={path}
          element={
            <OnboardingProtectedRoute>
              {layout ? (
                <Layout>
                  <Component />
                </Layout>
              ) : (
                <Component />
              )}
            </OnboardingProtectedRoute>
          }
        />
      );

    default:
      console.warn(`Unknown route type: ${type} for path: ${path}`);
      return null;
  }
};

/**
 * 모든 라우트를 렌더링하는 컴포넌트
 */
export const renderRoutes = () => routes
  .map(renderRoute)
  .filter(Boolean);

export default renderRoutes;
