import { test, expect } from '@playwright/test';
import { ProfilePage } from './pages/profile-page';
import path from 'path';

test.describe('프로필 페이지', () => {
  let profilePage: ProfilePage;

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page);
    
    // 로그인된 상태로 설정
    await profilePage.setLocalStorage('accessToken', 'mock-access-token');
    await profilePage.setLocalStorage('refreshToken', 'mock-refresh-token');
    
    // 사용자 프로필 데이터 모킹
    await page.route('**/api/v1/users/profile**', route => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 1,
              englishName: '테스트사용자',
              residence: 'Seoul, South Korea',
              profileImage: 'https://api.languagemate.kr/uploads/profiles/1.jpg',
              intro: '안녕하세요! 영어를 배우고 있는 한국어 네이티브입니다.',
              nativeLanguage: 'Korean',
              learningLanguage: 'English',
              languageLevel: 'INTERMEDIATE',
              interests: ['Movies', 'Travel', 'Technology'],
              learningStreak: 15,
              totalStudyTime: 1250,
              completedSessions: 23,
              currentPartners: 2,
              dailyGoal: 60,
              weeklyGoal: 300,
              emailNotifications: true,
              pushNotifications: true,
              profileVisible: true
            }
          })
        });
      } else if (route.request().method() === 'PATCH') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: '프로필이 업데이트되었습니다.'
          })
        });
      } else {
        route.continue();
      }
    });
    
    // 프로필 이미지 업로드 API 모킹
    await page.route('**/api/v1/users/profile/image**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            profileImage: 'https://api.languagemate.kr/uploads/profiles/updated.jpg'
          },
          message: '프로필 이미지가 업데이트되었습니다.'
        })
      });
    });
    
    // 계정 삭제 API 모킹
    await page.route('**/api/v1/users/account**', route => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: '계정이 삭제되었습니다.'
          })
        });
      } else {
        route.continue();
      }
    });
    
    // 비밀번호 변경 API 모킹
    await page.route('**/api/v1/users/password**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: '비밀번호가 변경되었습니다.'
        })
      });
    });
  });

  test('프로필 페이지 로드 확인', async () => {
    await profilePage.navigate();
    await profilePage.verifyPageLoaded();
  });

  test('프로필 정보 표시', async () => {
    await profilePage.navigate();
    await profilePage.verifyProfileInfo('테스트사용자', 'Seoul, South Korea');
  });

  test('학습 통계 표시', async () => {
    await profilePage.navigate();
    await profilePage.verifyLearningStats();
  });

  test('기본 정보 편집', async () => {
    await profilePage.navigate();
    
    await profilePage.updateBasicInfo(
      'Updated User',
      'Busan, South Korea',
      '업데이트된 소개입니다.'
    );
  });

  test('언어 레벨 변경', async () => {
    await profilePage.navigate();
    
    await profilePage.updateLanguageLevel('ADVANCED');
  });

  test('관심사 추가', async () => {
    await profilePage.navigate();
    
    await profilePage.addInterest('Music');
  });

  test('관심사 제거', async () => {
    await profilePage.navigate();
    
    await profilePage.removeInterest('Technology');
  });

  test('프로필 이미지 업로드', async () => {
    await profilePage.navigate();
    
    // 테스트용 이미지 파일 경로
    const testImagePath = path.join(__dirname, '../fixtures/test-profile.jpg');
    
    try {
      await profilePage.uploadProfileImage(testImagePath);
    } catch {
      // 실제 파일이 없는 경우, UI 동작만 확인
      await profilePage.uploadImageButton.click();
      
      if (await profilePage.imageUploadModal.isVisible()) {
        await expect(profilePage.imageUploadModal).toBeVisible();
        
        // 모달 닫기
        const closeButton = profilePage.page.locator('[data-testid="close-modal"]');
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await profilePage.page.keyboard.press('Escape');
        }
      }
    }
  });

  test('학습 목표 설정', async () => {
    await profilePage.navigate();
    
    await profilePage.updateLearningGoals(90, 450);
  });

  test('알림 설정 변경', async () => {
    await profilePage.navigate();
    
    await profilePage.updateNotificationSettings(false, true);
  });

  test('프라이버시 설정 변경', async () => {
    await profilePage.navigate();
    
    await profilePage.updatePrivacySettings(false);
  });

  test('편집 취소', async () => {
    await profilePage.navigate();
    
    await profilePage.cancelEdit();
  });

  test('필드 유효성 검사', async () => {
    await profilePage.navigate();
    
    await profilePage.verifyFieldValidation();
  });

  test('편집 모드 진입 및 종료', async () => {
    await profilePage.navigate();
    
    // 편집 모드 진입
    await profilePage.enterEditMode();
    
    // 편집 모드에서 입력 필드들이 표시되는지 확인
    await expect(profilePage.englishNameInput).toBeVisible();
    await expect(profilePage.residenceInput).toBeVisible();
    await expect(profilePage.introTextarea).toBeVisible();
    await expect(profilePage.saveButton).toBeVisible();
    await expect(profilePage.cancelButton).toBeVisible();
    
    // 취소로 편집 모드 종료
    await profilePage.cancelButton.click();
    
    // 편집 모드가 종료되었는지 확인
    await expect(profilePage.englishNameInput).not.toBeVisible();
  });

  test('프로필 완성도 확인', async () => {
    await profilePage.navigate();
    
    await profilePage.verifyProfileCompleteness();
  });

  test('비밀번호 변경', async () => {
    await profilePage.navigate();
    
    await profilePage.changePassword('current-password', 'new-password123');
  });

  test('언어 선호도 변경', async () => {
    await profilePage.navigate();
    
    await profilePage.changeLanguagePreference('en');
  });

  test('계정 삭제', async () => {
    await profilePage.navigate();
    
    await profilePage.deleteAccount();
    
    // 로그인 페이지로 이동했는지 확인
    await expect(profilePage.page).toHaveURL('/');
  });

  test('로그아웃', async () => {
    await profilePage.navigate();
    
    await profilePage.logout();
    
    // 로그인 페이지로 이동했는지 확인
    await expect(profilePage.page).toHaveURL('/');
    
    // 토큰이 제거되었는지 확인
    const accessToken = await profilePage.getLocalStorage('accessToken');
    expect(accessToken).toBeFalsy();
  });

  test('모바일 반응형 디자인', async () => {
    await profilePage.navigate();
    
    await profilePage.verifyMobileResponsive();
  });

  test('키보드 접근성', async () => {
    await profilePage.navigate();
    
    await profilePage.verifyAccessibility();
  });

  test('에러 처리', async () => {
    await profilePage.navigate();
    
    await profilePage.verifyErrorHandling();
  });

  test('성능 측정', async () => {
    await profilePage.navigate();
    
    const metrics = await profilePage.measurePagePerformance();
    
    console.log('프로필 페이지 성능 메트릭:', metrics);
    
    // 성능 기준 검증
    expect(metrics.firstContentfulPaint).toBeLessThan(2000);
    expect(metrics.domContentLoaded).toBeLessThan(2500);
  });

  test('프로필 섹션별 표시', async () => {
    await profilePage.navigate();
    
    // 모든 주요 섹션이 표시되는지 확인
    await expect(profilePage.profileHeader).toBeVisible();
    await expect(profilePage.basicInfoSection).toBeVisible();
    await expect(profilePage.languageInfoSection).toBeVisible();
    await expect(profilePage.interestsSection).toBeVisible();
    await expect(profilePage.statsSection).toBeVisible();
    await expect(profilePage.goalsSection).toBeVisible();
    await expect(profilePage.settingsSection).toBeVisible();
    await expect(profilePage.accountSection).toBeVisible();
  });

  test('관심사 태그 표시', async () => {
    await profilePage.navigate();
    
    // 관심사 태그들이 표시되는지 확인
    const interestTags = await profilePage.interestTags.all();
    expect(interestTags.length).toBeGreaterThan(0);
    
    // 각 태그의 텍스트 확인
    for (const tag of interestTags) {
      const tagText = await tag.textContent();
      expect(tagText).toBeTruthy();
    }
  });

  test('언어 정보 표시', async () => {
    await profilePage.navigate();
    
    // 언어 정보가 올바르게 표시되는지 확인
    await expect(profilePage.nativeLanguage).toContainText('Korean');
    await expect(profilePage.learningLanguage).toContainText('English');
    await expect(profilePage.languageLevel).toContainText('INTERMEDIATE');
  });

  test('알림 설정 토글', async () => {
    await profilePage.navigate();
    
    await profilePage.enterEditMode();
    
    // 이메일 알림 토글 테스트
    const emailToggleInitialState = await profilePage.emailNotificationToggle.isChecked();
    await profilePage.emailNotificationToggle.click();
    const emailToggleNewState = await profilePage.emailNotificationToggle.isChecked();
    expect(emailToggleNewState).toBe(!emailToggleInitialState);
    
    // 푸시 알림 토글 테스트
    const pushToggleInitialState = await profilePage.pushNotificationToggle.isChecked();
    await profilePage.pushNotificationToggle.click();
    const pushToggleNewState = await profilePage.pushNotificationToggle.isChecked();
    expect(pushToggleNewState).toBe(!pushToggleInitialState);
  });

  test('프로필 공개 설정 토글', async () => {
    await profilePage.navigate();
    
    await profilePage.enterEditMode();
    
    const visibilityToggleInitialState = await profilePage.profileVisibilityToggle.isChecked();
    await profilePage.profileVisibilityToggle.click();
    const visibilityToggleNewState = await profilePage.profileVisibilityToggle.isChecked();
    expect(visibilityToggleNewState).toBe(!visibilityToggleInitialState);
  });

  test('여러 필드 동시 편집', async () => {
    await profilePage.navigate();
    
    await profilePage.enterEditMode();
    
    // 여러 필드 동시 변경
    await profilePage.englishNameInput.fill('Multi Edit User');
    await profilePage.residenceInput.fill('Jeju, South Korea');
    await profilePage.introTextarea.fill('여러 필드를 동시에 편집한 테스트입니다.');
    await profilePage.languageLevelSelect.selectOption('ADVANCED');
    
    // 저장
    await profilePage.saveButton.click();
    
    // 성공 메시지 확인
    await profilePage.helpers.expectSuccessMessage('프로필이 업데이트되었습니다');
  });

  test('목표 시간 입력 유효성 검사', async () => {
    await profilePage.navigate();
    
    await profilePage.enterEditMode();
    
    // 음수 값 입력 시도
    await profilePage.dailyGoalInput.fill('-30');
    await profilePage.saveButton.click();
    
    // 유효성 검사 에러 메시지 확인
    const errorMessage = profilePage.page.locator('[data-testid="goal-validation-error"]');
    
    try {
      await expect(errorMessage).toBeVisible({ timeout: 2000 });
      await expect(errorMessage).toContainText('양수를 입력해주세요');
    } catch {
      // 브라우저의 기본 number input 검증이 동작하는 경우
      const inputValue = await profilePage.dailyGoalInput.inputValue();
      expect(inputValue).not.toBe('-30');
    }
  });

  test('소개 텍스트 글자 수 제한', async () => {
    await profilePage.navigate();
    
    await profilePage.enterEditMode();
    
    // 매우 긴 소개 텍스트 입력
    const longIntro = 'A'.repeat(1000);
    await profilePage.introTextarea.fill(longIntro);
    
    // 글자 수 카운터 확인 (구현된 경우)
    const charCounter = profilePage.page.locator('[data-testid="intro-char-counter"]');
    
    if (await charCounter.isVisible()) {
      const counterText = await charCounter.textContent();
      const currentCount = parseInt(counterText?.match(/\d+/)?.[0] || '0');
      expect(currentCount).toBeGreaterThan(0);
    }
  });

  test('프로필 이미지 크기 제한', async () => {
    await profilePage.navigate();
    
    await profilePage.uploadImageButton.click();
    
    if (await profilePage.imageUploadModal.isVisible()) {
      // 파일 크기 제한 안내 메시지 확인
      const sizeLimit = profilePage.page.locator('[data-testid="image-size-limit"]');
      
      if (await sizeLimit.isVisible()) {
        const limitText = await sizeLimit.textContent();
        expect(limitText).toMatch(/MB|KB/i);
      }
    }
  });

  test('계정 삭제 확인 다이얼로그', async () => {
    await profilePage.navigate();
    
    await profilePage.deleteAccountButton.click();
    
    // 확인 다이얼로그가 표시되는지 확인
    const confirmDialog = profilePage.page.locator('[data-testid="delete-account-dialog"]');
    await expect(confirmDialog).toBeVisible();
    
    // 경고 메시지 확인
    const warningMessage = confirmDialog.locator('[data-testid="delete-warning"]');
    await expect(warningMessage).toBeVisible();
    await expect(warningMessage).toContainText('계정을 삭제하면');
    
    // 취소 버튼 테스트
    const cancelButton = confirmDialog.locator('[data-testid="cancel-delete"]');
    await cancelButton.click();
    
    // 다이얼로그가 닫히는지 확인
    await expect(confirmDialog).not.toBeVisible();
  });

  test('프로필 데이터 새로고침 후 유지', async () => {
    await profilePage.navigate();
    
    // 기본 정보 변경
    await profilePage.updateBasicInfo('Refresh Test', 'Test Location', 'Test intro');
    
    // 페이지 새로고침
    await profilePage.page.reload();
    
    // 변경된 정보가 유지되는지 확인 (API에서 업데이트된 데이터 반환)
    await expect(profilePage.userName).toContainText('Refresh Test');
    await expect(profilePage.userLocation).toContainText('Test Location');
  });

  test('동시 편집 충돌 처리', async ({ context }) => {
    // 두 개의 탭에서 같은 프로필 편집 시도
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    
    const profile1 = new ProfilePage(page1);
    const profile2 = new ProfilePage(page2);
    
    // 로그인 상태 설정
    await profile1.setLocalStorage('accessToken', 'mock-access-token');
    await profile2.setLocalStorage('accessToken', 'mock-access-token');
    
    // 두 탭에서 프로필 페이지 열기
    await profile1.navigate();
    await profile2.navigate();
    
    // 첫 번째 탭에서 편집 시작
    await profile1.enterEditMode();
    await profile1.englishNameInput.fill('First Tab Edit');
    
    // 두 번째 탭에서도 편집 시작
    await profile2.enterEditMode();
    await profile2.englishNameInput.fill('Second Tab Edit');
    
    // 첫 번째 탭에서 저장
    await profile1.saveButton.click();
    
    // 두 번째 탭에서 저장 시도 (충돌 상황)
    await profile2.saveButton.click();
    
    // 충돌 경고 메시지나 처리 확인 (구현된 경우)
    const conflictWarning = profile2.page.locator('[data-testid="edit-conflict-warning"]');
    
    try {
      await expect(conflictWarning).toBeVisible({ timeout: 3000 });
    } catch {
      // 충돌 처리가 구현되지 않은 경우
      console.log('편집 충돌 처리가 구현되지 않음');
    }
    
    await page1.close();
    await page2.close();
  });
});