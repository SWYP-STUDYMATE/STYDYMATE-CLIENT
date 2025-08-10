import { test, expect } from '@playwright/test';

// 로그인 관련 기본 UI 및 진입 경로 검증

test.describe('로그인/동의 플로우 - UI', () => {
  test('로그인 페이지 기본 요소', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Language Mate에 오신 것을 환영해요!')).toBeVisible();
    await expect(page.getByRole('button', { name: '네이버로 로그인' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Google 로그인' })).toBeVisible();
    await expect(page.getByText('자동 로그인')).toBeVisible();
  });

  test('네이버 콜백 페이지 진입 시 메시지 표시', async ({ page }) => {
    await page.goto('/login/oauth2/code/naver');
    await expect(page.getByText(/네이버 로그인 (처리 중|성공|실패)/)).toBeVisible();
  });

  test('약관 동의 페이지 노출', async ({ context, page }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem('accessToken', 'mock');
      window.localStorage.setItem('isNewUser', 'true');
    });
    await page.goto('/agreement');
    await expect(page.getByText('전체 동의')).toBeVisible();
    await expect(page.getByText('서비스 이용약관 동의')).toBeVisible();
    await expect(page.getByText('개인정보 처리 방침 동의')).toBeVisible();
  });

  test.skip('구글 콜백 처리(UI 텍스트 확인)', async ({ page }) => {
    // 라우트가 명시되어 있지 않아 실제 콜백 플로우는 별도 환경에서 확인 필요
    await page.goto('/login/oauth2/code/google');
    await expect(page.getByText(/구글/)).toBeVisible();
  });
});