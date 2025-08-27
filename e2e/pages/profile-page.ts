import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { selectors } from '../fixtures/test-data';

export class ProfilePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // 프로필 헤더
  get profileHeader() {
    return this.page.locator('[data-testid="profile-header"]');
  }

  get profileImage() {
    return this.page.locator('[data-testid="profile-image"]');
  }

  get uploadImageButton() {
    return this.page.locator('[data-testid="upload-image-button"]');
  }

  get userName() {
    return this.page.locator('[data-testid="user-name"]');
  }

  get userLocation() {
    return this.page.locator('[data-testid="user-location"]');
  }

  get editButton() {
    return this.page.locator('[data-testid="edit-profile-button"]');
  }

  // 기본 정보 섹션
  get basicInfoSection() {
    return this.page.locator('[data-testid="basic-info-section"]');
  }

  get englishNameField() {
    return this.page.locator('[data-testid="english-name"]');
  }

  get englishNameInput() {
    return this.page.locator('[data-testid="english-name-input"]');
  }

  get residenceField() {
    return this.page.locator('[data-testid="residence"]');
  }

  get residenceInput() {
    return this.page.locator('[data-testid="residence-input"]');
  }

  get introField() {
    return this.page.locator('[data-testid="intro"]');
  }

  get introTextarea() {
    return this.page.locator('[data-testid="intro-textarea"]');
  }

  // 언어 정보 섹션
  get languageInfoSection() {
    return this.page.locator('[data-testid="language-info-section"]');
  }

  get nativeLanguage() {
    return this.page.locator('[data-testid="native-language"]');
  }

  get learningLanguage() {
    return this.page.locator('[data-testid="learning-language"]');
  }

  get languageLevel() {
    return this.page.locator('[data-testid="language-level"]');
  }

  get languageLevelSelect() {
    return this.page.locator('[data-testid="language-level-select"]');
  }

  // 관심사 섹션
  get interestsSection() {
    return this.page.locator('[data-testid="interests-section"]');
  }

  get interestTags() {
    return this.page.locator('[data-testid="interest-tag"]');
  }

  get interestCheckboxes() {
    return this.page.locator('[data-testid="interest-checkbox"]');
  }

  get addInterestButton() {
    return this.page.locator('[data-testid="add-interest-button"]');
  }

  // 학습 통계 섹션
  get statsSection() {
    return this.page.locator('[data-testid="stats-section"]');
  }

  get learningStreak() {
    return this.page.locator('[data-testid="learning-streak"]');
  }

  get totalStudyTime() {
    return this.page.locator('[data-testid="total-study-time"]');
  }

  get completedSessions() {
    return this.page.locator('[data-testid="completed-sessions"]');
  }

  get currentPartners() {
    return this.page.locator('[data-testid="current-partners"]');
  }

  // 학습 목표 섹션
  get goalsSection() {
    return this.page.locator('[data-testid="goals-section"]');
  }

  get dailyGoal() {
    return this.page.locator('[data-testid="daily-goal"]');
  }

  get dailyGoalInput() {
    return this.page.locator('[data-testid="daily-goal-input"]');
  }

  get weeklyGoal() {
    return this.page.locator('[data-testid="weekly-goal"]');
  }

  get weeklyGoalInput() {
    return this.page.locator('[data-testid="weekly-goal-input"]');
  }

  // 설정 섹션
  get settingsSection() {
    return this.page.locator('[data-testid="settings-section"]');
  }

  get notificationSettings() {
    return this.page.locator('[data-testid="notification-settings"]');
  }

  get emailNotificationToggle() {
    return this.page.locator('[data-testid="email-notification-toggle"]');
  }

  get pushNotificationToggle() {
    return this.page.locator('[data-testid="push-notification-toggle"]');
  }

  get languagePreference() {
    return this.page.locator('[data-testid="language-preference"]');
  }

  get privacySettings() {
    return this.page.locator('[data-testid="privacy-settings"]');
  }

  get profileVisibilityToggle() {
    return this.page.locator('[data-testid="profile-visibility-toggle"]');
  }

  // 계정 관리 섹션
  get accountSection() {
    return this.page.locator('[data-testid="account-section"]');
  }

  get changePasswordButton() {
    return this.page.locator('[data-testid="change-password-button"]');
  }

  get deleteAccountButton() {
    return this.page.locator('[data-testid="delete-account-button"]');
  }

  get logoutButton() {
    return this.page.locator('[data-testid="logout-button"]');
  }

  // 저장/취소 버튼
  get saveButton() {
    return this.page.locator('[data-testid="save-button"]');
  }

  get cancelButton() {
    return this.page.locator('[data-testid="cancel-button"]');
  }

  // 파일 업로드 관련
  get imageUploadModal() {
    return this.page.locator('[data-testid="image-upload-modal"]');
  }

  get imageFileInput() {
    return this.page.locator('[data-testid="image-file-input"]');
  }

  get cropArea() {
    return this.page.locator('[data-testid="crop-area"]');
  }

  get cropConfirmButton() {
    return this.page.locator('[data-testid="crop-confirm"]');
  }

  /**
   * 프로필 페이지로 이동
   */
  async navigate() {
    await this.goto('/profile');
  }

  /**
   * 페이지 로드 확인
   */
  async verifyPageLoaded() {
    await expect(this.page).toHaveURL('/profile');
    await expect(this.page).toHaveTitle(/STUDYMATE/);
    await expect(this.profileHeader).toBeVisible();
  }

  /**
   * 프로필 정보 표시 확인
   */
  async verifyProfileInfo(expectedName: string, expectedLocation: string) {
    await expect(this.userName).toContainText(expectedName);
    await expect(this.userLocation).toContainText(expectedLocation);
    await expect(this.profileImage).toBeVisible();
  }

  /**
   * 편집 모드 진입
   */
  async enterEditMode() {
    await this.editButton.click();
    
    // 편집 가능한 필드들이 나타나는지 확인
    await expect(this.englishNameInput).toBeVisible();
    await expect(this.residenceInput).toBeVisible();
    await expect(this.introTextarea).toBeVisible();
    await expect(this.saveButton).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
  }

  /**
   * 기본 정보 편집
   */
  async updateBasicInfo(englishName: string, residence: string, intro: string) {
    await this.enterEditMode();
    
    // 필드 값 변경
    await this.englishNameInput.fill(englishName);
    await this.residenceInput.fill(residence);
    await this.introTextarea.fill(intro);
    
    // 저장
    await this.saveButton.click();
    
    // 성공 메시지 확인
    await this.helpers.expectSuccessMessage('프로필이 업데이트되었습니다');
    
    // 편집 모드 종료 확인
    await expect(this.englishNameInput).not.toBeVisible();
  }

  /**
   * 언어 레벨 변경
   */
  async updateLanguageLevel(level: string) {
    await this.enterEditMode();
    
    await this.languageLevelSelect.selectOption(level);
    await this.saveButton.click();
    
    await this.helpers.expectSuccessMessage('프로필이 업데이트되었습니다');
  }

  /**
   * 관심사 추가
   */
  async addInterest(interest: string) {
    await this.enterEditMode();
    
    // 관심사 체크박스 선택
    const interestCheckbox = this.page.locator(`[data-testid="interest-${interest}"]`);
    if (await interestCheckbox.isVisible()) {
      await interestCheckbox.check();
    }
    
    await this.saveButton.click();
    
    // 관심사 태그가 추가되었는지 확인
    const interestTag = this.page.locator(`[data-testid="interest-tag-${interest}"]`);
    await expect(interestTag).toBeVisible();
  }

  /**
   * 관심사 제거
   */
  async removeInterest(interest: string) {
    await this.enterEditMode();
    
    const interestCheckbox = this.page.locator(`[data-testid="interest-${interest}"]`);
    if (await interestCheckbox.isVisible()) {
      await interestCheckbox.uncheck();
    }
    
    await this.saveButton.click();
    
    // 관심사 태그가 제거되었는지 확인
    const interestTag = this.page.locator(`[data-testid="interest-tag-${interest}"]`);
    await expect(interestTag).not.toBeVisible();
  }

  /**
   * 프로필 이미지 업로드
   */
  async uploadProfileImage(imagePath: string) {
    await this.uploadImageButton.click();
    await expect(this.imageUploadModal).toBeVisible();
    
    // 파일 선택
    await this.uploadFile('[data-testid="image-file-input"]', [imagePath]);
    
    // 크롭 영역 확인
    await expect(this.cropArea).toBeVisible();
    
    // 크롭 확인
    await this.cropConfirmButton.click();
    
    // 모달이 닫히고 이미지가 업데이트되었는지 확인
    await expect(this.imageUploadModal).not.toBeVisible();
    
    // 성공 메시지
    await this.helpers.expectSuccessMessage('프로필 이미지가 업데이트되었습니다');
  }

  /**
   * 학습 목표 설정
   */
  async updateLearningGoals(dailyMinutes: number, weeklyMinutes: number) {
    await this.enterEditMode();
    
    await this.dailyGoalInput.fill(dailyMinutes.toString());
    await this.weeklyGoalInput.fill(weeklyMinutes.toString());
    
    await this.saveButton.click();
    
    await this.helpers.expectSuccessMessage('학습 목표가 업데이트되었습니다');
  }

  /**
   * 알림 설정 변경
   */
  async updateNotificationSettings(emailEnabled: boolean, pushEnabled: boolean) {
    await this.enterEditMode();
    
    // 이메일 알림 토글
    const emailToggleState = await this.emailNotificationToggle.isChecked();
    if (emailToggleState !== emailEnabled) {
      await this.emailNotificationToggle.click();
    }
    
    // 푸시 알림 토글
    const pushToggleState = await this.pushNotificationToggle.isChecked();
    if (pushToggleState !== pushEnabled) {
      await this.pushNotificationToggle.click();
    }
    
    await this.saveButton.click();
    
    await this.helpers.expectSuccessMessage('알림 설정이 업데이트되었습니다');
  }

  /**
   * 프로필 공개 설정 변경
   */
  async updatePrivacySettings(profileVisible: boolean) {
    await this.enterEditMode();
    
    const visibilityToggleState = await this.profileVisibilityToggle.isChecked();
    if (visibilityToggleState !== profileVisible) {
      await this.profileVisibilityToggle.click();
    }
    
    await this.saveButton.click();
    
    await this.helpers.expectSuccessMessage('프라이버시 설정이 업데이트되었습니다');
  }

  /**
   * 편집 취소
   */
  async cancelEdit() {
    await this.enterEditMode();
    
    // 내용 변경
    await this.englishNameInput.fill('Changed Name');
    
    // 취소 버튼 클릭
    await this.cancelButton.click();
    
    // 편집 모드가 종료되고 변경 사항이 취소되었는지 확인
    await expect(this.englishNameInput).not.toBeVisible();
  }

  /**
   * 학습 통계 확인
   */
  async verifyLearningStats() {
    await expect(this.statsSection).toBeVisible();
    await expect(this.learningStreak).toBeVisible();
    await expect(this.totalStudyTime).toBeVisible();
    await expect(this.completedSessions).toBeVisible();
    await expect(this.currentPartners).toBeVisible();
    
    // 통계 값들이 숫자인지 확인
    const streakText = await this.learningStreak.textContent();
    const studyTimeText = await this.totalStudyTime.textContent();
    const sessionsText = await this.completedSessions.textContent();
    const partnersText = await this.currentPartners.textContent();
    
    expect(streakText).toMatch(/\d+/);
    expect(studyTimeText).toMatch(/\d+/);
    expect(sessionsText).toMatch(/\d+/);
    expect(partnersText).toMatch(/\d+/);
  }

  /**
   * 계정 삭제 프로세스
   */
  async deleteAccount() {
    await this.deleteAccountButton.click();
    
    // 확인 다이얼로그
    const confirmDialog = this.page.locator('[data-testid="delete-account-dialog"]');
    await expect(confirmDialog).toBeVisible();
    
    // 비밀번호 입력 (계정 삭제 확인)
    const passwordInput = confirmDialog.locator('[data-testid="password-confirm"]');
    await passwordInput.fill('test-password');
    
    // 최종 확인
    const confirmDeleteButton = confirmDialog.locator('[data-testid="confirm-delete"]');
    await confirmDeleteButton.click();
    
    // 로그인 페이지로 리다이렉트
    await this.page.waitForURL('/');
  }

  /**
   * 로그아웃
   */
  async logout() {
    await this.logoutButton.click();
    
    // 확인 다이얼로그가 있는 경우
    const confirmDialog = this.page.locator('[data-testid="logout-confirm-dialog"]');
    if (await confirmDialog.isVisible()) {
      const confirmButton = confirmDialog.locator('[data-testid="confirm-logout"]');
      await confirmButton.click();
    }
    
    // 로그인 페이지로 이동
    await this.page.waitForURL('/');
    
    // 토큰이 제거되었는지 확인
    const accessToken = await this.getLocalStorage('accessToken');
    expect(accessToken).toBeFalsy();
  }

  /**
   * 모바일 반응형 확인
   */
  async verifyMobileResponsive() {
    await this.helpers.setMobileViewport();
    
    // 모바일에서 프로필 요소들이 적절히 표시되는지 확인
    await expect(this.profileImage).toBeVisible();
    await expect(this.userName).toBeVisible();
    await expect(this.basicInfoSection).toBeVisible();
    await expect(this.languageInfoSection).toBeVisible();
    
    // 편집 버튼 크기 확인 (터치 친화적)
    const editButtonBox = await this.editButton.boundingBox();
    if (editButtonBox) {
      expect(editButtonBox.height).toBeGreaterThan(44);
    }
  }

  /**
   * 접근성 확인
   */
  async verifyAccessibility() {
    // 편집 버튼에 포커스
    await this.editButton.focus();
    await expect(this.editButton).toBeFocused();
    
    // Tab으로 다음 요소로 이동
    await this.page.keyboard.press('Tab');
    
    // 키보드로 편집 모드 진입
    await this.editButton.press('Enter');
    
    // 입력 필드에 포커스가 이동하는지 확인
    await expect(this.englishNameInput).toBeFocused();
  }

  /**
   * 데이터 유효성 검사
   */
  async verifyFieldValidation() {
    await this.enterEditMode();
    
    // 빈 이름으로 저장 시도
    await this.englishNameInput.fill('');
    await this.saveButton.click();
    
    // 유효성 검사 에러 메시지 확인
    const errorMessage = this.page.locator('[data-testid="validation-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('이름을 입력해주세요');
    
    // 올바른 값으로 수정
    await this.englishNameInput.fill('Valid Name');
    
    // 에러 메시지가 사라지는지 확인
    await expect(errorMessage).not.toBeVisible();
  }

  /**
   * 프로필 완성도 확인
   */
  async verifyProfileCompleteness() {
    const completenessIndicator = this.page.locator('[data-testid="profile-completeness"]');
    
    if (await completenessIndicator.isVisible()) {
      const completenessText = await completenessIndicator.textContent();
      const percentage = parseInt(completenessText?.match(/\d+/)?.[0] || '0');
      
      expect(percentage).toBeGreaterThanOrEqual(0);
      expect(percentage).toBeLessThanOrEqual(100);
    }
  }

  /**
   * 성능 측정
   */
  async measurePagePerformance() {
    const metrics = await this.helpers.measurePerformance();
    
    // 프로필 페이지 성능 기준
    expect(metrics.firstContentfulPaint).toBeLessThan(2000); // 2초 이내
    expect(metrics.domContentLoaded).toBeLessThan(2500);     // 2.5초 이내
    
    return metrics;
  }

  /**
   * 오류 처리 확인
   */
  async verifyErrorHandling() {
    // API 오류 모킹
    await this.page.route('**/api/v1/users/profile**', route => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: { message: '서버 오류가 발생했습니다.' }
          })
        });
      } else {
        route.continue();
      }
    });
    
    await this.enterEditMode();
    await this.englishNameInput.fill('Test Name');
    await this.saveButton.click();
    
    // 오류 메시지 확인
    await this.helpers.expectErrorMessage('서버 오류가 발생했습니다.');
  }

  /**
   * 언어 변경 기능
   */
  async changeLanguagePreference(language: string) {
    await this.enterEditMode();
    
    const languageSelect = this.page.locator('[data-testid="language-preference-select"]');
    if (await languageSelect.isVisible()) {
      await languageSelect.selectOption(language);
      await this.saveButton.click();
      
      // 페이지 언어가 변경되었는지 확인
      await this.page.waitForTimeout(1000);
      
      if (language === 'en') {
        // 영어로 변경된 경우 확인
        const nameLabel = this.page.locator('[data-testid="name-label"]');
        const nameText = await nameLabel.textContent();
        expect(nameText).toMatch(/name|Name/i);
      }
    }
  }

  /**
   * 비밀번호 변경
   */
  async changePassword(currentPassword: string, newPassword: string) {
    await this.changePasswordButton.click();
    
    // 비밀번호 변경 모달
    const passwordModal = this.page.locator('[data-testid="password-change-modal"]');
    await expect(passwordModal).toBeVisible();
    
    // 현재 비밀번호 입력
    const currentPasswordInput = passwordModal.locator('[data-testid="current-password"]');
    await currentPasswordInput.fill(currentPassword);
    
    // 새 비밀번호 입력
    const newPasswordInput = passwordModal.locator('[data-testid="new-password"]');
    await newPasswordInput.fill(newPassword);
    
    // 비밀번호 확인 입력
    const confirmPasswordInput = passwordModal.locator('[data-testid="confirm-password"]');
    await confirmPasswordInput.fill(newPassword);
    
    // 변경 버튼 클릭
    const changeButton = passwordModal.locator('[data-testid="change-password-submit"]');
    await changeButton.click();
    
    // 성공 메시지
    await this.helpers.expectSuccessMessage('비밀번호가 변경되었습니다');
  }
}