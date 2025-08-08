export class MainPage {
  constructor(page) {
    this.page = page;
    
    // 헤더 요소들
    this.logo = page.locator('img[alt="Language MATES Logo"]');
    this.notificationIcon = page.locator('img[alt="Notification Icon"]');
    
    // 인사 카드
    this.greetingCard = page.locator('div:has-text("안녕하세요")');
    
    // 주요 버튼들
    this.levelTestButton = page.locator('button:has-text("레벨테스트")');
    this.chatButton = page.locator('button:has-text("채팅")');
    this.studyScheduleButton = page.locator('button:has-text("학습 일정")');
    
    // 학습 통계
    this.studyStats = page.locator('div:has-text("학습 통계")');
    
    // 언어 교환 메이트
    this.languageExchangeMates = page.locator('div:has-text("나의 언어교환 메이트")');
    
    // 세션 일정
    this.sessionSchedule = page.locator('div:has-text("세션 일정")');
  }

  async goto() {
    await this.page.goto('/main');
    await this.page.waitForLoadState('networkidle');
  }

  async isDisplayed() {
    return await this.greetingCard.isVisible();
  }

  async navigateToLevelTest() {
    await this.levelTestButton.click();
    await this.page.waitForURL('**/level-test');
  }

  async navigateToChat() {
    await this.chatButton.click();
    await this.page.waitForURL('**/chat');
  }

  async navigateToSchedule() {
    await this.studyScheduleButton.click();
    await this.page.waitForURL('**/schedule');
  }

  async getUserGreeting() {
    return await this.greetingCard.textContent();
  }

  async getStudyStats() {
    const stats = {};
    
    // 통계 데이터 추출
    const statElements = await this.page.locator('.stat-item').all();
    for (const elem of statElements) {
      const label = await elem.locator('.stat-label').textContent();
      const value = await elem.locator('.stat-value').textContent();
      stats[label] = value;
    }
    
    return stats;
  }

  async isAuthenticated() {
    // 인증 상태 확인
    const isAuth = await this.page.evaluate(() => {
      return localStorage.getItem('isAuthenticated') === 'true';
    });
    
    return isAuth && await this.isDisplayed();
  }
}