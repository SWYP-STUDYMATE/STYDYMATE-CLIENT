import { test, expect } from '@playwright/test';

test.describe('App smoke', () => {
  test('loads home and has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/STUDYMATE|Language Mate/i);
  });

  test('lazy routes render', async ({ page }) => {
    await page.goto('/main');
    await expect(page.getByText(/로딩 중|Loading/i)).toBeVisible({ timeout: 5000 });
  });
});
