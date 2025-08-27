import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { selectors, onboardingData } from '../fixtures/test-data';

export class OnboardingPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // 공통 요소들
  get stepIndicator() {
    return this.page.locator(selectors.onboarding.stepIndicator);
  }

  get nextButton() {
    return this.page.locator(selectors.buttons.next);
  }

  get previousButton() {
    return this.page.locator(selectors.buttons.previous);
  }

  get completeButton() {
    return this.page.locator(selectors.buttons.complete);
  }

  // 1단계: 언어 설정 요소들
  get languageSelect() {
    return this.page.locator(selectors.onboarding.languageSelect);
  }

  get levelSelect() {
    return this.page.locator(selectors.onboarding.levelSelect);
  }

  get nativeLanguageInput() {
    return this.page.locator('[data-testid="native-language-input"]');
  }

  // 2단계: 관심사 설정 요소들
  get topicCheckboxes() {
    return this.page.locator(selectors.onboarding.topicCheckbox);
  }

  get motivationCheckboxes() {
    return this.page.locator(selectors.onboarding.motivationCheckbox);
  }

  get learningStyleCheckboxes() {
    return this.page.locator('[data-testid="learning-style-checkbox"]');
  }

  get communicationMethodCheckboxes() {
    return this.page.locator('[data-testid="communication-method-checkbox"]');
  }

  // 3단계: 파트너 선호도 요소들
  get genderRadios() {
    return this.page.locator(selectors.onboarding.genderRadio);
  }

  get personalityCheckboxes() {
    return this.page.locator(selectors.onboarding.personalityCheckbox);
  }

  get groupSizeSelect() {
    return this.page.locator('[data-testid="group-size-select"]');
  }

  // 4단계: 스케줄 설정 요소들
  get scheduleInputs() {
    return this.page.locator(selectors.onboarding.scheduleInput);
  }

  get dailyMinutesInput() {
    return this.page.locator('[data-testid="daily-minutes-input"]');
  }

  get learningExceptionCheckboxes() {
    return this.page.locator('[data-testid="learning-exception-checkbox"]');
  }

  /**
   * 특정 온보딩 단계로 이동
   */
  async navigateToStep(step: number) {
    await this.goto(`/onboarding-info/${step}`);
  }

  /**
   * 현재 단계 확인
   */
  async verifyCurrentStep(expectedStep: number) {
    await expect(this.page).toHaveURL(`/onboarding-info/${step}`);
    await expect(this.stepIndicator).toContainText(`${expectedStep}/4`);
  }

  /**
   * 1단계: 언어 설정 완료
   */
  async completeStep1() {
    await this.navigateToStep(1);
    
    // API 응답 모킹
    await this.page.route('**/api/v1/onboarding/step/1**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Step 1 completed successfully'
        })
      });
    });

    // 학습 언어 선택
    await this.languageSelect.selectOption('1'); // 영어
    
    // 언어 수준 선택
    await this.levelSelect.selectOption('INTERMEDIATE');
    
    // 모국어 입력
    await this.nativeLanguageInput.fill('Korean');
    
    // 다음 버튼 클릭
    await this.nextButton.click();
    
    // 2단계로 이동 확인
    await this.page.waitForURL('/onboarding-info/2');
  }

  /**
   * 2단계: 관심사 설정 완료
   */
  async completeStep2() {
    await this.page.route('**/api/v1/onboarding/step/2**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Step 2 completed successfully'
        })
      });
    });

    // 관심 주제 선택 (처음 3개)
    const topicBoxes = await this.topicCheckboxes.all();
    for (let i = 0; i < 3 && i < topicBoxes.length; i++) {
      await topicBoxes[i].check();
    }

    // 학습 동기 선택 (처음 2개)
    const motivationBoxes = await this.motivationCheckboxes.all();
    for (let i = 0; i < 2 && i < motivationBoxes.length; i++) {
      await motivationBoxes[i].check();
    }

    // 학습 스타일 선택
    const styleBoxes = await this.learningStyleCheckboxes.all();
    for (let i = 0; i < 2 && i < styleBoxes.length; i++) {
      await styleBoxes[i].check();
    }

    // 소통 방식 선택
    await this.communicationMethodCheckboxes.first().check(); // TEXT
    await this.communicationMethodCheckboxes.nth(1).check(); // VOICE

    await this.nextButton.click();
    await this.page.waitForURL('/onboarding-info/3');
  }

  /**
   * 3단계: 파트너 선호도 설정 완료
   */
  async completeStep3() {
    await this.page.route('**/api/v1/onboarding/step/3**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Step 3 completed successfully'
        })
      });
    });

    // 선호 성별 선택
    await this.genderRadios.first().check(); // ANY

    // 선호 성격 선택 (처음 3개)
    const personalityBoxes = await this.personalityCheckboxes.all();
    for (let i = 0; i < 3 && i < personalityBoxes.length; i++) {
      await personalityBoxes[i].check();
    }

    // 그룹 크기 선택
    await this.groupSizeSelect.selectOption('ONE_ON_ONE');

    await this.nextButton.click();
    await this.page.waitForURL('/onboarding-info/4');
  }

  /**
   * 4단계: 스케줄 설정 완료
   */
  async completeStep4() {
    await this.page.route('**/api/v1/onboarding/step/4**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Step 4 completed successfully'
        })
      });
    });

    await this.page.route('**/api/v1/onboarding/complete**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            completedAt: new Date().toISOString(),
            redirectUrl: '/main'
          }
        })
      });
    });

    // 요일별 스케줄 설정
    const schedules = await this.scheduleInputs.all();
    if (schedules.length >= 2) {
      // 월요일 19:00-21:00
      await schedules[0].fill('19:00-21:00');
      // 수요일 20:00-22:00  
      await schedules[2].fill('20:00-22:00');
    }

    // 일일 학습 시간 설정
    await this.dailyMinutesInput.fill('60');

    // 학습 예외 상황 선택
    const exceptionBoxes = await this.learningExceptionCheckboxes.all();
    if (exceptionBoxes.length >= 2) {
      await exceptionBoxes[0].check(); // BUSINESS_TRIP
      await exceptionBoxes[1].check(); // EXAM_PERIOD
    }

    // 완료 버튼 클릭
    await this.completeButton.click();
    
    // 메인 페이지로 리다이렉트 확인
    await this.page.waitForURL('/main');
  }

  /**
   * 전체 온보딩 플로우 완료
   */
  async completeFullOnboarding() {
    await this.completeStep1();
    await this.completeStep2();
    await this.completeStep3();
    await this.completeStep4();
  }

  /**
   * 이전 단계로 돌아가기
   */
  async goToPreviousStep() {
    await this.previousButton.click();
  }

  /**
   * 진행률 표시 확인
   */
  async verifyProgressIndicator(currentStep: number) {
    const progressText = await this.stepIndicator.textContent();
    expect(progressText).toContain(`${currentStep}/4`);
    
    // 진행률 바 확인
    const progressBar = this.page.locator('[data-testid="progress-bar"]');
    const progressPercentage = (currentStep / 4) * 100;
    await expect(progressBar).toHaveAttribute('value', progressPercentage.toString());
  }

  /**
   * 필수 입력 필드 검증
   */
  async verifyRequiredFieldsValidation(step: number) {
    await this.navigateToStep(step);
    
    // 아무것도 선택하지 않고 다음 버튼 클릭
    await this.nextButton.click();
    
    // 에러 메시지 확인
    const errorMessage = this.page.locator('[data-testid="validation-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('필수 항목을 선택해주세요');
    
    // 페이지가 이동하지 않았는지 확인
    await expect(this.page).toHaveURL(`/onboarding-info/${step}`);
  }

  /**
   * 모바일 반응형 확인
   */
  async verifyMobileResponsive() {
    await this.helpers.setMobileViewport();
    await this.navigateToStep(1);
    
    // 모바일에서도 모든 요소가 적절히 표시되는지 확인
    await expect(this.languageSelect).toBeVisible();
    await expect(this.levelSelect).toBeVisible();
    await expect(this.nextButton).toBeVisible();
    
    // 터치 친화적인 크기 확인
    const buttonBox = await this.nextButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThan(44);
  }

  /**
   * 단계별 데이터 저장 확인
   */
  async verifyDataPersistence() {
    // 1단계 완료
    await this.completeStep1();
    
    // 브라우저 새로고침
    await this.page.reload();
    
    // 2단계로 자동 이동하는지 확인
    await expect(this.page).toHaveURL('/onboarding-info/2');
    
    // 이전 단계로 돌아가서 데이터가 유지되는지 확인
    await this.goToPreviousStep();
    await expect(this.page).toHaveURL('/onboarding-info/1');
    
    // 선택된 값들이 유지되는지 확인
    await expect(this.languageSelect).toHaveValue('1');
    await expect(this.levelSelect).toHaveValue('INTERMEDIATE');
    await expect(this.nativeLanguageInput).toHaveValue('Korean');
  }

  /**
   * 키보드 네비게이션 확인
   */
  async verifyKeyboardNavigation() {
    await this.navigateToStep(1);
    
    // Tab으로 요소 간 이동
    await this.page.keyboard.press('Tab');
    await expect(this.languageSelect).toBeFocused();
    
    await this.page.keyboard.press('Tab');
    await expect(this.levelSelect).toBeFocused();
    
    await this.page.keyboard.press('Tab');
    await expect(this.nativeLanguageInput).toBeFocused();
    
    // Enter로 다음 버튼 활성화 (모든 필드가 완료된 경우)
    await this.languageSelect.selectOption('1');
    await this.levelSelect.selectOption('INTERMEDIATE');
    await this.nativeLanguageInput.fill('Korean');
    
    await this.nextButton.focus();
    await this.page.keyboard.press('Enter');
  }

  /**
   * 온보딩 진행 상태 API 확인
   */
  async verifyOnboardingStatus(expectedStep: number, expectedCompletedSteps: number[]) {
    const statusResponse = await this.helpers.waitForApiCall('/api/v1/onboarding/status');
    const responseData = await statusResponse.json();
    
    expect(responseData.success).toBe(true);
    expect(responseData.data.currentStep).toBe(expectedStep);
    expect(responseData.data.completedSteps).toEqual(expectedCompletedSteps);
  }

  /**
   * 단계 건너뛰기 방지 확인
   */
  async verifyStepSkippingPrevention() {
    // 1단계 완료하지 않고 2단계로 직접 이동 시도
    await this.goto('/onboarding-info/2');
    
    // 1단계로 리다이렉트되는지 확인
    await this.page.waitForURL('/onboarding-info/1');
  }

  /**
   * 온보딩 완료 후 재접근 방지 확인
   */
  async verifyCompletedOnboardingRedirect() {
    // 온보딩 완료 상태로 설정
    await this.helpers.mockOnboardingComplete();
    
    // 온보딩 페이지 접근 시도
    await this.navigateToStep(1);
    
    // 메인 페이지로 리다이렉트되는지 확인
    await this.page.waitForURL('/main');
  }

  /**
   * 네트워크 에러 시 재시도 기능 확인
   */
  async verifyNetworkErrorRetry() {
    await this.navigateToStep(1);
    
    let requestCount = 0;
    await this.page.route('**/api/v1/onboarding/step/1**', route => {
      requestCount++;
      
      if (requestCount === 1) {
        // 첫 번째 요청은 실패
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: { message: '서버 오류가 발생했습니다.' }
          })
        });
      } else {
        // 두 번째 요청은 성공
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Step 1 completed successfully'
          })
        });
      }
    });

    // 1단계 입력 완료
    await this.languageSelect.selectOption('1');
    await this.levelSelect.selectOption('INTERMEDIATE');
    await this.nativeLanguageInput.fill('Korean');
    await this.nextButton.click();

    // 에러 메시지 표시 확인
    const errorMessage = this.page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    
    // 재시도 버튼 클릭
    const retryButton = this.page.locator('[data-testid="retry-button"]');
    await retryButton.click();
    
    // 성공적으로 다음 단계로 이동하는지 확인
    await this.page.waitForURL('/onboarding-info/2');
  }

  /**
   * 온보딩 데이터 유효성 검사
   */
  async verifyDataValidation() {
    await this.navigateToStep(4);
    
    // 잘못된 시간 형식 입력
    await this.scheduleInputs.first().fill('invalid-time');
    await this.nextButton.click();
    
    // 유효성 검사 에러 메시지 확인
    const validationError = this.page.locator('[data-testid="time-validation-error"]');
    await expect(validationError).toBeVisible();
    await expect(validationError).toContainText('올바른 시간 형식을 입력해주세요');
    
    // 올바른 형식으로 수정
    await this.scheduleInputs.first().fill('19:00-21:00');
    await expect(validationError).not.toBeVisible();
  }
}