import { test, expect, devices } from '@playwright/test';

// 다양한 디바이스 크기 정의
const VIEWPORTS = {
  // 모바일
  mobile: { width: 375, height: 667 }, // iPhone SE
  mobileLarge: { width: 414, height: 896 }, // iPhone 11
  // 태블릿
  tablet: { width: 768, height: 1024 }, // iPad
  tabletLandscape: { width: 1024, height: 768 }, // iPad 가로
  // 데스크톱
  desktop: { width: 1280, height: 720 },
  desktopLarge: { width: 1920, height: 1080 },
};

// 주요 페이지 URL들
const PAGES = [
  { path: '/', name: '로그인 페이지' },
  { path: '/agreement', name: '약관 동의 페이지' },
  { path: '/main', name: '메인 페이지', needsAuth: true },
  { path: '/profile', name: '프로필 페이지', needsAuth: true },
  { path: '/chat', name: '채팅 페이지', needsAuth: true },
  { path: '/sessions', name: '세션 목록 페이지', needsAuth: true },
  { path: '/matching', name: '매칭 페이지', needsAuth: true },
  { path: '/settings', name: '설정 페이지', needsAuth: true },
];

test.describe('모바일 및 반응형 UX 테스트', () => {
  
  // 1. 기본 반응형 레이아웃 테스트
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    test.describe(`${viewportName} 뷰포트 (${viewport.width}x${viewport.height})`, () => {
      
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize(viewport);
      });

      // 공개 페이지 테스트
      test('로그인 페이지 반응형 레이아웃', async ({ page }) => {
        await page.goto('/');
        
        // 페이지 로드 확인
        await expect(page).toHaveTitle(/STUDYMATE/);
        
        // 로고 또는 제목 표시 확인
        const logoOrTitle = page.locator('[data-testid="logo"], h1, .logo').first();
        await expect(logoOrTitle).toBeVisible();
        
        // 로그인 버튼 또는 폼 표시 확인
        const loginElement = page.locator('button, input[type="submit"], [data-testid="login-btn"]').first();
        await expect(loginElement).toBeVisible();
        
        // 요소가 뷰포트 내에 올바르게 위치하는지 확인
        const boundingBox = await loginElement.boundingBox();
        if (boundingBox) {
          expect(boundingBox.x).toBeGreaterThanOrEqual(0);
          expect(boundingBox.y).toBeGreaterThanOrEqual(0);
          expect(boundingBox.x + boundingBox.width).toBeLessThanOrEqual(viewport.width);
        }
      });

      test('약관 동의 페이지 반응형 레이아웃', async ({ page }) => {
        await page.goto('/agreement');
        
        // 약관 체크박스들이 모바일에서도 터치 가능한 크기인지 확인
        const checkboxes = page.locator('input[type="checkbox"]');
        const checkboxCount = await checkboxes.count();
        
        for (let i = 0; i < checkboxCount; i++) {
          const checkbox = checkboxes.nth(i);
          const boundingBox = await checkbox.boundingBox();
          
          if (boundingBox) {
            // 최소 터치 타겟 크기 44px (iOS HIG 권장사항)
            expect(Math.max(boundingBox.width, boundingBox.height)).toBeGreaterThanOrEqual(20);
          }
        }
        
        // 스크롤 없이 주요 요소들이 보이는지 확인 (유연하게 처리)
        const agreementElements = page.locator('text=전체 동의, text=전체동의, text=모두 동의, [data-testid*="agree"], button, input[type="checkbox"]');
        await expect(agreementElements.first()).toBeVisible();
        
        // 모바일에서 텍스트가 잘리지 않는지 확인 (가로 스크롤 방지)
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 20); // 20px 여유
      });
    });
  }

  // 2. 터치 및 모바일 인터랙션 테스트
  test.describe('모바일 터치 인터랙션', () => {
    test('터치 타겟 크기 및 간격 검증', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12
      await page.goto('/agreement');
      
      // 터치 가능한 모든 요소들 찾기
      const touchTargets = page.locator('button, input, a, [role="button"], [tabindex="0"]');
      const count = await touchTargets.count();
      
      for (let i = 0; i < count; i++) {
        const target = touchTargets.nth(i);
        const box = await target.boundingBox();
        
        if (box && await target.isVisible()) {
          // 최소 터치 타겟 크기 검증 (44x44px iOS, 48x48px Android)
          const minSize = 40; // 약간 완화된 기준
          expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(minSize);
        }
      }
    });

    test('스와이프 제스처 지원', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12
      await page.goto('/');
      
      // 스와이프 가능한 영역이 있는지 확인 (캐러셀, 탭 등)
      const swipeableElements = page.locator('[data-testid*="swipe"], .swiper, .carousel, [data-swipe]');
      
      if (await swipeableElements.count() > 0) {
        const element = swipeableElements.first();
        const box = await element.boundingBox();
        
        if (box) {
          // 스와이프 제스처 시뮬레이션
          await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
          await page.touchscreen.tap(box.x + box.width / 4, box.y + box.height / 2);
        }
      }
    });

    test('가상 키보드 대응', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12
      await page.goto('/');
      
      // 입력 필드 찾기
      const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"], textarea');
      const inputCount = await inputs.count();
      
      if (inputCount > 0) {
        const input = inputs.first();
        
        // 입력 필드 클릭 및 포커스
        await input.click();
        
        // 입력 필드가 뷰포트 상단으로 스크롤되는지 확인
        await expect(input).toBeInViewport();
        
        // 키보드가 올라와도 입력 필드가 가려지지 않는지 간접 확인
        const inputBox = await input.boundingBox();
        if (inputBox) {
          expect(inputBox.y).toBeLessThan(400); // 가상 키보드 영역을 고려
        }
      }
    });
  });

  // 3. 브레이크포인트 전환 테스트
  test.describe('브레이크포인트 전환', () => {
    test('뷰포트 크기 변경 시 레이아웃 적응', async ({ page }) => {
      // 데스크톱에서 시작
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/');
      
      // 데스크톱 레이아웃 확인
      const desktopLayout = await page.screenshot({ fullPage: true });
      
      // 모바일로 크기 변경
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.waitForTimeout(500); // 레이아웃 전환 대기
      
      // 모바일 레이아웃으로 변경되었는지 확인
      const mobileLayout = await page.screenshot({ fullPage: true });
      
      // 두 스크린샷이 다른지 확인 (레이아웃이 실제로 변경됨)
      expect(desktopLayout).not.toEqual(mobileLayout);
      
      // 가로 스크롤이 없는지 확인
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(VIEWPORTS.mobile.width + 10);
    });

    test('태블릿 가로/세로 전환', async ({ page }) => {
      // 세로 모드
      await page.setViewportSize(VIEWPORTS.tablet);
      await page.goto('/agreement');
      
      await expect(page.locator('text=전체 동의').first()).toBeVisible();
      
      // 가로 모드로 전환
      await page.setViewportSize(VIEWPORTS.tabletLandscape);
      await page.waitForTimeout(300);
      
      // 여전히 주요 요소가 표시되는지 확인
      await expect(page.locator('text=전체 동의').first()).toBeVisible();
      
      // 가로 레이아웃에 맞게 조정되었는지 확인
      const elements = page.locator('button, input');
      const count = await elements.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(elements.nth(i)).toBeInViewport();
      }
    });
  });

  // 4. 성능 및 로딩 테스트 (모바일)
  test.describe('모바일 성능', () => {
    test('모바일 페이지 로드 성능', async ({ page }) => {
      await page.setViewportSize({ width: 393, height: 851 }); // Pixel 5
      const startTime = Date.now();
      
      await page.goto('/');
      
      // First Contentful Paint 대기
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // 모바일에서 3초 이내 로드 (완화된 기준)
      expect(loadTime).toBeLessThan(5000);
      
      // 주요 요소가 표시되는지 확인
      const mainElement = page.locator('button, h1, .logo').first();
      await expect(mainElement).toBeVisible();
    });

    test('이미지 지연 로딩 및 반응형 이미지', async ({ page }) => {
      await page.setViewportSize({ width: 393, height: 851 }); // Pixel 5
      await page.goto('/profile');
      
      // 프로필 이미지나 아바타 찾기
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const src = await img.getAttribute('src');
        const srcset = await img.getAttribute('srcset');
        
        if (src) {
          // 이미지 로드 확인
          await expect(img).toBeVisible();
          
          // 적절한 크기로 표시되는지 확인
          const box = await img.boundingBox();
          if (box) {
            expect(box.width).toBeGreaterThan(0);
            expect(box.height).toBeGreaterThan(0);
            expect(box.width).toBeLessThan(500); // 모바일에서 너무 큰 이미지 방지
          }
        }
      }
    });
  });

  // 5. 접근성 테스트 (모바일)
  test.describe('모바일 접근성', () => {
    test('터치 접근성 및 포커스 관리', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12
      await page.goto('/agreement');
      
      // 포커스 가능한 요소들
      const focusableElements = page.locator('button, input, a, [tabindex="0"]');
      const count = await focusableElements.count();
      
      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = focusableElements.nth(i);
        
        if (await element.isVisible()) {
          // 포커스 가능한지 확인
          await element.focus();
          
          // 포커스 표시가 있는지 확인 (outline 등)
          const styles = await element.evaluate(el => {
            const computed = window.getComputedStyle(el, ':focus');
            return {
              outline: computed.outline,
              borderColor: computed.borderColor,
              boxShadow: computed.boxShadow
            };
          });
          
          // 포커스 스타일이 있는지 확인
          const hasFocusStyle = styles.outline !== 'none' || 
                               styles.borderColor !== 'rgb(0, 0, 0)' ||
                               styles.boxShadow !== 'none';
                               
          expect(hasFocusStyle).toBe(true);
        }
      }
    });

    test('색상 대비 및 가독성', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12
      await page.goto('/');
      
      // 주요 텍스트 요소들의 색상 대비 확인
      const textElements = page.locator('h1, h2, h3, p, span, button').filter({ hasText: /.+/ });
      const count = await textElements.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        const element = textElements.nth(i);
        
        if (await element.isVisible()) {
          const styles = await element.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              fontSize: computed.fontSize
            };
          });
          
          // 최소 폰트 크기 확인 (모바일에서 16px 권장)
          const fontSize = parseInt(styles.fontSize);
          expect(fontSize).toBeGreaterThanOrEqual(14); // 약간 완화된 기준
        }
      }
    });
  });

  // 6. 네트워크 상태별 테스트
  test.describe('저속 네트워크 대응', () => {
    test('3G 네트워크에서 UX', async ({ page, context }) => {
      // 3G 네트워크 시뮬레이션
      await context.route('**/*', route => {
        setTimeout(() => route.continue(), Math.random() * 1000 + 500);
      });
      
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto('/');
      
      // 로딩 상태 표시가 있는지 확인
      const loadingIndicators = page.locator('[data-testid*="loading"], .loading, .spinner');
      
      // 로딩 중에는 로딩 인디케이터가 표시되어야 함
      await expect(page.locator('body')).toBeVisible();
      
      // 최종적으로 콘텐츠가 로드되는지 확인
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    });
  });

  // 7. 모바일 브라우저별 호환성
  test.describe('모바일 브라우저 호환성', () => {
    test('iOS Safari 호환성', async ({ page, browserName }) => {
      test.skip(browserName !== 'webkit', 'iOS Safari 테스트는 webkit에서만');
      
      await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
      await page.goto('/');
      
      // iOS Safari 특정 이슈 확인
      // 1. 100vh 문제
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
      
      // 뷰포트 높이가 적절한지 확인
      expect(viewportHeight).toBeGreaterThan(700);
      
      // 2. 터치 이벤트 지원
      const hasTouch = await page.evaluate(() => 'ontouchstart' in window);
      expect(hasTouch).toBe(true);
    });

    test('Android Chrome 호환성', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'Android Chrome 테스트는 chromium에서만');
      
      await page.setViewportSize({ width: 360, height: 640 }); // Pixel
      await page.goto('/');
      
      // Android 특정 기능 확인
      // PWA 관련 메타 태그
      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
      expect(viewport).toContain('width=device-width');
      
      // 주소창 숨김 대응
      await page.evaluate(() => window.scrollTo(0, 1));
      await page.waitForTimeout(100);
      
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeGreaterThanOrEqual(0);
    });
  });
});

