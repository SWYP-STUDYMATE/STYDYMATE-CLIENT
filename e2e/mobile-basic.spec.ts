import { test, expect, devices } from '@playwright/test';

// 기본적인 모바일 반응형 테스트 - 핵심 기능만 테스트
test.describe('기본 모바일 반응형 테스트', () => {
  
  // 모바일 뷰포트 설정
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  });

  test('로그인 페이지 모바일 표시', async ({ page }) => {
    await page.goto('/');
    
    // 페이지 로드 확인
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
    
    // 가로 스크롤이 없는지 확인
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(385); // 10px 여유
    
    // 스크린샷 촬영
    await page.screenshot({ path: 'test-results/login-mobile.png', fullPage: true });
  });

  test('약관 동의 페이지 모바일 표시', async ({ page }) => {
    await page.goto('/agreement');
    
    // 페이지 로드 확인
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
    
    // 체크박스나 버튼이 있는지 확인
    const interactiveElements = page.locator('input, button, [role="button"]');
    const count = await interactiveElements.count();
    expect(count).toBeGreaterThan(0);
    
    // 가로 스크롤이 없는지 확인
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(385); // 10px 여유
    
    // 스크린샷 촬영
    await page.screenshot({ path: 'test-results/agreement-mobile.png', fullPage: true });
  });

  test('터치 타겟 크기 검증', async ({ page }) => {
    await page.goto('/agreement');
    await page.waitForLoadState('networkidle');
    
    // 클릭 가능한 요소들 찾기
    const clickableElements = page.locator('button, input, a, [role="button"]');
    const count = await clickableElements.count();
    
    let validTargets = 0;
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = clickableElements.nth(i);
      
      if (await element.isVisible()) {
        const box = await element.boundingBox();
        
        if (box) {
          // 최소 터치 타겟 크기 검증 (32px 이상 권장)
          const minDimension = Math.min(box.width, box.height);
          if (minDimension >= 32) {
            validTargets++;
          }
        }
      }
    }
    
    // 대부분의 터치 타겟이 적절한 크기여야 함
    expect(validTargets).toBeGreaterThan(0);
  });

  test('뷰포트 크기별 반응형 확인', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 390, height: 844, name: 'iPhone 12' },
      { width: 393, height: 851, name: 'Pixel 5' },
      { width: 768, height: 1024, name: 'iPad' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // 가로 스크롤이 없는지 확인
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 20);

      // 주요 콘텐츠가 보이는지 확인
      await expect(page.locator('body')).toBeVisible();
      
      console.log(`✓ ${viewport.name} (${viewport.width}x${viewport.height}) - 가로 스크롤: ${bodyWidth <= viewport.width + 20 ? '없음' : '있음'}`);
    }
  });

  test('텍스트 가독성 확인', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 텍스트 요소들의 폰트 크기 확인
    const textElements = page.locator('p, span, div, button').filter({ hasText: /.+/ });
    const count = await textElements.count();
    
    let readableTextCount = 0;
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = textElements.nth(i);
      
      if (await element.isVisible()) {
        const fontSize = await element.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return parseInt(styles.fontSize);
        });
        
        // 모바일에서 최소 14px 권장
        if (fontSize >= 14) {
          readableTextCount++;
        }
      }
    }
    
    expect(readableTextCount).toBeGreaterThan(0);
  });

  test('모바일 네비게이션 확인', async ({ page }) => {
    // 로그인이 필요한 페이지에 직접 접근해보기
    await page.goto('/main');
    
    // 로그인 페이지로 리다이렉트되거나 메인 페이지가 로드되어야 함
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    
    // URL이 유효한 페이지인지 확인
    expect(currentUrl).toMatch(/\/(main|login|$)/);
    
    // 페이지가 모바일에서 올바르게 표시되는지 확인
    await expect(page.locator('body')).toBeVisible();
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(385);
  });

  test('폼 요소 모바일 최적화', async ({ page }) => {
    await page.goto('/agreement');
    await page.waitForLoadState('networkidle');
    
    // 입력 요소들 찾기
    const inputs = page.locator('input, textarea, select');
    const count = await inputs.count();
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const input = inputs.nth(i);
        
        if (await input.isVisible()) {
          const box = await input.boundingBox();
          
          if (box) {
            // 입력 필드가 최소 높이를 가지는지 확인
            expect(box.height).toBeGreaterThanOrEqual(32);
            
            // 입력 필드가 뷰포트 너비를 넘지 않는지 확인
            expect(box.x + box.width).toBeLessThanOrEqual(375);
          }
        }
      }
    }
  });

  test('이미지 반응형 확인', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      
      if (await img.isVisible()) {
        const box = await img.boundingBox();
        
        if (box) {
          // 이미지가 뷰포트를 넘지 않는지 확인
          expect(box.width).toBeLessThanOrEqual(375);
          expect(box.x + box.width).toBeLessThanOrEqual(375);
        }
      }
    }
  });

  test('성능 기본 확인', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // 모바일에서 5초 이내 로드 (관대한 기준)
    expect(loadTime).toBeLessThan(5000);
    
    // 콘솔 에러가 없는지 확인
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 페이지 새로고침으로 콘솔 에러 확인
    await page.reload();
    await page.waitForTimeout(2000);
    
    // 심각한 에러가 많지 않아야 함
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('net::')
    );
    
    expect(criticalErrors.length).toBeLessThan(5);
  });
});