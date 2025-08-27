import { test, expect } from '@playwright/test';

test.describe('개선된 로그인 페이지', () => {
  test.beforeEach(async ({ page }) => {
    // 네이버 OAuth API를 모킹하여 실제 네이버 서버로 가지 않도록 처리
    await page.route('**/api/v1/login/naver', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/plain',
        body: 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=mock-client-id&redirect_uri=http://localhost:8080/login/oauth2/code/naver&state=mock-state'
      });
    });

    await page.route('**/api/v1/login/google', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/plain',
        body: 'https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=mock-client-id&redirect_uri=http://localhost:8080/login/oauth2/code/google&scope=openid profile email&state=mock-state'
      });
    });

    await page.goto('http://localhost:3000/');
  });

  test('로그인 페이지 기본 요소 확인', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/STUDYMATE/);
    
    // 헤딩 확인
    await expect(page.locator('h1')).toContainText('Language Mate에 오신 것을 환영해요!');
    
    // 네이버 로그인 버튼 확인
    const naverButton = page.locator('[data-testid="naver-login-button"]');
    await expect(naverButton).toBeVisible();
    await expect(naverButton).toContainText('네이버로 로그인');
    
    // 구글 로그인 버튼 확인
    const googleButton = page.locator('[data-testid="google-login-button"]');
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toContainText('Google 로그인');
    
    // 자동 로그인 체크박스 확인
    const autoLoginCheckbox = page.locator('[data-testid="auto-login-checkbox"]');
    await expect(autoLoginCheckbox).toBeVisible();
  });

  test('네이버 로그인 API 호출 테스트', async ({ page }) => {
    let requestMade = false;
    
    // API 요청 모니터링
    page.on('request', request => {
      if (request.url().includes('/api/v1/login/naver')) {
        requestMade = true;
      }
    });

    // 네이버 로그인 버튼 클릭 전 로딩 상태가 없는지 확인
    await expect(page.locator('[data-testid="loading"]')).not.toBeVisible();

    // 네이버 로그인 버튼 클릭
    await page.locator('[data-testid="naver-login-button"]').click();
    
    // API 요청이 발생했는지 확인
    await page.waitForTimeout(100);
    expect(requestMade).toBe(true);
  });

  test('구글 로그인 API 호출 테스트', async ({ page }) => {
    let requestMade = false;
    
    // API 요청 모니터링
    page.on('request', request => {
      if (request.url().includes('/api/v1/login/google')) {
        requestMade = true;
      }
    });

    // 구글 로그인 버튼 클릭
    await page.locator('[data-testid="google-login-button"]').click();
    
    // API 요청이 발생했는지 확인
    await page.waitForTimeout(100);
    expect(requestMade).toBe(true);
  });

  test('에러 상태 처리 테스트', async ({ page }) => {
    // 네이버 로그인 API 에러 모킹
    await page.route('**/api/v1/login/naver', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal Server Error'
        })
      });
    });

    // 네이버 로그인 버튼 클릭
    await page.locator('[data-testid="naver-login-button"]').click();

    // 에러 메시지가 표시되는지 확인
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('네이버 로그인 요청에 실패했습니다');
  });

  test('로딩 상태 표시 테스트', async ({ page }) => {
    // 느린 응답을 모킹
    await page.route('**/api/v1/login/naver', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'text/plain',
        body: 'https://nid.naver.com/oauth2.0/authorize?mock=true'
      });
    });

    // 네이버 로그인 버튼 클릭
    const naverButton = page.locator('[data-testid="naver-login-button"]');
    await naverButton.click();

    // 로딩 상태가 표시되는지 확인
    const loadingIndicator = page.locator('[data-testid="loading"]');
    await expect(loadingIndicator).toBeVisible();

    // 버튼이 비활성화 되었는지 확인
    await expect(naverButton).toBeDisabled();
  });

  test('자동 로그인 체크박스 기능 테스트', async ({ page }) => {
    const autoLoginCheckbox = page.locator('[data-testid="auto-login-checkbox"]');
    
    // 초기 상태는 체크되지 않음
    await expect(autoLoginCheckbox).not.toBeChecked();
    
    // 체크박스 클릭
    await autoLoginCheckbox.click();
    
    // aria-pressed 속성 확인 (우리 컴포넌트는 button으로 구현됨)
    await expect(autoLoginCheckbox).toHaveAttribute('aria-pressed', 'true');
    
    // 다시 클릭하면 해제됨  
    await autoLoginCheckbox.click();
    await expect(autoLoginCheckbox).toHaveAttribute('aria-pressed', 'false');
  });

  test('이미 로그인된 사용자 리다이렉트', async ({ page }) => {
    // 로컬스토리지에 토큰 설정
    await page.evaluate(() => {
      localStorage.setItem('accessToken', 'mock-access-token');
    });
    
    // 로그인 페이지로 이동
    await page.goto('http://localhost:3000/');
    
    // 메인 페이지로 자동 리다이렉트 확인
    await expect(page).toHaveURL('/main');
  });

  test('키보드 접근성 테스트', async ({ page }) => {
    const naverButton = page.locator('[data-testid="naver-login-button"]');
    const googleButton = page.locator('[data-testid="google-login-button"]');
    const autoLoginCheckbox = page.locator('[data-testid="auto-login-checkbox"]');
    
    // 탭으로 요소 간 이동 가능한지 확인
    await page.keyboard.press('Tab');
    await expect(autoLoginCheckbox).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(naverButton).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(googleButton).toBeFocused();
  });

  test('모바일 반응형 테스트', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 버튼들이 모바일에서도 적절한 크기인지 확인
    const naverButton = page.locator('[data-testid="naver-login-button"]');
    const googleButton = page.locator('[data-testid="google-login-button"]');
    
    const naverBox = await naverButton.boundingBox();
    const googleBox = await googleButton.boundingBox();
    
    // 터치 친화적인 크기 확인 (최소 44px 높이)
    expect(naverBox?.height).toBeGreaterThanOrEqual(44);
    expect(googleBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('OAuth 콜백 시뮬레이션', async ({ page, context }) => {
    // 메인 페이지에서 토큰 파라미터 처리 테스트
    const mockToken = 'mock-access-token-12345';
    
    // 토큰이 포함된 메인 페이지로 이동 (OAuth 콜백 후 상황)
    await page.goto(`http://localhost:3000/main?accessToken=${mockToken}`);
    
    // 토큰이 로컬스토리지에 저장되었는지 확인
    const savedToken = await page.evaluate(() => 
      localStorage.getItem('accessToken')
    );
    
    expect(savedToken).toBe(mockToken);
    
    // URL에서 토큰 파라미터가 제거되었는지 확인
    await expect(page).toHaveURL('/main');
  });
});