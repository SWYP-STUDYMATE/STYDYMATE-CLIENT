import { test, expect } from '@playwright/test';

test.describe('App smoke', () => {
    test('root renders login page title', async ({ page, baseURL }) => {
        if (!baseURL) throw new Error('baseURL is not defined for this test environment');
        await page.goto(baseURL);
        await expect(page).toHaveTitle(/Language Mate|Studymate|Login/i);
    });
});

