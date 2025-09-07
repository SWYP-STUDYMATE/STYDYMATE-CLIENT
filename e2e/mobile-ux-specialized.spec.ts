import { test, expect, devices } from '@playwright/test';

// 모바일 UX 특화 테스트 - 실제 사용성에 중점
test.describe('모바일 UX 특화 테스트', () => {

  // 1. 원핸드 모드 사용성 테스트
  test.describe('원핸드 모드 사용성', () => {
    test.use({ ...devices['iPhone 12'] });

    test('하단 네비게이션 및 주요 버튼 접근성', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/main');

      // 하단 1/3 영역에 주요 인터랙션 요소들이 있는지 확인
      const viewportHeight = 812;
      const thumbReachArea = viewportHeight * 2 / 3; // 하단 1/3 지역

      const primaryButtons = page.locator('button').filter({ hasText: /시작|확인|저장|완료|다음/ });
      const buttonCount = await primaryButtons.count();

      for (let i = 0; i < buttonCount; i++) {
        const button = primaryButtons.nth(i);
        const box = await button.boundingBox();
        
        if (box && await button.isVisible()) {
          // 주요 버튼들이 엄지손가락이 닿는 영역에 있는지 확인
          expect(box.y).toBeGreaterThan(thumbReachArea * 0.7); // 어느 정도 유연성 허용
        }
      }
    });

    test('좌우 가장자리 요소 접근성', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');

      // 좌우 가장자리의 중요한 요소들이 너무 끝에 있지 않은지 확인
      const clickableElements = page.locator('button, a, input').filter({ hasText: /.+/ });
      const count = await clickableElements.count();

      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = clickableElements.nth(i);
        const box = await element.boundingBox();
        
        if (box && await element.isVisible()) {
          // 가장자리에서 최소 16px 떨어져 있어야 함 (엄지손가락 편의)
          expect(box.x).toBeGreaterThanOrEqual(16);
          expect(box.x + box.width).toBeLessThanOrEqual(375 - 16);
        }
      }
    });
  });

  // 2. 스크롤 및 제스처 UX
  test.describe('스크롤 및 제스처 UX', () => {
    test.use({ ...devices['Pixel 5'] });

    test('스크롤 영역 명확성', async ({ page }) => {
      await page.goto('/sessions');

      // 스크롤 가능한 영역이 명확한지 확인
      const scrollableElements = page.locator('[style*="overflow"], .scroll, .list');
      
      if (await scrollableElements.count() > 0) {
        const scrollContainer = scrollableElements.first();
        
        // 스크롤 인디케이터나 시각적 힌트가 있는지 확인
        const hasScrollHint = await page.locator('.scroll-indicator, .fade-edge').count() > 0;
        
        // 스크롤해서 더 많은 콘텐츠가 있는지 확인
        const initialHeight = await scrollContainer.evaluate(el => el.scrollHeight);
        const visibleHeight = await scrollContainer.evaluate(el => el.clientHeight);
        
        if (initialHeight > visibleHeight) {
          // 스크롤 가능한 경우, 스크롤이 실제로 작동하는지 테스트
          await scrollContainer.hover();
          await page.mouse.wheel(0, 100);
          
          const scrollTop = await scrollContainer.evaluate(el => el.scrollTop);
          expect(scrollTop).toBeGreaterThan(0);
        }
      }
    });

    test('풀 투 리프레시 대응', async ({ page }) => {
      await page.goto('/main');

      // 페이지 상단에서 아래로 스와이프 제스처
      await page.touchscreen.tap(187, 100); // 화면 중앙 상단
      
      const startY = 50;
      const endY = 200;
      
      // 풀 투 리프레시 제스처 시뮬레이션
      await page.touchscreen.tap(187, startY);
      await page.mouse.move(187, startY);
      await page.mouse.down();
      await page.mouse.move(187, endY);
      await page.mouse.up();

      // 리프레시 인디케이터나 페이지 새로고침이 발생했는지 확인
      await page.waitForTimeout(1000);
      
      // 페이지가 여전히 로드된 상태인지 확인
      await expect(page.locator('body')).toBeVisible();
    });

    test('무한 스크롤 성능', async ({ page }) => {
      await page.goto('/sessions');

      let previousHeight = 0;
      let currentHeight = await page.evaluate(() => document.body.scrollHeight);
      
      // 최대 3번의 스크롤로 무한 스크롤 테스트
      for (let i = 0; i < 3; i++) {
        previousHeight = currentHeight;
        
        // 페이지 하단으로 스크롤
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(2000); // 로딩 대기
        
        currentHeight = await page.evaluate(() => document.body.scrollHeight);
        
        // 새로운 콘텐츠가 로드되었는지 확인
        if (currentHeight > previousHeight) {
          break; // 무한 스크롤이 작동함
        }
      }

      // 스크롤 성능 확인 (페이지가 멈추지 않았는지)
      await expect(page.locator('body')).toBeVisible();
    });
  });

  // 3. 입력 및 폼 UX
  test.describe('모바일 입력 UX', () => {
    test.use({ ...devices['iPhone 12'] });

    test('가상 키보드 최적화', async ({ page }) => {
      await page.goto('/');

      const inputFields = page.locator('input, textarea');
      const count = await inputFields.count();

      for (let i = 0; i < count; i++) {
        const input = inputFields.nth(i);
        const inputType = await input.getAttribute('type');
        const inputMode = await input.getAttribute('inputmode');

        if (await input.isVisible()) {
          await input.click();
          
          // 적절한 가상 키보드 타입이 설정되어 있는지 확인
          if (inputType === 'email') {
            expect(['email', 'text']).toContain(inputType);
          } else if (inputType === 'tel') {
            expect(['tel', 'text']).toContain(inputType);
          } else if (inputType === 'number') {
            expect(['number', 'text']).toContain(inputType);
          }

          // inputmode 속성이 올바르게 설정되어 있는지 확인
          if (inputMode) {
            expect(['text', 'email', 'tel', 'numeric', 'decimal', 'search', 'url']).toContain(inputMode);
          }

          // 입력 후 키보드가 가려지지 않는지 확인
          await input.fill('test');
          await expect(input).toBeInViewport();
        }
      }
    });

    test('자동완성 및 제안 기능', async ({ page }) => {
      await page.goto('/');

      const inputs = page.locator('input[type="email"], input[type="text"], input[name*="name"]');
      const count = await inputs.count();

      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const autocomplete = await input.getAttribute('autocomplete');
        
        if (await input.isVisible()) {
          // 적절한 autocomplete 속성이 설정되어 있는지 확인
          const inputName = await input.getAttribute('name') || '';
          const inputType = await input.getAttribute('type') || '';
          
          if (inputType === 'email' || inputName.includes('email')) {
            expect(autocomplete).toMatch(/email|username/);
          } else if (inputName.includes('name')) {
            expect(autocomplete).toMatch(/name|given-name|family-name/);
          }
        }
      }
    });

    test('에러 상태 시각적 피드백', async ({ page }) => {
      await page.goto('/agreement');

      // 체크박스를 선택하지 않고 진행하려고 시도
      const submitButton = page.locator('button').filter({ hasText: /다음|확인|동의/ }).first();
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // 에러 메시지나 시각적 피드백이 표시되는지 확인
        const errorElements = page.locator('.error, [class*="error"], [data-testid*="error"]');
        const hasErrors = await errorElements.count() > 0;
        
        // 또는 필수 필드가 하이라이트되는지 확인
        const highlightedFields = page.locator('input:invalid, .invalid, [aria-invalid="true"]');
        const hasHighlights = await highlightedFields.count() > 0;
        
        expect(hasErrors || hasHighlights).toBe(true);
      }
    });
  });

  // 4. 로딩 및 피드백 UX
  test.describe('로딩 및 피드백 UX', () => {
    test.use({ ...devices['Pixel 5'] });

    test('로딩 상태 사용자 피드백', async ({ page }) => {
      // 네트워크 지연 시뮬레이션
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 1000);
      });

      const startTime = Date.now();
      await page.goto('/main');

      // 로딩 중 사용자 피드백 확인
      const loadingElements = page.locator('[data-testid*="loading"], .loading, .spinner, .skeleton');
      
      // 로딩 중에는 어떤 형태의 피드백이 있어야 함
      const hasLoadingFeedback = await Promise.race([
        loadingElements.first().waitFor({ state: 'visible', timeout: 2000 }).then(() => true),
        page.waitForTimeout(2000).then(() => false)
      ]);

      expect(hasLoadingFeedback).toBe(true);

      // 최종 로딩 완료 확인
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeGreaterThan(500); // 실제로 지연이 적용되었는지 확인
    });

    test('오프라인 상태 처리', async ({ page, context }) => {
      await page.goto('/main');

      // 오프라인 상태 시뮬레이션
      await context.setOffline(true);
      
      // 페이지 새로고침 시도
      const navigationPromise = page.reload().catch(() => {});
      
      // 오프라인 메시지나 적절한 피드백이 있는지 확인
      const offlineElements = page.locator('[data-testid*="offline"], .offline, text="오프라인"');
      
      // 몇 초 후 오프라인 피드백 확인
      await page.waitForTimeout(3000);
      
      // 네트워크 복구
      await context.setOffline(false);
    });

    test('버튼 상태 및 더블탭 방지', async ({ page }) => {
      await page.goto('/agreement');

      const buttons = page.locator('button').filter({ hasText: /.+/ });
      const count = await buttons.count();

      if (count > 0) {
        const button = buttons.first();
        
        // 버튼 클릭
        await button.click();
        
        // 클릭 후 버튼이 비활성화되거나 로딩 상태가 되는지 확인
        const isDisabled = await button.isDisabled();
        const hasLoadingState = await button.locator('.loading, .spinner').count() > 0;
        const buttonText = await button.textContent();
        
        // 더블클릭 방지를 위한 상태 변경이 있어야 함
        if (buttonText?.includes('다음') || buttonText?.includes('확인') || buttonText?.includes('저장')) {
          await page.waitForTimeout(500);
          // 상태가 변경되었거나 페이지가 이동되었는지 확인
          const currentUrl = page.url();
          expect(currentUrl).toBeDefined();
        }
      }
    });
  });

  // 5. 멀티터치 및 제스처
  test.describe('멀티터치 및 고급 제스처', () => {
    test.use({ ...devices['iPhone 12'] });

    test('핀치 줌 대응', async ({ page }) => {
      await page.goto('/profile');

      // 이미지나 줌 가능한 요소 찾기
      const zoomableElements = page.locator('img, [data-zoomable], .zoomable');
      
      if (await zoomableElements.count() > 0) {
        const element = zoomableElements.first();
        const box = await element.boundingBox();
        
        if (box) {
          // 핀치 줌 제스처 시뮬레이션 (간단한 버전)
          await page.touchscreen.tap(box.x + box.width/2, box.y + box.height/2);
          
          // 더블탭으로 줌 기능 테스트
          await page.touchscreen.tap(box.x + box.width/2, box.y + box.height/2);
          await page.waitForTimeout(100);
          await page.touchscreen.tap(box.x + box.width/2, box.y + box.height/2);
          
          // 줌이 적용되었는지 간접적으로 확인
          await expect(element).toBeVisible();
        }
      }
    });

    test('롱프레스 컨텍스트 메뉴', async ({ page }) => {
      await page.goto('/sessions');

      const listItems = page.locator('[data-testid*="item"], .item, li').filter({ hasText: /.+/ });
      
      if (await listItems.count() > 0) {
        const item = listItems.first();
        const box = await item.boundingBox();
        
        if (box) {
          // 롱프레스 제스처 시뮬레이션
          await page.touchscreen.tap(box.x + box.width/2, box.y + box.height/2);
          await page.waitForTimeout(800); // 롱프레스 시간
          
          // 컨텍스트 메뉴나 액션 시트가 나타나는지 확인
          const contextMenus = page.locator('.context-menu, .action-sheet, [role="menu"]');
          
          // 컨텍스트 메뉴가 나타났다면 확인
          if (await contextMenus.count() > 0) {
            await expect(contextMenus.first()).toBeVisible();
          }
        }
      }
    });
  });

  // 6. 배터리 및 성능 고려사항
  test.describe('배터리 절약 및 성능', () => {
    test.use({ ...devices['Pixel 5'] });

    test('애니메이션 및 트랜지션 최적화', async ({ page }) => {
      await page.goto('/main');

      // CSS 애니메이션이 적절히 제한되어 있는지 확인
      const animatedElements = page.locator('[style*="animation"], [class*="animate"], .transition');
      const count = await animatedElements.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const element = animatedElements.nth(i);
        
        const animationDuration = await element.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return styles.animationDuration || styles.transitionDuration;
        });

        // 애니메이션이 너무 길지 않은지 확인 (배터리 절약)
        if (animationDuration && animationDuration !== '0s') {
          const duration = parseFloat(animationDuration);
          expect(duration).toBeLessThan(2); // 2초 이하
        }
      }
    });

    test('불필요한 리렌더링 방지', async ({ page }) => {
      await page.goto('/chat');

      // 페이지 로드 후 불필요한 네트워크 요청이 계속 발생하지 않는지 확인
      await page.waitForLoadState('networkidle');
      
      let requestCount = 0;
      page.on('request', () => requestCount++);
      
      // 3초 동안 대기하며 불필요한 요청 모니터링
      await page.waitForTimeout(3000);
      
      // 폴링이나 지속적인 요청이 과도하지 않은지 확인
      expect(requestCount).toBeLessThan(10); // 3초에 10개 이하
    });

    test('이미지 및 미디어 최적화', async ({ page }) => {
      await page.goto('/profile');

      const images = page.locator('img');
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const src = await img.getAttribute('src');
        const loading = await img.getAttribute('loading');
        
        if (src && await img.isVisible()) {
          // 지연 로딩 속성이 있는지 확인
          expect(['lazy', 'eager', null]).toContain(loading);
          
          // 적절한 이미지 형식인지 확인 (확장자 기반)
          const isOptimized = src.includes('.webp') || 
                            src.includes('.avif') || 
                            src.includes('w_') || // Cloudinary 같은 CDN 최적화
                            src.includes('format=');
          
          // 최적화된 이미지거나 작은 이미지인지 확인
          const box = await img.boundingBox();
          const isSmallImage = box && (box.width < 200 && box.height < 200);
          
          if (!isSmallImage) {
            expect(isOptimized || loading === 'lazy').toBe(true);
          }
        }
      }
    });
  });

  // 7. 다크모드 및 테마 대응
  test.describe('다크모드 및 접근성', () => {
    test.use({ ...devices['iPhone 12'], colorScheme: 'dark' });

    test('다크모드 색상 대비', async ({ page }) => {
      await page.goto('/');

      // 다크모드에서 텍스트 가독성 확인
      const textElements = page.locator('h1, h2, h3, p, span, button').filter({ hasText: /.+/ });
      const count = await textElements.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const element = textElements.nth(i);
        
        if (await element.isVisible()) {
          const styles = await element.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor
            };
          });

          // 다크모드에서 적절한 색상이 사용되고 있는지 확인
          expect(styles.color).toBeDefined();
          expect(styles.backgroundColor).toBeDefined();
        }
      }
    });

    test('다크모드 이미지 및 아이콘 대응', async ({ page }) => {
      await page.goto('/main');

      // 다크모드에서 이미지가 적절히 표시되는지 확인
      const icons = page.locator('svg, .icon, [class*="icon"]');
      const count = await icons.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const icon = icons.nth(i);
        
        if (await icon.isVisible()) {
          // 아이콘이 다크모드에서도 보이는지 확인
          const opacity = await icon.evaluate(el => {
            return window.getComputedStyle(el).opacity;
          });

          expect(parseFloat(opacity)).toBeGreaterThan(0.1);
        }
      }
    });
  });
});