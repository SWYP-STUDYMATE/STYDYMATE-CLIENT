import { test, expect } from './fixtures/auth.fixture';
import { LevelTestPage } from './pages/LevelTestPage';
import { MainPage } from './pages/MainPage';

test.describe('레벨 테스트 플로우', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // 메인 페이지로 이동
    const mainPage = new MainPage(authenticatedPage);
    await mainPage.goto();
  });

  test('레벨 테스트 시작 페이지 표시', async ({ authenticatedPage }) => {
    const mainPage = new MainPage(authenticatedPage);
    const levelTestPage = new LevelTestPage(authenticatedPage);
    
    // 레벨 테스트로 이동
    await mainPage.navigateToLevelTest();
    
    // 시작 페이지 확인
    await expect(levelTestPage.startTitle).toBeVisible();
    await expect(levelTestPage.startTitle).toContainText('스피킹 레벨테스트');
    await expect(levelTestPage.startButton).toBeVisible();
  });

  test('연결 확인 페이지에서 마이크 권한 확인', async ({ authenticatedPage }) => {
    const levelTestPage = new LevelTestPage(authenticatedPage);
    
    // 테스트 시작
    await levelTestPage.startTest();
    
    // 연결 확인 페이지 확인
    await expect(levelTestPage.connectionTitle).toBeVisible();
    
    // 마이크 권한 부여
    await levelTestPage.grantMicrophonePermission();
    
    // 연결 상태 확인 (Mock 환경에서는 자동 성공)
    await levelTestPage.waitForConnectionCheck();
    
    // 다음 버튼 활성화 확인
    await expect(levelTestPage.nextButton).toBeEnabled();
  });

  test('녹음 페이지에서 질문 표시 및 녹음 기능', async ({ authenticatedPage }) => {
    const levelTestPage = new LevelTestPage(authenticatedPage);
    
    // 녹음 페이지까지 이동
    await levelTestPage.startTest();
    await levelTestPage.waitForConnectionCheck();
    await levelTestPage.proceedToRecording();
    
    // 질문 표시 확인
    await expect(levelTestPage.questionText).toBeVisible();
    const question = await levelTestPage.getCurrentQuestion();
    expect(question).toBeTruthy();
    
    // 타이머 표시 확인
    await expect(levelTestPage.timerDisplay).toBeVisible();
    
    // 녹음 버튼 확인
    await expect(levelTestPage.recordButton).toBeVisible();
  });

  test('전체 레벨 테스트 플로우 완료', async ({ authenticatedPage }) => {
    const levelTestPage = new LevelTestPage(authenticatedPage);
    
    // 전체 테스트 실행
    await levelTestPage.completeFullTest();
    
    // 결과 페이지 확인
    await expect(levelTestPage.resultTitle).toBeVisible();
    await expect(levelTestPage.levelBadge).toBeVisible();
    await expect(levelTestPage.radarChart).toBeVisible();
    
    // 결과 데이터 확인
    const result = await levelTestPage.getTestResult();
    expect(result.level).toBeTruthy();
    
    // 메인으로 가기 버튼 확인
    await expect(levelTestPage.goToMainButton).toBeVisible();
  });

  test('레벨 테스트 중단 시 확인 다이얼로그', async ({ authenticatedPage }) => {
    const levelTestPage = new LevelTestPage(authenticatedPage);
    
    // 녹음 페이지까지 이동
    await levelTestPage.startTest();
    await levelTestPage.waitForConnectionCheck();
    await levelTestPage.proceedToRecording();
    
    // 페이지 이탈 시도
    authenticatedPage.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('테스트를 중단');
      await dialog.dismiss(); // 취소
    });
    
    // 브라우저 뒤로가기 시도
    await authenticatedPage.goBack();
    
    // 여전히 녹음 페이지에 있는지 확인
    await expect(levelTestPage.recordingTitle).toBeVisible();
  });

  test('타이머 동작 확인', async ({ authenticatedPage }) => {
    const levelTestPage = new LevelTestPage(authenticatedPage);
    
    // 녹음 페이지까지 이동
    await levelTestPage.startTest();
    await levelTestPage.waitForConnectionCheck();
    await levelTestPage.proceedToRecording();
    
    // 초기 타이머 값 확인
    const initialTime = await levelTestPage.timerDisplay.textContent();
    expect(initialTime).toContain('3:00');
    
    // 3초 대기
    await authenticatedPage.waitForTimeout(3000);
    
    // 타이머 감소 확인
    const currentTime = await levelTestPage.timerDisplay.textContent();
    expect(currentTime).not.toBe(initialTime);
  });
});

test.describe('레벨 테스트 에러 처리', () => {
  test('마이크 권한 거부 시 에러 메시지', async ({ authenticatedPage }) => {
    const levelTestPage = new LevelTestPage(authenticatedPage);
    
    // 마이크 권한 거부 설정
    await authenticatedPage.context().clearPermissions();
    
    // 테스트 시작
    await levelTestPage.startTest();
    
    // 에러 메시지 확인
    const errorMessage = authenticatedPage.locator('text=마이크 권한이 필요합니다');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test('인터넷 연결 끊김 시뮬레이션', async ({ authenticatedPage }) => {
    const levelTestPage = new LevelTestPage(authenticatedPage);
    
    // 테스트 시작
    await levelTestPage.startTest();
    await levelTestPage.waitForConnectionCheck();
    await levelTestPage.proceedToRecording();
    
    // 오프라인 모드 설정
    await authenticatedPage.context().setOffline(true);
    
    // 녹음 시도
    await levelTestPage.startRecording();
    
    // 에러 메시지 확인
    const errorMessage = authenticatedPage.locator('text=인터넷 연결을 확인해주세요');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
    
    // 온라인 모드로 복구
    await authenticatedPage.context().setOffline(false);
  });
});