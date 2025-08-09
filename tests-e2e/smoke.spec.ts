import { test, expect } from '@playwright/test';

test.describe('App smoke', () => {
  test('root renders login page title', async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await expect(page).toHaveTitle(/Language Mate|Studymate|Login/i);
  });
});

