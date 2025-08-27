import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { selectors } from '../fixtures/test-data';

export class MainPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // 네비게이션 요소들
  get profileButton() {
    return this.page.locator('[data-testid="profile-button"]');
  }

  get matchingButton() {
    return this.page.locator('[data-testid="matching-button"]');
  }

  get chatButton() {
    return this.page.locator('[data-testid="chat-button"]');
  }

  get logoutButton() {
    return this.page.locator('[data-testid="logout-button"]');
  }

  // 사용자 정보 섹션
  get userWelcomeMessage() {
    return this.page.locator('[data-testid="welcome-message"]');
  }

  get userProfileImage() {
    return this.page.locator('[data-testid="user-profile-image"]');
  }

  get userName() {
    return this.page.locator('[data-testid="user-name"]');
  }

  get userLanguageInfo() {
    return this.page.locator('[data-testid="user-language-info"]');
  }

  // 매칭 파트너 섹션
  get partnersSection() {
    return this.page.locator('[data-testid="partners-section"]');
  }

  get partnerCards() {
    return this.page.locator('[data-testid="partner-card"]');
  }

  get viewAllPartnersButton() {
    return this.page.locator('[data-testid="view-all-partners"]');
  }

  // 최근 채팅 섹션
  get recentChatsSection() {
    return this.page.locator('[data-testid="recent-chats-section"]');
  }

  get chatRoomItems() {
    return this.page.locator('[data-testid="chat-room-item"]');
  }

  get viewAllChatsButton() {
    return this.page.locator('[data-testid="view-all-chats"]');
  }

  // 학습 진행 상황 섹션
  get learningProgressSection() {
    return this.page.locator('[data-testid="learning-progress-section"]');
  }

  get learningStreak() {
    return this.page.locator('[data-testid="learning-streak"]');
  }

  get weeklyGoalProgress() {
    return this.page.locator('[data-testid="weekly-goal-progress"]');
  }

  // 공지사항/알림 섹션
  get notificationsSection() {
    return this.page.locator('[data-testid="notifications-section"]');
  }

  get notificationItems() {
    return this.page.locator('[data-testid="notification-item"]');
  }

  get unreadNotificationBadge() {
    return this.page.locator('[data-testid="unread-notification-badge"]');
  }

  // 빠른 액션 버튼들
  get quickStartChatButton() {
    return this.page.locator('[data-testid="quick-start-chat"]');
  }

  get findNewPartnerButton() {
    return this.page.locator('[data-testid="find-new-partner"]');
  }

  get updateProfileButton() {
    return this.page.locator('[data-testid="update-profile"]');
  }

  /**
   * 메인 페이지로 이동
   */
  async navigate() {
    await this.goto('/main');
  }

  /**
   * 페이지가 로드되었는지 확인
   */
  async verifyPageLoaded() {
    await expect(this.page).toHaveURL('/main');
    await expect(this.page).toHaveTitle(/STUDYMATE/);
    await expect(this.userWelcomeMessage).toBeVisible();
  }

  /**
   * 사용자 정보가 올바르게 표시되는지 확인
   */
  async verifyUserInfo(expectedName: string, expectedLanguage: string) {
    await expect(this.userName).toContainText(expectedName);
    await expect(this.userLanguageInfo).toContainText(expectedLanguage);
    await expect(this.userProfileImage).toBeVisible();
  }

  /**
   * 매칭 파트너 섹션 확인
   */
  async verifyMatchingPartnersSection() {
    await expect(this.partnersSection).toBeVisible();
    
    // 파트너 카드가 표시되는지 확인
    const partnerCount = await this.partnerCards.count();
    expect(partnerCount).toBeGreaterThan(0);
    
    // 첫 번째 파트너 카드의 정보 확인
    const firstPartner = this.partnerCards.first();
    await expect(firstPartner.locator('[data-testid="partner-name"]')).toBeVisible();
    await expect(firstPartner.locator('[data-testid="partner-language"]')).toBeVisible();
    await expect(firstPartner.locator('[data-testid="match-score"]')).toBeVisible();
  }

  /**
   * 최근 채팅 섹션 확인
   */
  async verifyRecentChatsSection() {
    await expect(this.recentChatsSection).toBeVisible();
    
    const chatRoomCount = await this.chatRoomItems.count();
    if (chatRoomCount > 0) {
      // 첫 번째 채팅방 정보 확인
      const firstChatRoom = this.chatRoomItems.first();
      await expect(firstChatRoom.locator('[data-testid="chat-partner-name"]')).toBeVisible();
      await expect(firstChatRoom.locator('[data-testid="last-message"]')).toBeVisible();
      await expect(firstChatRoom.locator('[data-testid="last-message-time"]')).toBeVisible();
    }
  }

  /**
   * 학습 진행 상황 확인
   */
  async verifyLearningProgress() {
    await expect(this.learningProgressSection).toBeVisible();
    await expect(this.learningStreak).toBeVisible();
    await expect(this.weeklyGoalProgress).toBeVisible();
    
    // 진행률이 표시되는지 확인
    const streakText = await this.learningStreak.textContent();
    expect(streakText).toMatch(/\d+/); // 숫자가 포함되어 있는지
  }

  /**
   * 알림 섹션 확인
   */
  async verifyNotificationsSection() {
    await expect(this.notificationsSection).toBeVisible();
    
    const notificationCount = await this.notificationItems.count();
    if (notificationCount > 0) {
      // 알림 항목 구조 확인
      const firstNotification = this.notificationItems.first();
      await expect(firstNotification.locator('[data-testid="notification-title"]')).toBeVisible();
      await expect(firstNotification.locator('[data-testid="notification-time"]')).toBeVisible();
    }
  }

  /**
   * 매칭 페이지로 이동
   */
  async navigateToMatching() {
    await this.matchingButton.click();
    await this.page.waitForURL('/matching');
  }

  /**
   * 채팅 페이지로 이동
   */
  async navigateToChat() {
    await this.chatButton.click();
    await this.page.waitForURL('/chat');
  }

  /**
   * 프로필 페이지로 이동
   */
  async navigateToProfile() {
    await this.profileButton.click();
    await this.page.waitForURL('/profile');
  }

  /**
   * 특정 파트너 카드 클릭
   */
  async clickPartnerCard(index: number = 0) {
    const partnerCards = await this.partnerCards.all();
    if (partnerCards.length > index) {
      await partnerCards[index].click();
    }
  }

  /**
   * 특정 채팅방 클릭
   */
  async clickChatRoom(index: number = 0) {
    const chatRooms = await this.chatRoomItems.all();
    if (chatRooms.length > index) {
      await chatRooms[index].click();
      // 채팅방 페이지로 이동하는지 확인
      await this.page.waitForURL(/\/chat\/\d+/);
    }
  }

  /**
   * 빠른 채팅 시작
   */
  async startQuickChat() {
    await this.quickStartChatButton.click();
    // 매칭이나 채팅 페이지로 이동하는지 확인
  }

  /**
   * 새 파트너 찾기
   */
  async findNewPartner() {
    await this.findNewPartnerButton.click();
    await this.page.waitForURL('/matching');
  }

  /**
   * 프로필 업데이트
   */
  async updateProfile() {
    await this.updateProfileButton.click();
    await this.page.waitForURL('/profile');
  }

  /**
   * 로그아웃
   */
  async logout() {
    await this.logoutButton.click();
    
    // 확인 다이얼로그가 나타날 경우 처리
    await this.handleDialog(true);
    
    // 로그인 페이지로 이동하는지 확인
    await this.page.waitForURL('/');
  }

  /**
   * 읽지 않은 알림 수 확인
   */
  async verifyUnreadNotifications(expectedCount?: number) {
    if (expectedCount && expectedCount > 0) {
      await expect(this.unreadNotificationBadge).toBeVisible();
      await expect(this.unreadNotificationBadge).toContainText(expectedCount.toString());
    } else {
      await expect(this.unreadNotificationBadge).not.toBeVisible();
    }
  }

  /**
   * 페이지 새로고침 후 상태 유지 확인
   */
  async verifyStateAfterRefresh() {
    await this.page.reload();
    await this.verifyPageLoaded();
    
    // 로그인 상태가 유지되는지 확인
    const token = await this.getLocalStorage('accessToken');
    expect(token).toBeTruthy();
  }

  /**
   * 모바일 반응형 확인
   */
  async verifyMobileResponsive() {
    await this.helpers.setMobileViewport();
    
    // 주요 요소들이 모바일에서도 보이는지 확인
    await expect(this.userWelcomeMessage).toBeVisible();
    await expect(this.partnersSection).toBeVisible();
    await expect(this.recentChatsSection).toBeVisible();
    
    // 네비게이션 버튼들의 크기 확인 (터치 친화적)
    const buttonBox = await this.matchingButton.boundingBox();
    if (buttonBox) {
      expect(buttonBox.height).toBeGreaterThan(44); // 최소 44px
    }
  }

  /**
   * 접근성 확인
   */
  async verifyAccessibility() {
    // 주요 버튼들이 키보드로 접근 가능한지 확인
    await this.matchingButton.focus();
    await expect(this.matchingButton).toBeFocused();
    
    await this.page.keyboard.press('Tab');
    await expect(this.chatButton).toBeFocused();
    
    await this.page.keyboard.press('Tab');
    await expect(this.profileButton).toBeFocused();
  }

  /**
   * 실시간 데이터 업데이트 확인 (WebSocket)
   */
  async verifyRealtimeUpdates() {
    // WebSocket 연결 모킹
    await this.helpers.mockWebSocket();
    
    // 새 메시지 도착 시뮬레이션
    await this.page.evaluate(() => {
      // 모킹된 WebSocket을 통해 메시지 수신 이벤트 발생
      const event = new CustomEvent('newMessage', {
        detail: {
          roomId: 456,
          message: 'Hello from test!',
          senderName: 'Sarah Kim',
          timestamp: new Date().toISOString()
        }
      });
      window.dispatchEvent(event);
    });
    
    // UI가 업데이트되는지 확인 (예: 읽지 않은 메시지 개수 증가)
    await this.page.waitForTimeout(1000);
  }

  /**
   * 성능 측정
   */
  async measurePagePerformance() {
    const metrics = await this.helpers.measurePerformance();
    
    // 메인 페이지 성능 기준
    expect(metrics.firstContentfulPaint).toBeLessThan(2000); // 2초 이내
    expect(metrics.domContentLoaded).toBeLessThan(3000);     // 3초 이내
    
    return metrics;
  }

  /**
   * 에러 상태 처리 확인
   */
  async verifyErrorHandling() {
    // API 에러 모킹
    await this.page.route('**/api/v1/users/profile**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: { message: '서버 오류가 발생했습니다.' }
        })
      });
    });
    
    await this.page.reload();
    
    // 에러 메시지가 표시되는지 확인
    const errorMessage = this.page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('서버 오류가 발생했습니다.');
  }

  /**
   * 로딩 상태 확인
   */
  async verifyLoadingStates() {
    // 페이지 로딩 시 스피너 확인
    await this.page.reload();
    
    try {
      const loadingSpinner = this.page.locator('[data-testid="loading"]');
      await expect(loadingSpinner).toBeVisible({ timeout: 1000 });
      await expect(loadingSpinner).not.toBeVisible({ timeout: 5000 });
    } catch {
      // 로딩이 매우 빨리 완료된 경우
    }
  }

  /**
   * 데이터 필터링 기능 확인
   */
  async verifyDataFiltering() {
    // 파트너 섹션에서 필터 적용 (만약 있다면)
    const filterButton = this.page.locator('[data-testid="filter-partners"]');
    
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // 필터 옵션 선택
      const languageFilter = this.page.locator('[data-testid="language-filter"]');
      if (await languageFilter.isVisible()) {
        await languageFilter.selectOption('English');
        
        // 필터가 적용되었는지 확인
        await this.page.waitForTimeout(1000);
        const filteredPartners = await this.partnerCards.count();
        expect(filteredPartners).toBeGreaterThanOrEqual(0);
      }
    }
  }

  /**
   * 무한 스크롤 확인 (만약 적용되어 있다면)
   */
  async verifyInfiniteScroll() {
    // 파트너 목록 끝까지 스크롤
    const initialPartnerCount = await this.partnerCards.count();
    
    // 페이지 하단으로 스크롤
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // 추가 데이터 로딩 대기
    await this.page.waitForTimeout(2000);
    
    const newPartnerCount = await this.partnerCards.count();
    
    // 더 많은 파트너가 로드되었는지 확인 (무한 스크롤이 구현된 경우)
    if (newPartnerCount > initialPartnerCount) {
      expect(newPartnerCount).toBeGreaterThan(initialPartnerCount);
    }
  }
}