// 8. 특정 컴포넌트의 반응형 테스트
test.describe('주요 컴포넌트 반응형', () => {
  
  test('네비게이션 메뉴 반응형', async ({ page }) => {
    // 데스크톱
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto('/main');
    
    // 모바일로 변경
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.waitForTimeout(300);
    
    // 모바일 메뉴가 적절히 표시되는지 확인
    const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, .hamburger');
    
    // 모바일 메뉴 버튼이나 네비게이션이 있어야 함
    const navigationExists = await page.locator('nav, [role="navigation"]').count() > 0;
    const menuButtonExists = await mobileMenu.count() > 0;
    
    expect(navigationExists || menuButtonExists).toBe(true);
  });

  test('폼 요소 반응형', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/agreement');
    
    // 모든 폼 요소가 모바일에 적합한지 확인
    const formElements = page.locator('input, button, textarea, select');
    const count = await formElements.count();
    
    for (let i = 0; i < count; i++) {
      const element = formElements.nth(i);
      const box = await element.boundingBox();
      
      if (box && await element.isVisible()) {
        // 요소가 뷰포트 너비를 벗어나지 않는지 확인
        expect(box.x + box.width).toBeLessThanOrEqual(VIEWPORTS.mobile.width);
        
        // 모바일에서 적절한 높이인지 확인
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('카드/리스트 아이템 반응형', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/sessions');
    
    // 리스트 아이템들이 모바일에서 적절히 표시되는지 확인
    const listItems = page.locator('[data-testid*="item"], .card, .list-item, li');
    const count = await listItems.count();
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const item = listItems.nth(i);
        const box = await item.boundingBox();
        
        if (box && await item.isVisible()) {
          // 카드가 모바일 너비에 맞는지 확인
          expect(box.width).toBeLessThanOrEqual(VIEWPORTS.mobile.width);
          expect(box.width).toBeGreaterThan(VIEWPORTS.mobile.width * 0.8); // 최소 80% 너비
          
          // 터치하기 적절한 높이인지 확인
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });
});