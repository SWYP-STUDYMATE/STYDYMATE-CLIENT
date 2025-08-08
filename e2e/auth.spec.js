import { test, expect } from './fixtures/auth.fixture';
import { LoginPage } from './pages/LoginPage';
import { MainPage } from './pages/MainPage';

test.describe('인증 플로우', () => {
  test('로그인 페이지가 정상적으로 표시됨', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    // 로그인 페이지 요소 확인
    await expect(loginPage.loginTitle).toBeVisible();
    await expect(loginPage.subTitle).toBeVisible();
    await expect(loginPage.naverLoginButton).toBeVisible();
    await expect(loginPage.googleLoginButton).toBeVisible();
  });

  test('Mock 로그인 후 메인 페이지로 이동', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const mainPage = new MainPage(page);
    
    // Mock 로그인 실행
    await loginPage.goto();
    await loginPage.mockLogin({
      userId: 'test-user-001',
      userName: 'Test User',
      accessToken: 'mock-token-123'
    });
    
    // 메인 페이지 확인
    await expect(mainPage.greetingCard).toBeVisible();
    await expect(mainPage.greetingCard).toContainText('Test User');
    
    // 인증 상태 확인
    const isAuth = await mainPage.isAuthenticated();
    expect(isAuth).toBe(true);
  });

  test('인증된 사용자는 메인 페이지 접근 가능', async ({ authenticatedPage }) => {
    const mainPage = new MainPage(authenticatedPage);
    
    await mainPage.goto();
    await expect(mainPage.greetingCard).toBeVisible();
    
    // 주요 기능 버튼 확인
    await expect(mainPage.levelTestButton).toBeVisible();
    await expect(mainPage.chatButton).toBeVisible();
    await expect(mainPage.studyScheduleButton).toBeVisible();
  });

  test('비인증 사용자는 로그인 페이지로 리다이렉트', async ({ unauthenticatedPage }) => {
    // 보호된 페이지 접근 시도
    await unauthenticatedPage.goto('/main');
    
    // 로그인 페이지로 리다이렉트 확인
    await expect(unauthenticatedPage).toHaveURL('/');
    
    const loginPage = new LoginPage(unauthenticatedPage);
    await expect(loginPage.loginTitle).toBeVisible();
  });

  test('로그아웃 기능 동작 확인', async ({ authenticatedPage }) => {
    const mainPage = new MainPage(authenticatedPage);
    
    await mainPage.goto();
    
    // 로그아웃 실행
    await authenticatedPage.evaluate(() => {
      localStorage.clear();
    });
    
    // 페이지 새로고침
    await authenticatedPage.reload();
    
    // 로그인 페이지로 리다이렉트 확인
    await expect(authenticatedPage).toHaveURL('/');
  });
});

test.describe('소셜 로그인', () => {
  test.skip('네이버 로그인 버튼 클릭 시 OAuth 페이지로 이동', async ({ page }) => {
    // 실제 OAuth 플로우는 E2E 테스트에서 제한적이므로 skip
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    // 네이버 로그인 버튼 클릭
    await loginPage.clickNaverLogin();
    
    // OAuth URL 패턴 확인 (실제 환경에서만 동작)
    await expect(page).toHaveURL(/nid\.naver\.com/);
  });

  test.skip('구글 로그인 버튼 클릭 시 OAuth 페이지로 이동', async ({ page }) => {
    // 실제 OAuth 플로우는 E2E 테스트에서 제한적이므로 skip
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    // 구글 로그인 버튼 클릭
    await loginPage.clickGoogleLogin();
    
    // OAuth URL 패턴 확인 (실제 환경에서만 동작)
    await expect(page).toHaveURL(/accounts\.google\.com/);
  });
});