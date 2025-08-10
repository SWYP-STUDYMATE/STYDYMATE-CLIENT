import { test, expect } from '@playwright/test';

// TDD: 약관 동의 페이지 - 필수 체크박스가 모두 선택될 때만 '완료' 활성화되고 다음 페이지로 이동

test.describe('TDD - 약관 동의', () => {
  test.beforeEach(async ({ context, page }) => {
    // 약관 페이지 접근 조건 충족(로그인 토큰, 신규 사용자 플래그)
    await context.addInitScript(() => {
      window.localStorage.setItem('accessToken', 'tdd-mock-token');
      window.localStorage.setItem('isAuthenticated', 'true');
      window.localStorage.setItem('isNewUser', 'true');
    });
    await page.goto('/agreement');
    await page.waitForLoadState('networkidle');
  });

  test('필수 항목 체크 전에는 완료 버튼 비활성화', async ({ page }) => {
    const completeButton = page.getByRole('button', { name: '완료' });
    await expect(completeButton).toBeDisabled();
  });

  test('필수 3개(age, terms, privacy) 체크 시 완료 버튼 활성화', async ({ page }) => {
    const completeButton = page.getByRole('button', { name: '완료' });

    // 개별 체크 진행하며 상태 확인
    await page.check('#age-checkbox');
    await expect(completeButton).toBeDisabled();

    await page.check('#terms-checkbox');
    await expect(completeButton).toBeDisabled();

    await page.check('#privacy-checkbox');
    await expect(completeButton).toBeEnabled();
  });

  test('완료 클릭 시 회원가입 완료 페이지로 이동', async ({ page }) => {
    const completeButton = page.getByRole('button', { name: '완료' });

    await page.check('#age-checkbox');
    await page.check('#terms-checkbox');
    await page.check('#privacy-checkbox');

    await completeButton.click();
    await expect(page).toHaveURL(/\/signup-complete$/);
  });
});