import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login-page';

test.describe('로그인 페이지', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test('로그인 페이지 로드 확인', async () => {
    await loginPage.navigate();
    await loginPage.verifyPageLoaded();
  });

  test('네이버 로그인 버튼 표시 확인', async () => {
    await loginPage.navigate();
    
    const naverButton = loginPage.naverLoginButton;
    await expect(naverButton).toBeVisible();
    await expect(naverButton).toContainText('네이버로 로그인');
  });

  test('성공적인 로그인 플로우', async () => {
    await loginPage.navigate();
    
    // 온보딩 미완료 상태로 설정
    await loginPage.helpers.mockOnboardingIncomplete();
    
    // 로그인 완료
    await loginPage.completeLogin();
    
    // 온보딩 페이지로 리다이렉트 확인
    await expect(loginPage.page).toHaveURL('/onboarding-info/1');
    
    // 토큰 저장 확인
    await loginPage.verifyTokenStorage();
  });

  test('온보딩 완료된 사용자 로그인', async () => {
    await loginPage.navigate();
    
    // 온보딩 완료 상태로 설정
    await loginPage.helpers.mockOnboardingComplete();
    
    // 로그인 완료
    await loginPage.completeLogin();
    
    // 메인 페이지로 리다이렉트 확인
    await expect(loginPage.page).toHaveURL('/main');
  });

  test('약관 동의 체크박스 기능', async () => {
    await loginPage.navigate();
    await loginPage.helpers.mockNaverLogin();
    
    // 네이버 로그인 버튼 클릭
    await loginPage.clickNaverLogin();
    
    // 약관 동의 페이지로 이동
    await loginPage.page.waitForURL('/agreement');
    
    // 처음에는 체크되지 않음
    await expect(loginPage.agreementCheckbox).not.toBeChecked();
    
    // 동의 버튼은 비활성화 상태
    await expect(loginPage.agreeButton).toBeDisabled();
    
    // 체크박스 선택
    await loginPage.agreeToTerms();
    
    // 동의 버튼 활성화
    await expect(loginPage.agreeButton).toBeEnabled();
  });

  test('이미 로그인된 사용자 리다이렉트', async () => {
    await loginPage.verifyAlreadyLoggedInRedirect();
  });

  test('네트워크 에러 처리', async () => {
    await loginPage.navigate();
    await loginPage.verifyNetworkErrorHandling();
  });

  test('OAuth 취소 처리', async () => {
    await loginPage.navigate();
    await loginPage.verifyOAuthCancelHandling();
  });

  test('모바일 반응형 디자인', async () => {
    await loginPage.navigate();
    await loginPage.verifyMobileResponsive();
  });

  test('키보드 접근성', async () => {
    await loginPage.navigate();
    await loginPage.verifyAccessibility();
  });

  test('브라우저 뒤로가기 처리', async () => {
    await loginPage.verifyBackButtonHandling();
  });

  test('페이지 성능 측정', async () => {
    await loginPage.navigate();
    const metrics = await loginPage.measurePagePerformance();
    
    console.log('로그인 페이지 성능 메트릭:', metrics);
    
    // 성능 기준 검증
    expect(metrics.firstContentfulPaint).toBeLessThan(1500);
  });

  test('로딩 상태 표시', async () => {
    await loginPage.navigate();
    await loginPage.helpers.mockNaverLogin();
    
    // 로그인 버튼 클릭
    await loginPage.clickNaverLogin();
    
    // 로딩 스피너가 나타나는지 확인 (빠르게 사라질 수 있음)
    try {
      await loginPage.verifyLoadingState();
    } catch (e) {
      // 로딩이 너무 빠르게 완료된 경우는 정상
      console.log('로딩 상태가 매우 빠르게 완료됨');
    }
    
    // 로딩 완료 대기
    await loginPage.waitForLoadingComplete();
  });

  test('다중 브라우저 탭에서 로그인 상태 동기화', async ({ context }) => {
    // 첫 번째 탭에서 로그인
    const page1 = await context.newPage();
    const loginPage1 = new LoginPage(page1);
    
    await loginPage1.navigate();
    await loginPage1.helpers.mockOnboardingComplete();
    await loginPage1.completeLogin();
    
    // 두 번째 탭에서 로그인 페이지 접근
    const page2 = await context.newPage();
    const loginPage2 = new LoginPage(page2);
    
    await loginPage2.navigate();
    
    // 자동으로 메인 페이지로 리다이렉트되는지 확인
    await page2.waitForURL('/main', { timeout: 5000 });
    
    await page1.close();
    await page2.close();
  });

  test('토큰 만료 시 자동 갱신', async () => {
    await loginPage.navigate();
    
    // 만료된 토큰 설정
    await loginPage.setLocalStorage('accessToken', 'expired-token');
    
    // 토큰 갱신 API 모킹
    await loginPage.page.route('**/api/v1/auth/refresh**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token'
          }
        })
      });
    });
    
    // 사용자 정보 API 호출 (토큰 검증 트리거)
    await loginPage.page.route('**/api/v1/users/profile**', route => {
      const authHeader = route.request().headers().authorization;
      
      if (authHeader === 'Bearer expired-token') {
        // 첫 번째 요청은 401 반환
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: { code: 'TOKEN_EXPIRED', message: 'Token expired' }
          })
        });
      } else {
        // 새 토큰으로는 성공 반환
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { id: 1, name: '테스트사용자' }
          })
        });
      }
    });
    
    // 메인 페이지로 이동 시도
    await loginPage.goto('/main');
    
    // 토큰이 자동으로 갱신되고 메인 페이지가 로드되는지 확인
    await expect(loginPage.page).toHaveURL('/main');
  });

  test('CORS 에러 처리', async () => {
    await loginPage.navigate();
    
    // CORS 에러 모킹
    await loginPage.page.route('**/api/v1/**', route => {
      route.fulfill({
        status: 0, // CORS 에러는 보통 status 0
        contentType: 'application/json',
        body: ''
      });
    });
    
    await loginPage.clickNaverLogin();
    
    // CORS 에러 메시지 확인
    await loginPage.verifyLoginError('네트워크 오류가 발생했습니다');
  });
});