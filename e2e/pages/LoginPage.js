export class LoginPage {
  constructor(page) {
    this.page = page;
    
    // 페이지 요소들
    this.naverLoginButton = page.locator('button:has-text("네이버로 로그인하기")');
    this.googleLoginButton = page.locator('button:has-text("구글로 로그인하기")');
    this.loginTitle = page.locator('h1:has-text("반가워요!")');
    this.subTitle = page.locator('p:has-text("더 쉽고 빠른 로그인")');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async isDisplayed() {
    return await this.loginTitle.isVisible();
  }

  async clickNaverLogin() {
    await this.naverLoginButton.click();
  }

  async clickGoogleLogin() {
    await this.googleLoginButton.click();
  }

  // 개발 환경용 Mock 로그인
  async mockLogin(userData = {}) {
    // 로컬 스토리지에 직접 인증 정보 설정
    await this.page.evaluate((data) => {
      localStorage.setItem('accessToken', data.accessToken || 'mock-token-123');
      localStorage.setItem('userId', data.userId || 'test-user-001');
      localStorage.setItem('userName', data.userName || 'Test User');
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('profileImage', data.profileImage || '/assets/basicProfilePic.png');
    }, userData);

    // 메인 페이지로 이동
    await this.page.goto('/main');
    await this.page.waitForLoadState('networkidle');
  }

  async waitForLoginRedirect() {
    // OAuth 리다이렉트 대기
    await this.page.waitForURL(/\/agreement|\/main/, { timeout: 30000 });
  }
}