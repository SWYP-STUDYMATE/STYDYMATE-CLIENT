import { test, expect } from './fixtures/auth.fixture';

// 모바일 핵심 페이지 스모크 테스트
// 인증이 필요한 페이지는 authenticatedPage 사용, 공개 페이지는 기본 page 사용

test.describe('모바일 핵심 페이지 스모크', () => {
  test('프로필 페이지 노출', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile');
    await expect(authenticatedPage.locator('h1:has-text("프로필")')).toBeVisible();
  });

  test('채팅 페이지 로드', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/chat');
    // 검색 플레이스홀더 또는 빈 상태 문구 중 하나는 보여야 함
    const searchPlaceholder = authenticatedPage.getByPlaceholder('채팅방을 검색해보세요');
    const emptyState = authenticatedPage.locator('text=채팅방이 없습니다');
    await expect(Promise.race([
      searchPlaceholder.waitFor({ state: 'visible' }),
      emptyState.waitFor({ state: 'visible' })
    ])).resolves.toBeDefined();
  });

  test('세션 리스트 페이지', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/sessions');
    await expect(authenticatedPage.locator('h1:has-text("세션")')).toBeVisible();
    // 탭 텍스트 일부 확인
    await expect(authenticatedPage.locator('text=예정된 세션').first()).toBeVisible();
  });

  test('세션 캘린더 페이지', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/sessions/calendar');
    await expect(authenticatedPage.locator('h1:has-text("세션 캘린더")')).toBeVisible();
  });

  test('세션 예약 생성 페이지', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/session/schedule/new');
    await expect(authenticatedPage.locator('h1:has-text("새 세션 예약")')).toBeVisible();
    await expect(authenticatedPage.locator('text=예약 완료')).toBeVisible();
  });

  test('오디오 연결 확인', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/session/audio-check');
    await expect(authenticatedPage.locator('h1:has-text("음성 세션 연결 확인")')).toBeVisible();
    await expect(authenticatedPage.locator('text=세션 시작하기')).toBeVisible();
  });

  test('비디오 연결 확인', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/session/video-check');
    await expect(authenticatedPage.locator('h1:has-text("화상 세션 연결 확인")')).toBeVisible();
    await expect(authenticatedPage.locator('text=화상 세션 시작하기')).toBeVisible();
  });

  test('레벨 테스트 시작 페이지', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/level-test');
    await expect(authenticatedPage.locator('h1:has-text("AI 레벨 테스트")')).toBeVisible();
    await expect(authenticatedPage.locator('button:has-text("시작하기")')).toBeVisible();
  });
});

// 공개 페이지: 약관 동의

test.describe('약관 동의(공개 페이지)', () => {
  test('전체 동의 UI 노출', async ({ page }) => {
    await page.goto('/agreement');
    await expect(page.locator('text=전체 동의')).toBeVisible();
    await expect(page.locator('text=서비스 이용약관 동의').first()).toBeVisible();
    await expect(page.locator('text=개인정보 처리 방침 동의').first()).toBeVisible();
  });
});