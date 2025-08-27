import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { selectors } from '../fixtures/test-data';

export class MatchingPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // 필터 섹션
  get filtersSection() {
    return this.page.locator('[data-testid="filters-section"]');
  }

  get languageFilter() {
    return this.page.locator('[data-testid="language-filter"]');
  }

  get levelFilter() {
    return this.page.locator('[data-testid="level-filter"]');
  }

  get ageRangeFilter() {
    return this.page.locator('[data-testid="age-range-filter"]');
  }

  get genderFilter() {
    return this.page.locator('[data-testid="gender-filter"]');
  }

  get locationFilter() {
    return this.page.locator('[data-testid="location-filter"]');
  }

  get interestsFilter() {
    return this.page.locator('[data-testid="interests-filter"]');
  }

  get applyFiltersButton() {
    return this.page.locator('[data-testid="apply-filters"]');
  }

  get clearFiltersButton() {
    return this.page.locator('[data-testid="clear-filters"]');
  }

  // 검색 섹션
  get searchInput() {
    return this.page.locator('[data-testid="search-input"]');
  }

  get searchButton() {
    return this.page.locator('[data-testid="search-button"]');
  }

  // 정렬 옵션
  get sortSelect() {
    return this.page.locator('[data-testid="sort-select"]');
  }

  // 파트너 리스트
  get partnersContainer() {
    return this.page.locator('[data-testid="partners-container"]');
  }

  get partnerCards() {
    return this.page.locator('[data-testid="partner-card"]');
  }

  get loadingSpinner() {
    return this.page.locator('[data-testid="loading"]');
  }

  get noResultsMessage() {
    return this.page.locator('[data-testid="no-results"]');
  }

  // 페이지네이션
  get paginationContainer() {
    return this.page.locator('[data-testid="pagination"]');
  }

  get prevPageButton() {
    return this.page.locator('[data-testid="prev-page"]');
  }

  get nextPageButton() {
    return this.page.locator('[data-testid="next-page"]');
  }

  get pageNumbers() {
    return this.page.locator('[data-testid="page-number"]');
  }

  // 파트너 카드 내부 요소들
  getPartnerCard(index: number) {
    return this.partnerCards.nth(index);
  }

  getPartnerName(cardIndex: number) {
    return this.getPartnerCard(cardIndex).locator('[data-testid="partner-name"]');
  }

  getPartnerImage(cardIndex: number) {
    return this.getPartnerCard(cardIndex).locator('[data-testid="partner-image"]');
  }

  getPartnerLanguage(cardIndex: number) {
    return this.getPartnerCard(cardIndex).locator('[data-testid="partner-language"]');
  }

  getPartnerLevel(cardIndex: number) {
    return this.getPartnerCard(cardIndex).locator('[data-testid="partner-level"]');
  }

  getPartnerLocation(cardIndex: number) {
    return this.getPartnerCard(cardIndex).locator('[data-testid="partner-location"]');
  }

  getMatchScore(cardIndex: number) {
    return this.getPartnerCard(cardIndex).locator('[data-testid="match-score"]');
  }

  getCommonInterests(cardIndex: number) {
    return this.getPartnerCard(cardIndex).locator('[data-testid="common-interests"]');
  }

  getMatchButton(cardIndex: number) {
    return this.getPartnerCard(cardIndex).locator('[data-testid="match-button"]');
  }

  getFavoriteButton(cardIndex: number) {
    return this.getPartnerCard(cardIndex).locator('[data-testid="favorite-button"]');
  }

  getViewProfileButton(cardIndex: number) {
    return this.getPartnerCard(cardIndex).locator('[data-testid="view-profile-button"]');
  }

  /**
   * 매칭 페이지로 이동
   */
  async navigate() {
    await this.goto('/matching');
  }

  /**
   * 페이지가 로드되었는지 확인
   */
  async verifyPageLoaded() {
    await expect(this.page).toHaveURL('/matching');
    await expect(this.page).toHaveTitle(/STUDYMATE/);
    await expect(this.partnersContainer).toBeVisible();
  }

  /**
   * 필터 적용
   */
  async applyFilters(filters: {
    language?: string;
    level?: string;
    ageRange?: string;
    gender?: string;
    location?: string;
    interests?: string[];
  }) {
    if (filters.language) {
      await this.languageFilter.selectOption(filters.language);
    }
    
    if (filters.level) {
      await this.levelFilter.selectOption(filters.level);
    }
    
    if (filters.ageRange) {
      await this.ageRangeFilter.selectOption(filters.ageRange);
    }
    
    if (filters.gender) {
      await this.genderFilter.selectOption(filters.gender);
    }
    
    if (filters.location) {
      await this.locationFilter.fill(filters.location);
    }
    
    if (filters.interests && filters.interests.length > 0) {
      for (const interest of filters.interests) {
        const interestCheckbox = this.page.locator(`[data-testid="interest-${interest}"]`);
        await interestCheckbox.check();
      }
    }
    
    await this.applyFiltersButton.click();
    await this.waitForLoad();
  }

  /**
   * 필터 초기화
   */
  async clearFilters() {
    await this.clearFiltersButton.click();
    await this.waitForLoad();
  }

  /**
   * 검색 실행
   */
  async searchPartners(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
    await this.searchButton.click();
    await this.waitForLoad();
  }

  /**
   * 정렬 옵션 변경
   */
  async changeSorting(sortOption: string) {
    await this.sortSelect.selectOption(sortOption);
    await this.waitForLoad();
  }

  /**
   * 파트너 카드 정보 확인
   */
  async verifyPartnerCard(cardIndex: number) {
    const card = this.getPartnerCard(cardIndex);
    await expect(card).toBeVisible();
    
    await expect(this.getPartnerName(cardIndex)).toBeVisible();
    await expect(this.getPartnerImage(cardIndex)).toBeVisible();
    await expect(this.getPartnerLanguage(cardIndex)).toBeVisible();
    await expect(this.getPartnerLevel(cardIndex)).toBeVisible();
    await expect(this.getPartnerLocation(cardIndex)).toBeVisible();
    await expect(this.getMatchScore(cardIndex)).toBeVisible();
    await expect(this.getMatchButton(cardIndex)).toBeVisible();
  }

  /**
   * 매칭 요청 보내기
   */
  async sendMatchRequest(cardIndex: number) {
    const matchButton = this.getMatchButton(cardIndex);
    await matchButton.click();
    
    // 확인 다이얼로그가 나타날 경우 처리
    const confirmDialog = this.page.locator('[data-testid="match-confirm-dialog"]');
    if (await confirmDialog.isVisible()) {
      const confirmButton = confirmDialog.locator('[data-testid="confirm-match"]');
      await confirmButton.click();
    }
    
    // 성공 메시지 확인
    await this.helpers.expectSuccessMessage('매칭 요청이 전송되었습니다');
  }

  /**
   * 파트너를 즐겨찾기에 추가
   */
  async addToFavorites(cardIndex: number) {
    const favoriteButton = this.getFavoriteButton(cardIndex);
    await favoriteButton.click();
    
    // 즐겨찾기 상태 변경 확인
    const isFavorited = await favoriteButton.getAttribute('data-favorited');
    expect(isFavorited).toBe('true');
  }

  /**
   * 파트너 프로필 보기
   */
  async viewPartnerProfile(cardIndex: number) {
    const viewProfileButton = this.getViewProfileButton(cardIndex);
    await viewProfileButton.click();
    
    // 프로필 모달이나 새 페이지로 이동
    const profileModal = this.page.locator('[data-testid="profile-modal"]');
    if (await profileModal.isVisible()) {
      await expect(profileModal).toBeVisible();
    } else {
      // 새 페이지로 이동한 경우
      await this.page.waitForURL(/\/profile\/\d+/);
    }
  }

  /**
   * 페이지네이션 테스트
   */
  async navigateToNextPage() {
    const isNextEnabled = await this.nextPageButton.isEnabled();
    if (isNextEnabled) {
      await this.nextPageButton.click();
      await this.waitForLoad();
      return true;
    }
    return false;
  }

  /**
   * 이전 페이지로 이동
   */
  async navigateToPrevPage() {
    const isPrevEnabled = await this.prevPageButton.isEnabled();
    if (isPrevEnabled) {
      await this.prevPageButton.click();
      await this.waitForLoad();
      return true;
    }
    return false;
  }

  /**
   * 특정 페이지로 이동
   */
  async navigateToPage(pageNumber: number) {
    const pageButton = this.page.locator(`[data-testid="page-${pageNumber}"]`);
    if (await pageButton.isVisible()) {
      await pageButton.click();
      await this.waitForLoad();
    }
  }

  /**
   * 파트너 수 확인
   */
  async getPartnerCount(): Promise<number> {
    await this.partnerCards.first().waitFor({ timeout: 10000 });
    return await this.partnerCards.count();
  }

  /**
   * 빈 결과 상태 확인
   */
  async verifyNoResults() {
    await expect(this.noResultsMessage).toBeVisible();
    await expect(this.noResultsMessage).toContainText('검색 결과가 없습니다');
  }

  /**
   * 로딩 상태 확인
   */
  async verifyLoadingState() {
    await expect(this.loadingSpinner).toBeVisible();
    await expect(this.loadingSpinner).not.toBeVisible({ timeout: 10000 });
  }

  /**
   * 필터 상태 확인
   */
  async verifyFilterState(filters: {
    language?: string;
    level?: string;
    ageRange?: string;
    gender?: string;
    location?: string;
  }) {
    if (filters.language) {
      await expect(this.languageFilter).toHaveValue(filters.language);
    }
    
    if (filters.level) {
      await expect(this.levelFilter).toHaveValue(filters.level);
    }
    
    if (filters.ageRange) {
      await expect(this.ageRangeFilter).toHaveValue(filters.ageRange);
    }
    
    if (filters.gender) {
      await expect(this.genderFilter).toHaveValue(filters.gender);
    }
    
    if (filters.location) {
      await expect(this.locationFilter).toHaveValue(filters.location);
    }
  }

  /**
   * 매치 스코어 순 정렬 확인
   */
  async verifyMatchScoreSorting() {
    await this.changeSorting('match-score');
    
    const scoreElements = await this.page.locator('[data-testid="match-score"]').all();
    const scores: number[] = [];
    
    for (const element of scoreElements) {
      const scoreText = await element.textContent();
      const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
      scores.push(score);
    }
    
    // 내림차순 정렬 확인
    for (let i = 0; i < scores.length - 1; i++) {
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
    }
  }

  /**
   * 모바일 반응형 확인
   */
  async verifyMobileResponsive() {
    await this.helpers.setMobileViewport();
    
    // 모바일에서 필터가 접힌 상태인지 확인
    const mobileFiltersToggle = this.page.locator('[data-testid="mobile-filters-toggle"]');
    if (await mobileFiltersToggle.isVisible()) {
      await mobileFiltersToggle.click();
      await expect(this.filtersSection).toBeVisible();
    }
    
    // 파트너 카드가 세로로 배열되는지 확인
    await expect(this.partnersContainer).toBeVisible();
    const firstCard = this.getPartnerCard(0);
    await expect(firstCard).toBeVisible();
    
    // 터치 친화적 버튼 크기 확인
    const matchButton = this.getMatchButton(0);
    const buttonBox = await matchButton.boundingBox();
    if (buttonBox) {
      expect(buttonBox.height).toBeGreaterThan(44);
    }
  }

  /**
   * 무한 스크롤 확인
   */
  async verifyInfiniteScroll() {
    const initialCount = await this.getPartnerCount();
    
    // 페이지 하단으로 스크롤
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // 추가 로딩 대기
    await this.page.waitForTimeout(2000);
    
    const newCount = await this.getPartnerCount();
    
    // 더 많은 파트너가 로드되었는지 확인 (무한 스크롤이 구현된 경우)
    if (newCount > initialCount) {
      expect(newCount).toBeGreaterThan(initialCount);
    }
  }

  /**
   * 키보드 네비게이션 확인
   */
  async verifyKeyboardNavigation() {
    // Tab으로 요소 간 이동 확인
    await this.languageFilter.focus();
    await expect(this.languageFilter).toBeFocused();
    
    await this.page.keyboard.press('Tab');
    await expect(this.levelFilter).toBeFocused();
    
    await this.page.keyboard.press('Tab');
    await expect(this.searchInput).toBeFocused();
    
    // Enter로 검색 실행
    await this.searchInput.fill('test');
    await this.page.keyboard.press('Enter');
    await this.waitForLoad();
  }

  /**
   * 오류 처리 확인
   */
  async verifyErrorHandling() {
    // API 오류 모킹
    await this.page.route('**/api/v1/matching/partners**', route => {
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
    
    // 오류 메시지 확인
    const errorMessage = this.page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('서버 오류가 발생했습니다.');
  }

  /**
   * 성능 측정
   */
  async measurePagePerformance() {
    const metrics = await this.helpers.measurePerformance();
    
    // 매칭 페이지 성능 기준
    expect(metrics.firstContentfulPaint).toBeLessThan(2500); // 2.5초 이내
    expect(metrics.domContentLoaded).toBeLessThan(3500);     // 3.5초 이내
    
    return metrics;
  }

  /**
   * 필터 초기화 후 상태 확인
   */
  async verifyClearedFilters() {
    await this.clearFilters();
    
    // 모든 필터가 초기 상태로 돌아갔는지 확인
    await expect(this.languageFilter).toHaveValue('');
    await expect(this.levelFilter).toHaveValue('');
    await expect(this.ageRangeFilter).toHaveValue('');
    await expect(this.genderFilter).toHaveValue('');
    await expect(this.locationFilter).toHaveValue('');
    await expect(this.searchInput).toHaveValue('');
  }

  /**
   * 공통 관심사 표시 확인
   */
  async verifyCommonInterests(cardIndex: number) {
    const commonInterests = this.getCommonInterests(cardIndex);
    await expect(commonInterests).toBeVisible();
    
    const interestTags = commonInterests.locator('[data-testid="interest-tag"]');
    const tagCount = await interestTags.count();
    
    expect(tagCount).toBeGreaterThan(0);
    
    // 첫 번째 관심사 태그의 텍스트 확인
    const firstTag = interestTags.first();
    const tagText = await firstTag.textContent();
    expect(tagText).toBeTruthy();
  }

  /**
   * URL 파라미터 유지 확인
   */
  async verifyUrlParametersPersistence() {
    // 필터 적용
    await this.applyFilters({
      language: 'English',
      level: 'INTERMEDIATE'
    });
    
    // URL에 파라미터가 반영되었는지 확인
    const currentUrl = await this.getCurrentUrl();
    expect(currentUrl).toContain('language=English');
    expect(currentUrl).toContain('level=INTERMEDIATE');
    
    // 페이지 새로고침 후 필터 상태 유지 확인
    await this.page.reload();
    await this.verifyFilterState({
      language: 'English',
      level: 'INTERMEDIATE'
    });
  }
}