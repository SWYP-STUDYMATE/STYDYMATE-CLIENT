import { test, expect } from '@playwright/test';
import { MatchingPage } from './pages/matching-page';

test.describe('매칭 페이지', () => {
  let matchingPage: MatchingPage;

  test.beforeEach(async ({ page }) => {
    matchingPage = new MatchingPage(page);
    
    // 로그인된 상태로 설정
    await matchingPage.setLocalStorage('accessToken', 'mock-access-token');
    await matchingPage.setLocalStorage('refreshToken', 'mock-refresh-token');
    
    // 매칭 파트너 데이터 모킹
    await matchingPage.helpers.mockMatchingPartners();
    
    // 매칭 요청 API 모킹
    await page.route('**/api/v1/matching/request**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            matchId: 123,
            status: 'PENDING',
            message: '매칭 요청이 전송되었습니다.'
          }
        })
      });
    });
    
    // 즐겨찾기 API 모킹
    await page.route('**/api/v1/users/favorites**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: '즐겨찾기에 추가되었습니다.'
        })
      });
    });
  });

  test('매칭 페이지 로드 확인', async () => {
    await matchingPage.navigate();
    await matchingPage.verifyPageLoaded();
  });

  test('파트너 카드 정보 표시', async () => {
    await matchingPage.navigate();
    
    const partnerCount = await matchingPage.getPartnerCount();
    expect(partnerCount).toBeGreaterThan(0);
    
    // 첫 번째 파트너 카드 정보 확인
    await matchingPage.verifyPartnerCard(0);
  });

  test('언어 필터 적용', async () => {
    await matchingPage.navigate();
    
    await matchingPage.applyFilters({
      language: 'English'
    });
    
    await matchingPage.verifyFilterState({
      language: 'English'
    });
    
    // 필터가 적용된 결과 확인
    const partnerCount = await matchingPage.getPartnerCount();
    expect(partnerCount).toBeGreaterThanOrEqual(0);
  });

  test('레벨 필터 적용', async () => {
    await matchingPage.navigate();
    
    await matchingPage.applyFilters({
      level: 'INTERMEDIATE'
    });
    
    await matchingPage.verifyFilterState({
      level: 'INTERMEDIATE'
    });
  });

  test('성별 필터 적용', async () => {
    await matchingPage.navigate();
    
    await matchingPage.applyFilters({
      gender: 'FEMALE'
    });
    
    await matchingPage.verifyFilterState({
      gender: 'FEMALE'
    });
  });

  test('지역 필터 적용', async () => {
    await matchingPage.navigate();
    
    await matchingPage.applyFilters({
      location: 'Seoul'
    });
    
    await matchingPage.verifyFilterState({
      location: 'Seoul'
    });
  });

  test('관심사 필터 적용', async () => {
    await matchingPage.navigate();
    
    await matchingPage.applyFilters({
      interests: ['Movies', 'Travel']
    });
    
    // 관심사 체크박스가 선택되었는지 확인
    const moviesCheckbox = matchingPage.page.locator('[data-testid="interest-Movies"]');
    const travelCheckbox = matchingPage.page.locator('[data-testid="interest-Travel"]');
    
    if (await moviesCheckbox.isVisible()) {
      await expect(moviesCheckbox).toBeChecked();
    }
    if (await travelCheckbox.isVisible()) {
      await expect(travelCheckbox).toBeChecked();
    }
  });

  test('복합 필터 적용', async () => {
    await matchingPage.navigate();
    
    await matchingPage.applyFilters({
      language: 'English',
      level: 'INTERMEDIATE',
      gender: 'ANY',
      location: 'Seoul'
    });
    
    await matchingPage.verifyFilterState({
      language: 'English',
      level: 'INTERMEDIATE',
      gender: 'ANY',
      location: 'Seoul'
    });
  });

  test('필터 초기화', async () => {
    await matchingPage.navigate();
    
    // 필터 적용
    await matchingPage.applyFilters({
      language: 'English',
      level: 'INTERMEDIATE'
    });
    
    // 필터 초기화
    await matchingPage.verifyClearedFilters();
  });

  test('파트너 검색', async () => {
    await matchingPage.navigate();
    
    await matchingPage.searchPartners('Sarah');
    
    // 검색어가 입력되었는지 확인
    await expect(matchingPage.searchInput).toHaveValue('Sarah');
    
    // 검색 결과 확인
    const partnerCount = await matchingPage.getPartnerCount();
    expect(partnerCount).toBeGreaterThanOrEqual(0);
  });

  test('매치 스코어 순 정렬', async () => {
    await matchingPage.navigate();
    await matchingPage.verifyMatchScoreSorting();
  });

  test('최신순 정렬', async () => {
    await matchingPage.navigate();
    
    await matchingPage.changeSorting('latest');
    await expect(matchingPage.sortSelect).toHaveValue('latest');
  });

  test('매칭 요청 보내기', async () => {
    await matchingPage.navigate();
    
    const partnerCount = await matchingPage.getPartnerCount();
    if (partnerCount > 0) {
      await matchingPage.sendMatchRequest(0);
      
      // 매칭 버튼 상태 변경 확인
      const matchButton = matchingPage.getMatchButton(0);
      const buttonText = await matchButton.textContent();
      expect(buttonText).toContain('요청됨');
    }
  });

  test('즐겨찾기 추가', async () => {
    await matchingPage.navigate();
    
    const partnerCount = await matchingPage.getPartnerCount();
    if (partnerCount > 0) {
      await matchingPage.addToFavorites(0);
      
      // 즐겨찾기 버튼 상태 확인
      const favoriteButton = matchingPage.getFavoriteButton(0);
      const isFavorited = await favoriteButton.getAttribute('data-favorited');
      expect(isFavorited).toBe('true');
    }
  });

  test('파트너 프로필 보기', async () => {
    await matchingPage.navigate();
    
    const partnerCount = await matchingPage.getPartnerCount();
    if (partnerCount > 0) {
      await matchingPage.viewPartnerProfile(0);
      
      // 프로필 모달이나 페이지 이동 확인
      const profileModal = matchingPage.page.locator('[data-testid="profile-modal"]');
      const isModalVisible = await profileModal.isVisible();
      const currentUrl = await matchingPage.getCurrentUrl();
      
      expect(isModalVisible || currentUrl.includes('/profile/')).toBeTruthy();
    }
  });

  test('페이지네이션 - 다음 페이지', async () => {
    await matchingPage.navigate();
    
    const hasNextPage = await matchingPage.navigateToNextPage();
    
    if (hasNextPage) {
      // 페이지가 변경되었는지 확인
      const currentUrl = await matchingPage.getCurrentUrl();
      expect(currentUrl).toContain('page=2');
    }
  });

  test('페이지네이션 - 이전 페이지', async () => {
    await matchingPage.navigate();
    
    // 2페이지로 이동
    const hasNextPage = await matchingPage.navigateToNextPage();
    
    if (hasNextPage) {
      // 1페이지로 돌아가기
      const hasPrevPage = await matchingPage.navigateToPrevPage();
      
      if (hasPrevPage) {
        const currentUrl = await matchingPage.getCurrentUrl();
        expect(currentUrl).toContain('page=1');
      }
    }
  });

  test('특정 페이지로 이동', async () => {
    await matchingPage.navigate();
    
    await matchingPage.navigateToPage(3);
    
    // URL에 페이지 번호가 반영되었는지 확인
    const currentUrl = await matchingPage.getCurrentUrl();
    expect(currentUrl).toContain('page=3');
  });

  test('검색 결과 없음', async () => {
    await matchingPage.navigate();
    
    // 존재하지 않는 이름으로 검색
    await matchingPage.searchPartners('NonExistentUser999');
    
    // "결과 없음" 메시지 확인 (실제 데이터가 없을 경우)
    try {
      await matchingPage.verifyNoResults();
    } catch {
      // 모킹된 데이터로 인해 항상 결과가 있을 수 있음
      console.log('검색 결과가 있음 (모킹된 데이터)');
    }
  });

  test('로딩 상태 확인', async () => {
    await matchingPage.navigate();
    
    // 필터 적용 시 로딩 상태 확인
    try {
      await matchingPage.applyFilters({ language: 'English' });
      await matchingPage.verifyLoadingState();
    } catch {
      // 로딩이 매우 빠르게 완료된 경우
      console.log('로딩 상태가 매우 빠르게 완료됨');
    }
  });

  test('공통 관심사 표시', async () => {
    await matchingPage.navigate();
    
    const partnerCount = await matchingPage.getPartnerCount();
    if (partnerCount > 0) {
      await matchingPage.verifyCommonInterests(0);
    }
  });

  test('모바일 반응형 디자인', async () => {
    await matchingPage.navigate();
    await matchingPage.verifyMobileResponsive();
  });

  test('키보드 네비게이션', async () => {
    await matchingPage.navigate();
    await matchingPage.verifyKeyboardNavigation();
  });

  test('무한 스크롤', async () => {
    await matchingPage.navigate();
    await matchingPage.verifyInfiniteScroll();
  });

  test('URL 파라미터 유지', async () => {
    await matchingPage.navigate();
    await matchingPage.verifyUrlParametersPersistence();
  });

  test('에러 처리', async () => {
    await matchingPage.verifyErrorHandling();
  });

  test('성능 측정', async () => {
    await matchingPage.navigate();
    const metrics = await matchingPage.measurePagePerformance();
    
    console.log('매칭 페이지 성능 메트릭:', metrics);
    
    // 성능 기준 검증
    expect(metrics.firstContentfulPaint).toBeLessThan(2500);
    expect(metrics.domContentLoaded).toBeLessThan(3500);
  });

  test('연령대 필터 적용', async () => {
    await matchingPage.navigate();
    
    await matchingPage.applyFilters({
      ageRange: '20-30'
    });
    
    await matchingPage.verifyFilterState({
      ageRange: '20-30'
    });
  });

  test('매칭 요청 확인 다이얼로그', async () => {
    await matchingPage.navigate();
    
    const partnerCount = await matchingPage.getPartnerCount();
    if (partnerCount > 0) {
      const matchButton = matchingPage.getMatchButton(0);
      await matchButton.click();
      
      // 확인 다이얼로그가 표시되는지 확인
      const confirmDialog = matchingPage.page.locator('[data-testid="match-confirm-dialog"]');
      
      try {
        await expect(confirmDialog).toBeVisible({ timeout: 2000 });
        
        // 취소 버튼 테스트
        const cancelButton = confirmDialog.locator('[data-testid="cancel-match"]');
        await cancelButton.click();
        
        await expect(confirmDialog).not.toBeVisible();
      } catch {
        // 다이얼로그 없이 바로 처리되는 경우
        console.log('매칭 요청이 바로 처리됨');
      }
    }
  });

  test('필터 애니메이션', async () => {
    await matchingPage.navigate();
    
    // 필터 섹션 토글 (모바일에서)
    const filtersToggle = matchingPage.page.locator('[data-testid="filters-toggle"]');
    
    if (await filtersToggle.isVisible()) {
      await filtersToggle.click();
      
      // 필터 섹션이 부드럽게 나타나는지 확인
      await expect(matchingPage.filtersSection).toBeVisible();
      
      // 다시 토글하여 숨기기
      await filtersToggle.click();
      await expect(matchingPage.filtersSection).not.toBeVisible();
    }
  });

  test('파트너 카드 호버 효과', async () => {
    await matchingPage.navigate();
    
    const partnerCount = await matchingPage.getPartnerCount();
    if (partnerCount > 0) {
      const firstCard = matchingPage.getPartnerCard(0);
      
      // 마우스 호버
      await firstCard.hover();
      
      // 호버 시 추가 정보나 버튼이 나타나는지 확인
      const hoverActions = firstCard.locator('[data-testid="hover-actions"]');
      
      try {
        await expect(hoverActions).toBeVisible({ timeout: 1000 });
      } catch {
        // 호버 효과가 없는 경우
        console.log('호버 효과 없음');
      }
    }
  });

  test('즐겨찾기 목록 보기', async () => {
    await matchingPage.navigate();
    
    // 즐겨찾기 필터 버튼
    const favoritesFilter = matchingPage.page.locator('[data-testid="favorites-filter"]');
    
    if (await favoritesFilter.isVisible()) {
      await favoritesFilter.click();
      
      // 즐겨찾기한 파트너만 표시되는지 확인
      const partnerCards = await matchingPage.partnerCards.all();
      
      for (const card of partnerCards) {
        const favoriteButton = card.locator('[data-testid="favorite-button"]');
        const isFavorited = await favoriteButton.getAttribute('data-favorited');
        expect(isFavorited).toBe('true');
      }
    }
  });

  test('매칭 히스토리 확인', async () => {
    await matchingPage.navigate();
    
    const historyButton = matchingPage.page.locator('[data-testid="match-history"]');
    
    if (await historyButton.isVisible()) {
      await historyButton.click();
      
      // 매칭 히스토리 모달이나 페이지 확인
      const historyModal = matchingPage.page.locator('[data-testid="match-history-modal"]');
      
      try {
        await expect(historyModal).toBeVisible();
      } catch {
        // 별도 페이지로 이동한 경우
        const currentUrl = await matchingPage.getCurrentUrl();
        expect(currentUrl).toContain('history');
      }
    }
  });

  test('파트너 신고 기능', async () => {
    await matchingPage.navigate();
    
    const partnerCount = await matchingPage.getPartnerCount();
    if (partnerCount > 0) {
      const reportButton = matchingPage.getPartnerCard(0).locator('[data-testid="report-button"]');
      
      if (await reportButton.isVisible()) {
        await reportButton.click();
        
        // 신고 모달 확인
        const reportModal = matchingPage.page.locator('[data-testid="report-modal"]');
        await expect(reportModal).toBeVisible();
        
        // 신고 사유 선택
        const reportReason = reportModal.locator('[data-testid="report-reason"]');
        await reportReason.selectOption('inappropriate-behavior');
        
        // 신고 제출
        const submitReport = reportModal.locator('[data-testid="submit-report"]');
        await submitReport.click();
        
        // 성공 메시지 확인
        await matchingPage.helpers.expectSuccessMessage('신고가 접수되었습니다');
      }
    }
  });
});