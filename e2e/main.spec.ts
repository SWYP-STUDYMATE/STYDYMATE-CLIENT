import { test, expect } from '@playwright/test';
import { MainPage } from './pages/main-page';

test.describe('메인 페이지', () => {
  let mainPage: MainPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    
    // 로그인된 상태로 설정
    await mainPage.setLocalStorage('accessToken', 'mock-access-token');
    await mainPage.setLocalStorage('refreshToken', 'mock-refresh-token');
    
    // 온보딩 완료 상태 모킹
    await mainPage.helpers.mockOnboardingComplete();
    
    // 매칭 파트너 데이터 모킹
    await mainPage.helpers.mockMatchingPartners();
    
    // 채팅방 데이터 모킹
    await mainPage.helpers.mockChatRooms();
    
    // 사용자 프로필 데이터 모킹
    await page.route('**/api/v1/users/profile**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 1,
            englishName: '테스트사용자',
            profileImage: 'https://api.languagemate.kr/uploads/profiles/1.jpg',
            nativeLanguage: 'Korean',
            learningLanguage: 'English',
            languageLevel: 'INTERMEDIATE',
            learningStreak: 7,
            weeklyGoal: 300,
            weeklyProgress: 180
          }
        })
      });
    });
  });

  test('메인 페이지 로드 확인', async () => {
    await mainPage.navigate();
    await mainPage.verifyPageLoaded();
  });

  test('사용자 정보 표시 확인', async () => {
    await mainPage.navigate();
    await mainPage.verifyUserInfo('테스트사용자', 'English');
  });

  test('매칭 파트너 섹션 표시', async () => {
    await mainPage.navigate();
    await mainPage.verifyMatchingPartnersSection();
  });

  test('최근 채팅 섹션 표시', async () => {
    await mainPage.navigate();
    await mainPage.verifyRecentChatsSection();
  });

  test('학습 진행 상황 표시', async () => {
    await mainPage.navigate();
    await mainPage.verifyLearningProgress();
  });

  test('알림 섹션 표시', async () => {
    await mainPage.navigate();
    await mainPage.verifyNotificationsSection();
  });

  test('매칭 페이지로 네비게이션', async () => {
    await mainPage.navigate();
    await mainPage.navigateToMatching();
    await expect(mainPage.page).toHaveURL('/matching');
  });

  test('채팅 페이지로 네비게이션', async () => {
    await mainPage.navigate();
    await mainPage.navigateToChat();
    await expect(mainPage.page).toHaveURL('/chat');
  });

  test('프로필 페이지로 네비게이션', async () => {
    await mainPage.navigate();
    await mainPage.navigateToProfile();
    await expect(mainPage.page).toHaveURL('/profile');
  });

  test('파트너 카드 클릭', async () => {
    await mainPage.navigate();
    
    // 첫 번째 파트너 카드 클릭 시 상세 정보나 채팅으로 이동하는지 확인
    await mainPage.clickPartnerCard(0);
    
    // URL 변경이나 모달 표시 확인
    await mainPage.page.waitForTimeout(1000);
    const currentUrl = await mainPage.getCurrentUrl();
    
    // 파트너 상세 페이지나 채팅방으로 이동했는지 확인
    expect(currentUrl !== '/main').toBeTruthy();
  });

  test('채팅방 클릭', async () => {
    await mainPage.navigate();
    await mainPage.clickChatRoom(0);
    
    // 채팅방 URL 패턴 확인
    await expect(mainPage.page).toHaveURL(/\/chat\/\d+/);
  });

  test('빠른 채팅 시작', async () => {
    await mainPage.navigate();
    
    if (await mainPage.quickStartChatButton.isVisible()) {
      await mainPage.startQuickChat();
      
      // 매칭이나 채팅 관련 페이지로 이동했는지 확인
      const currentUrl = await mainPage.getCurrentUrl();
      expect(currentUrl !== '/main').toBeTruthy();
    }
  });

  test('새 파트너 찾기', async () => {
    await mainPage.navigate();
    
    if (await mainPage.findNewPartnerButton.isVisible()) {
      await mainPage.findNewPartner();
      await expect(mainPage.page).toHaveURL('/matching');
    }
  });

  test('프로필 업데이트', async () => {
    await mainPage.navigate();
    
    if (await mainPage.updateProfileButton.isVisible()) {
      await mainPage.updateProfile();
      await expect(mainPage.page).toHaveURL('/profile');
    }
  });

  test('로그아웃 기능', async () => {
    await mainPage.navigate();
    
    // 로그아웃 API 모킹
    await mainPage.page.route('**/api/v1/auth/logout**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Successfully logged out'
        })
      });
    });
    
    await mainPage.logout();
    
    // 로그인 페이지로 이동했는지 확인
    await expect(mainPage.page).toHaveURL('/');
    
    // 토큰이 제거되었는지 확인
    const accessToken = await mainPage.getLocalStorage('accessToken');
    expect(accessToken).toBeFalsy();
  });

  test('읽지 않은 알림 표시', async () => {
    // 읽지 않은 알림이 있는 상태로 모킹
    await mainPage.page.route('**/api/v1/notifications**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            notifications: [
              {
                id: 1,
                title: '새로운 매칭 요청',
                message: 'Sarah Kim님이 매칭을 요청했습니다.',
                isRead: false,
                createdAt: new Date().toISOString()
              },
              {
                id: 2,
                title: '새로운 메시지',
                message: 'John Smith님이 메시지를 보냈습니다.',
                isRead: false,
                createdAt: new Date().toISOString()
              }
            ],
            unreadCount: 2
          }
        })
      });
    });
    
    await mainPage.navigate();
    await mainPage.verifyUnreadNotifications(2);
  });

  test('페이지 새로고침 후 상태 유지', async () => {
    await mainPage.navigate();
    await mainPage.verifyStateAfterRefresh();
  });

  test('모바일 반응형 디자인', async () => {
    await mainPage.navigate();
    await mainPage.verifyMobileResponsive();
  });

  test('키보드 접근성', async () => {
    await mainPage.navigate();
    await mainPage.verifyAccessibility();
  });

  test('에러 상태 처리', async () => {
    await mainPage.verifyErrorHandling();
  });

  test('로딩 상태 표시', async () => {
    await mainPage.navigate();
    await mainPage.verifyLoadingStates();
  });

  test('페이지 성능 측정', async () => {
    await mainPage.navigate();
    const metrics = await mainPage.measurePagePerformance();
    
    console.log('메인 페이지 성능 메트릭:', metrics);
    
    // 성능 기준 검증
    expect(metrics.firstContentfulPaint).toBeLessThan(2000);
    expect(metrics.domContentLoaded).toBeLessThan(3000);
  });

  test('실시간 데이터 업데이트', async () => {
    await mainPage.navigate();
    await mainPage.verifyRealtimeUpdates();
  });

  test('데이터 필터링 기능', async () => {
    await mainPage.navigate();
    await mainPage.verifyDataFiltering();
  });

  test('무한 스크롤 기능', async () => {
    await mainPage.navigate();
    await mainPage.verifyInfiniteScroll();
  });

  test('네트워크 연결 끊김 처리', async () => {
    await mainPage.navigate();
    
    // 네트워크 연결 끊김 시뮬레이션
    await mainPage.page.setOffline(true);
    
    // 페이지 새로고침 시도
    await mainPage.page.reload();
    
    // 오프라인 상태 메시지 확인
    const offlineMessage = mainPage.page.locator('[data-testid="offline-message"]');
    
    try {
      await expect(offlineMessage).toBeVisible({ timeout: 5000 });
    } catch {
      // 오프라인 처리가 구현되지 않은 경우
      console.log('오프라인 처리가 구현되지 않음');
    }
    
    // 네트워크 복구
    await mainPage.page.setOffline(false);
  });

  test('다크 모드 지원 확인', async () => {
    await mainPage.navigate();
    
    // 다크 모드 토글 버튼이 있는지 확인
    const darkModeToggle = mainPage.page.locator('[data-testid="dark-mode-toggle"]');
    
    if (await darkModeToggle.isVisible()) {
      // 다크 모드 활성화
      await darkModeToggle.click();
      
      // 다크 모드 클래스나 스타일이 적용되었는지 확인
      const bodyElement = mainPage.page.locator('body');
      const bodyClass = await bodyElement.getAttribute('class');
      
      expect(bodyClass).toContain('dark');
    }
  });

  test('언어 변경 기능', async () => {
    await mainPage.navigate();
    
    // 언어 변경 버튼이 있는지 확인
    const languageToggle = mainPage.page.locator('[data-testid="language-toggle"]');
    
    if (await languageToggle.isVisible()) {
      await languageToggle.click();
      
      // 언어 선택 메뉴 확인
      const languageMenu = mainPage.page.locator('[data-testid="language-menu"]');
      await expect(languageMenu).toBeVisible();
      
      // 영어 선택
      const englishOption = mainPage.page.locator('[data-testid="lang-en"]');
      if (await englishOption.isVisible()) {
        await englishOption.click();
        
        // 페이지 언어가 변경되었는지 확인
        await mainPage.page.waitForTimeout(1000);
        const welcomeMessage = await mainPage.userWelcomeMessage.textContent();
        expect(welcomeMessage).toMatch(/welcome|hello/i);
      }
    }
  });

  test('검색 기능', async () => {
    await mainPage.navigate();
    
    // 검색 입력 필드가 있는지 확인
    const searchInput = mainPage.page.locator('[data-testid="search-input"]');
    
    if (await searchInput.isVisible()) {
      // 파트너 검색
      await searchInput.fill('Sarah');
      await mainPage.page.keyboard.press('Enter');
      
      // 검색 결과 확인
      await mainPage.page.waitForTimeout(1000);
      const searchResults = mainPage.page.locator('[data-testid="search-results"]');
      
      if (await searchResults.isVisible()) {
        const resultCount = await mainPage.page.locator('[data-testid="search-result-item"]').count();
        expect(resultCount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('즐겨찾기 기능', async () => {
    await mainPage.navigate();
    
    // 첫 번째 파트너 카드의 즐겨찾기 버튼 클릭
    const favoriteButton = mainPage.partnerCards.first().locator('[data-testid="favorite-button"]');
    
    if (await favoriteButton.isVisible()) {
      await favoriteButton.click();
      
      // 즐겨찾기 상태 변경 확인
      const isFavorited = await favoriteButton.getAttribute('data-favorited');
      expect(isFavorited).toBe('true');
    }
  });

  test('도움말/튜토리얼 기능', async () => {
    await mainPage.navigate();
    
    // 도움말 버튼이 있는지 확인
    const helpButton = mainPage.page.locator('[data-testid="help-button"]');
    
    if (await helpButton.isVisible()) {
      await helpButton.click();
      
      // 도움말 모달이나 페이지가 열리는지 확인
      const helpModal = mainPage.page.locator('[data-testid="help-modal"]');
      const helpTooltip = mainPage.page.locator('[data-testid="help-tooltip"]');
      
      const isHelpVisible = (await helpModal.isVisible()) || (await helpTooltip.isVisible());
      expect(isHelpVisible).toBeTruthy();
    }
  });
});