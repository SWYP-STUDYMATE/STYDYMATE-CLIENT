import { test as base } from '@playwright/test';

// 테스트 사용자 정보
export const testUsers = {
  student: {
    email: 'test.student@example.com',
    password: 'TestPassword123!',
    name: 'Test Student',
    userId: 'test-student-001'
  },
  partner: {
    email: 'test.partner@example.com',
    password: 'TestPassword123!',
    name: 'Test Partner',
    userId: 'test-partner-001'
  }
};

// 인증된 페이지 객체를 제공하는 fixture
export const test = base.extend({
  // 인증된 컨텍스트
  authenticatedPage: async ({ page, context }, use) => {
    // 로컬 스토리지에 테스트 토큰 설정
    await context.addInitScript(() => {
      window.localStorage.setItem('accessToken', 'test-jwt-token-123');
      window.localStorage.setItem('userId', 'test-student-001');
      window.localStorage.setItem('userName', 'Test Student');
      window.localStorage.setItem('isAuthenticated', 'true');
    });

    await use(page);
  },

  // 비인증 페이지
  unauthenticatedPage: async ({ page }, use) => {
    // 로컬 스토리지 초기화
    await page.evaluate(() => {
      window.localStorage.clear();
    });

    await use(page);
  }
});

export { expect } from '@playwright/test';