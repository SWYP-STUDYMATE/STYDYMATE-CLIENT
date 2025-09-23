import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { selectors } from '../fixtures/test-data';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // 페이지 요소들
  get naverLoginButton() {
    return this.page.locator(selectors.login.naverButton);
  }

  get agreementCheckbox() {
    return this.page.locator(selectors.login.agreementCheckbox);
  }

  get agreeButton() {
    return this.page.locator('[data-testid="agree-button"]');
  }

  get errorMessage() {
    return this.page.locator('[data-testid="error-message"]');
  }

  get loadingSpinner() {
    return this.page.locator('[data-testid="loading"]');
  }

  /**
   * 로그인 페이지로 이동
   */
  async navigate() {
    await this.goto('/');
  }

  /**
   * 페이지가 로드되었는지 확인
   */
  async verifyPageLoaded() {
    await expect(this.page).toHaveURL('/');
    await expect(this.page).toHaveTitle(/STUDYMATE/);
    await expect(this.naverLoginButton).toBeVisible();
  }

  /**
   * 네이버 로그인 버튼 클릭
   */
  async clickNaverLogin() {
    await this.naverLoginButton.click();
  }

  /**
   * 약관 동의 체크박스 선택
   */
  async agreeToTerms() {
    await this.agreementCheckbox.check();
    await expect(this.agreementCheckbox).toBeChecked();
  }

  /**
   * 동의 버튼 클릭
   */
  async clickAgreeButton() {
    await this.agreeButton.click();
  }

  /**
   * 로그인 플로우 완료
   */
  async completeLogin() {
    // Naver OAuth 로그인 플로우 모킹
    await this.helpers.mockNaverLogin();
    
    // 네이버 로그인 버튼 클릭
    await this.clickNaverLogin();
    
    // 약관 동의 페이지가 나타날 때까지 대기
    await this.page.waitForURL('/agreement');
    
    // 약관 동의
    await this.agreeToTerms();
    await this.clickAgreeButton();
  }

  /**
   * 로그인 성공 후 리다이렉트 확인
   */
  async verifyLoginSuccess() {
    // 온보딩 완료 상태에 따라 다른 페이지로 리다이렉트
    const url = await this.getCurrentUrl();
    
    // 온보딩 미완료 시 온보딩 페이지로 이동
    if (url.includes('/onboarding-info')) {
      await expect(this.page).toHaveURL(/\/onboarding-info/);
    } 
    // 온보딩 완료 시 메인 페이지로 이동
    else if (url.includes('/main')) {
      await expect(this.page).toHaveURL('/main');
    }
    // 회원가입 완료 페이지
    else if (url.includes('/signup-complete')) {
      await expect(this.page).toHaveURL('/signup-complete');
    }
  }

  /**
   * 로그인 에러 확인
   */
  async verifyLoginError(expectedMessage: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedMessage);
  }

  /**
   * 로딩 상태 확인
   */
  async verifyLoadingState() {
    await expect(this.loadingSpinner).toBeVisible();
  }

  /**
   * 로딩 완료 확인
   */
  async waitForLoadingComplete() {
    await this.helpers.waitForLoading();
  }

  /**
   * 페이지 접근성 확인
   */
  async verifyAccessibility() {
    // 네이버 로그인 버튼이 키보드로 접근 가능한지 확인
    await this.naverLoginButton.focus();
    await expect(this.naverLoginButton).toBeFocused();
    
    // Enter 키로 버튼 클릭 가능한지 확인
    await this.naverLoginButton.press('Enter');
  }

  /**
   * 모바일 반응형 확인
   */
  async verifyMobileResponsive() {
    await this.helpers.setMobileViewport();
    
    // 모바일에서도 로그인 버튼이 적절히 표시되는지 확인
    await expect(this.naverLoginButton).toBeVisible();
    
    const buttonBox = await this.naverLoginButton.boundingBox();
    expect(buttonBox?.width).toBeGreaterThan(200); // 최소 200px 너비
    expect(buttonBox?.height).toBeGreaterThan(44);  // 최소 44px 높이 (터치 친화적)
  }

  /**
   * 브라우저 뒤로가기 처리 확인
   */
  async verifyBackButtonHandling() {
    // 로그인 후 뒤로가기 시도
    await this.completeLogin();
    await this.page.goBack();
    
    // 로그인 페이지로 돌아가지 않고 적절한 페이지에 유지되는지 확인
    const url = await this.getCurrentUrl();
    expect(url).not.toBe('/');
  }

  /**
   * 토큰 저장 확인
   */
  async verifyTokenStorage() {
    await this.completeLogin();
    
    // 로컬 스토리지에 토큰이 저장되었는지 확인
    const accessToken = await this.getLocalStorage('accessToken');
    const refreshToken = await this.getLocalStorage('refreshToken');
    
    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();
  }

  /**
   * 이미 로그인된 사용자 리다이렉트 확인
   */
  async verifyAlreadyLoggedInRedirect() {
    // 토큰 설정
    await this.setLocalStorage('accessToken', 'mock-token');
    
    // 로그인 페이지 접근 시도
    await this.navigate();
    
    // 자동으로 메인 페이지로 리다이렉트되는지 확인
    await this.page.waitForURL('/main', { timeout: 5000 });
  }

  /**
   * 네트워크 에러 처리 확인
   */
  async verifyNetworkErrorHandling() {
    // 네트워크 에러 모킹
    await this.page.route('**/api/v1/auth/callback/naver**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: '네트워크 연결을 확인해주세요.'
          }
        })
      });
    });

    await this.clickNaverLogin();
    await this.verifyLoginError('네트워크 연결을 확인해주세요.');
  }

  /**
   * OAuth 취소 처리 확인
   */
  async verifyOAuthCancelHandling() {
    // OAuth 취소 시나리오 모킹
    await this.page.route('**/api/v1/auth/callback/naver**', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            code: 'OAUTH_CANCELLED',
            message: '로그인이 취소되었습니다.'
          }
        })
      });
    });

    await this.clickNaverLogin();
    await this.verifyLoginError('로그인이 취소되었습니다.');
  }

  /**
   * 페이지 성능 측정
   */
  async measurePagePerformance() {
    const metrics = await this.helpers.measurePerformance();
    
    // 로그인 페이지 로딩 성능 기준
    expect(metrics.firstContentfulPaint).toBeLessThan(1500); // 1.5초 이내
    expect(metrics.domContentLoaded).toBeLessThan(2000);     // 2초 이내
    
    return metrics;
  }
}
