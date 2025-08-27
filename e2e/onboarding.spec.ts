import { test, expect } from '@playwright/test';
import { OnboardingPage } from './pages/onboarding-page';

test.describe('온보딩 플로우', () => {
  let onboardingPage: OnboardingPage;

  test.beforeEach(async ({ page }) => {
    onboardingPage = new OnboardingPage(page);
    
    // 로그인된 상태로 설정
    await onboardingPage.setLocalStorage('accessToken', 'mock-access-token');
    await onboardingPage.setLocalStorage('refreshToken', 'mock-refresh-token');
  });

  test('1단계: 언어 설정 페이지 로드 확인', async () => {
    await onboardingPage.navigateToStep(1);
    await onboardingPage.verifyCurrentStep(1);
    
    // 페이지 요소들이 표시되는지 확인
    await expect(onboardingPage.languageSelect).toBeVisible();
    await expect(onboardingPage.levelSelect).toBeVisible();
    await expect(onboardingPage.nativeLanguageInput).toBeVisible();
    await expect(onboardingPage.nextButton).toBeVisible();
  });

  test('2단계: 관심사 설정 페이지 로드 확인', async () => {
    await onboardingPage.completeStep1();
    
    // 2단계 페이지 요소들 확인
    await expect(onboardingPage.topicCheckboxes.first()).toBeVisible();
    await expect(onboardingPage.motivationCheckboxes.first()).toBeVisible();
    await expect(onboardingPage.learningStyleCheckboxes.first()).toBeVisible();
    await expect(onboardingPage.communicationMethodCheckboxes.first()).toBeVisible();
  });

  test('3단계: 파트너 선호도 설정 페이지 로드 확인', async () => {
    await onboardingPage.completeStep1();
    await onboardingPage.completeStep2();
    
    // 3단계 페이지 요소들 확인
    await expect(onboardingPage.genderRadios.first()).toBeVisible();
    await expect(onboardingPage.personalityCheckboxes.first()).toBeVisible();
    await expect(onboardingPage.groupSizeSelect).toBeVisible();
  });

  test('4단계: 스케줄 설정 페이지 로드 확인', async () => {
    await onboardingPage.completeStep1();
    await onboardingPage.completeStep2();
    await onboardingPage.completeStep3();
    
    // 4단계 페이지 요소들 확인
    await expect(onboardingPage.scheduleInputs.first()).toBeVisible();
    await expect(onboardingPage.dailyMinutesInput).toBeVisible();
    await expect(onboardingPage.learningExceptionCheckboxes.first()).toBeVisible();
    await expect(onboardingPage.completeButton).toBeVisible();
  });

  test('전체 온보딩 플로우 완료', async () => {
    await onboardingPage.completeFullOnboarding();
    
    // 메인 페이지로 이동했는지 확인
    await expect(onboardingPage.page).toHaveURL('/main');
  });

  test('1단계 필수 입력 필드 검증', async () => {
    await onboardingPage.verifyRequiredFieldsValidation(1);
  });

  test('2단계 필수 입력 필드 검증', async () => {
    await onboardingPage.verifyRequiredFieldsValidation(2);
  });

  test('3단계 필수 입력 필드 검증', async () => {
    await onboardingPage.verifyRequiredFieldsValidation(3);
  });

  test('4단계 필수 입력 필드 검증', async () => {
    await onboardingPage.verifyRequiredFieldsValidation(4);
  });

  test('진행률 표시 확인', async () => {
    await onboardingPage.navigateToStep(1);
    await onboardingPage.verifyProgressIndicator(1);
    
    await onboardingPage.completeStep1();
    await onboardingPage.verifyProgressIndicator(2);
    
    await onboardingPage.completeStep2();
    await onboardingPage.verifyProgressIndicator(3);
    
    await onboardingPage.completeStep3();
    await onboardingPage.verifyProgressIndicator(4);
  });

  test('이전 단계로 돌아가기 기능', async () => {
    await onboardingPage.completeStep1();
    await onboardingPage.completeStep2();
    
    // 3단계에서 2단계로 돌아가기
    await onboardingPage.goToPreviousStep();
    await expect(onboardingPage.page).toHaveURL('/onboarding-info/2');
    
    // 2단계에서 1단계로 돌아가기
    await onboardingPage.goToPreviousStep();
    await expect(onboardingPage.page).toHaveURL('/onboarding-info/1');
  });

  test('단계 건너뛰기 방지', async () => {
    await onboardingPage.verifyStepSkippingPrevention();
  });

  test('온보딩 완료 후 재접근 방지', async () => {
    await onboardingPage.verifyCompletedOnboardingRedirect();
  });

  test('데이터 저장 및 복원', async () => {
    await onboardingPage.verifyDataPersistence();
  });

  test('모바일 반응형 디자인', async () => {
    await onboardingPage.verifyMobileResponsive();
  });

  test('키보드 네비게이션', async () => {
    await onboardingPage.verifyKeyboardNavigation();
  });

  test('온보딩 진행 상태 API 확인', async () => {
    await onboardingPage.navigateToStep(1);
    await onboardingPage.verifyOnboardingStatus(1, []);
    
    await onboardingPage.completeStep1();
    await onboardingPage.verifyOnboardingStatus(2, [1]);
    
    await onboardingPage.completeStep2();
    await onboardingPage.verifyOnboardingStatus(3, [1, 2]);
  });

  test('네트워크 에러 시 재시도 기능', async () => {
    await onboardingPage.verifyNetworkErrorRetry();
  });

  test('데이터 유효성 검사', async () => {
    await onboardingPage.verifyDataValidation();
  });

  test('1단계 개별 완료', async () => {
    await onboardingPage.completeStep1();
    await expect(onboardingPage.page).toHaveURL('/onboarding-info/2');
  });

  test('2단계 개별 완료', async () => {
    await onboardingPage.completeStep1();
    await onboardingPage.completeStep2();
    await expect(onboardingPage.page).toHaveURL('/onboarding-info/3');
  });

  test('3단계 개별 완료', async () => {
    await onboardingPage.completeStep1();
    await onboardingPage.completeStep2();
    await onboardingPage.completeStep3();
    await expect(onboardingPage.page).toHaveURL('/onboarding-info/4');
  });

  test('4단계 개별 완료', async () => {
    await onboardingPage.completeStep1();
    await onboardingPage.completeStep2();
    await onboardingPage.completeStep3();
    await onboardingPage.completeStep4();
    await expect(onboardingPage.page).toHaveURL('/main');
  });

  test('언어 선택 옵션 확인', async () => {
    await onboardingPage.navigateToStep(1);
    
    // 언어 드롭다운에 옵션이 있는지 확인
    const languageOptions = await onboardingPage.languageSelect.locator('option').count();
    expect(languageOptions).toBeGreaterThan(1);
    
    // 수준 드롭다운에 옵션이 있는지 확인  
    const levelOptions = await onboardingPage.levelSelect.locator('option').count();
    expect(levelOptions).toBeGreaterThan(1);
  });

  test('관심 주제 다중 선택', async () => {
    await onboardingPage.completeStep1();
    
    // 여러 주제 선택
    const topicBoxes = await onboardingPage.topicCheckboxes.all();
    for (let i = 0; i < Math.min(5, topicBoxes.length); i++) {
      await topicBoxes[i].check();
    }
    
    // 선택된 항목들이 체크되었는지 확인
    for (let i = 0; i < Math.min(5, topicBoxes.length); i++) {
      await expect(topicBoxes[i]).toBeChecked();
    }
  });

  test('성격 선호도 다중 선택', async () => {
    await onboardingPage.completeStep1();
    await onboardingPage.completeStep2();
    
    // 여러 성격 유형 선택
    const personalityBoxes = await onboardingPage.personalityCheckboxes.all();
    for (let i = 0; i < Math.min(3, personalityBoxes.length); i++) {
      await personalityBoxes[i].check();
    }
    
    // 선택된 항목들이 체크되었는지 확인
    for (let i = 0; i < Math.min(3, personalityBoxes.length); i++) {
      await expect(personalityBoxes[i]).toBeChecked();
    }
  });

  test('스케줄 입력 포맷 검증', async () => {
    await onboardingPage.completeStep1();
    await onboardingPage.completeStep2();
    await onboardingPage.completeStep3();
    
    // 올바른 시간 형식 입력
    const schedules = await onboardingPage.scheduleInputs.all();
    if (schedules.length > 0) {
      await schedules[0].fill('09:00-12:00');
      await schedules[0].blur();
      
      // 에러 메시지가 표시되지 않는지 확인
      const errorMessage = onboardingPage.page.locator('[data-testid="time-validation-error"]');
      await expect(errorMessage).not.toBeVisible();
    }
  });

  test('일일 학습 시간 입력', async () => {
    await onboardingPage.completeStep1();
    await onboardingPage.completeStep2();
    await onboardingPage.completeStep3();
    
    // 일일 학습 시간 입력
    await onboardingPage.dailyMinutesInput.fill('120');
    await expect(onboardingPage.dailyMinutesInput).toHaveValue('120');
    
    // 숫자가 아닌 값 입력 시 에러 처리
    await onboardingPage.dailyMinutesInput.fill('abc');
    // 브라우저의 기본 number input 검증이 동작하는지 확인
  });

  test('학습 예외 상황 선택', async () => {
    await onboardingPage.completeStep1();
    await onboardingPage.completeStep2();
    await onboardingPage.completeStep3();
    
    // 예외 상황 체크박스들 선택
    const exceptionBoxes = await onboardingPage.learningExceptionCheckboxes.all();
    for (let i = 0; i < Math.min(2, exceptionBoxes.length); i++) {
      await exceptionBoxes[i].check();
      await expect(exceptionBoxes[i]).toBeChecked();
    }
  });
});