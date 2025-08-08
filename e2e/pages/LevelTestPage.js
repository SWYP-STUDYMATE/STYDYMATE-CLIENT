export class LevelTestPage {
  constructor(page) {
    this.page = page;
    
    // 시작 페이지
    this.startTitle = page.locator('h1:has-text("스피킹 레벨테스트")');
    this.startButton = page.locator('button:has-text("레벨테스트 시작하기")');
    
    // 연결 확인 페이지
    this.connectionTitle = page.locator('h1:has-text("연결 확인")');
    this.micPermissionStatus = page.locator('[data-testid="mic-permission-status"]');
    this.internetStatus = page.locator('[data-testid="internet-status"]');
    this.nextButton = page.locator('button:has-text("다음")');
    
    // 녹음 페이지
    this.recordingTitle = page.locator('h1:has-text("질문")');
    this.questionText = page.locator('[data-testid="question-text"]');
    this.timerDisplay = page.locator('[data-testid="timer-display"]');
    this.recordButton = page.locator('[data-testid="record-button"]');
    this.stopButton = page.locator('[data-testid="stop-button"]');
    this.nextQuestionButton = page.locator('button:has-text("다음 질문")');
    this.completeButton = page.locator('button:has-text("테스트 완료")');
    
    // 완료 페이지
    this.completeTitle = page.locator('h1:has-text("레벨테스트 완료")');
    this.viewResultButton = page.locator('button:has-text("결과 확인하기")');
    
    // 결과 페이지
    this.resultTitle = page.locator('h1:has-text("레벨테스트 결과")');
    this.levelBadge = page.locator('[data-testid="level-badge"]');
    this.radarChart = page.locator('[data-testid="radar-chart"]');
    this.goToMainButton = page.locator('button:has-text("메인으로 가기")');
  }

  async startTest() {
    await this.page.goto('/level-test');
    await this.page.waitForLoadState('networkidle');
    await this.startButton.click();
  }

  async grantMicrophonePermission() {
    // 브라우저 권한 허용
    await this.page.context().grantPermissions(['microphone']);
  }

  async waitForConnectionCheck() {
    await this.page.waitForURL('**/level-test/check');
    
    // 권한 부여
    await this.grantMicrophonePermission();
    
    // 연결 상태 확인 대기
    await this.page.waitForFunction(() => {
      const micStatus = document.querySelector('[data-testid="mic-permission-status"]');
      const internetStatus = document.querySelector('[data-testid="internet-status"]');
      return micStatus?.textContent?.includes('정상') && 
             internetStatus?.textContent?.includes('정상');
    }, { timeout: 10000 });
  }

  async proceedToRecording() {
    await this.nextButton.click();
    await this.page.waitForURL('**/level-test/recording');
  }

  async getCurrentQuestion() {
    return await this.questionText.textContent();
  }

  async startRecording() {
    await this.recordButton.click();
  }

  async stopRecording() {
    await this.stopButton.click();
  }

  async mockRecording(duration = 3000) {
    // 녹음 시뮬레이션
    await this.startRecording();
    await this.page.waitForTimeout(duration);
    await this.stopRecording();
  }

  async proceedToNextQuestion() {
    await this.nextQuestionButton.click();
    await this.page.waitForTimeout(1000); // 질문 로딩 대기
  }

  async completeTest() {
    await this.completeButton.click();
    await this.page.waitForURL('**/level-test/complete');
  }

  async viewResults() {
    await this.viewResultButton.click();
    await this.page.waitForURL('**/level-test/result');
  }

  async getTestResult() {
    const level = await this.levelBadge.textContent();
    const scores = {};
    
    // 점수 데이터 추출
    const scoreElements = await this.page.locator('[data-testid^="score-"]').all();
    for (const elem of scoreElements) {
      const category = await elem.getAttribute('data-testid');
      const value = await elem.textContent();
      scores[category.replace('score-', '')] = value;
    }
    
    return { level, scores };
  }

  async completeFullTest() {
    // 전체 테스트 플로우 실행
    await this.startTest();
    await this.waitForConnectionCheck();
    await this.proceedToRecording();
    
    // 4개 질문 모두 완료
    for (let i = 0; i < 4; i++) {
      await this.mockRecording();
      
      if (i < 3) {
        await this.proceedToNextQuestion();
      } else {
        await this.completeTest();
      }
    }
    
    await this.viewResults();
  }
}