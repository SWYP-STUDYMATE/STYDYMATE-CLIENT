import { test, expect } from '@playwright/test';

test.describe('간단한 모바일 UX 확인', () => {
  
  test('로그인 페이지 모바일 접근성', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 페이지 이동
    await page.goto('/');
    
    // 페이지 로드 대기
    await page.waitForTimeout(3000);
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log('페이지 제목:', title);
    
    // HTML 존재 확인
    const html = await page.content();
    expect(html.length).toBeGreaterThan(100);
    
    // 스크롤 너비 확인 (가로 스크롤 방지)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    
    console.log('Body 너비:', bodyWidth);
    console.log('Window 너비:', windowWidth);
    
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 50); // 50px 여유
    
    // 스크린샷 저장
    await page.screenshot({ path: 'test-results/login-page-mobile.png' });
  });

  test('약관 동의 페이지 접근성', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/agreement');
    await page.waitForTimeout(3000);
    
    const title = await page.title();
    console.log('약관 페이지 제목:', title);
    
    // HTML 컨텐츠 확인
    const html = await page.content();
    expect(html.length).toBeGreaterThan(100);
    
    // 스크린샷 저장
    await page.screenshot({ path: 'test-results/agreement-page-mobile.png' });
  });

  test('다양한 모바일 해상도 테스트', async ({ page }) => {
    const devices = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'Galaxy S20', width: 360, height: 800 },
      { name: 'iPad Mini', width: 768, height: 1024 }
    ];

    for (const device of devices) {
      console.log(`\n=== ${device.name} 테스트 ===`);
      
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      // 페이지 로드 확인
      const title = await page.title();
      expect(title).toBeTruthy();
      
      // 가로 스크롤 확인
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = device.width;
      
      console.log(`- 뷰포트: ${viewportWidth}px, Body: ${bodyWidth}px`);
      console.log(`- 가로 스크롤: ${bodyWidth > viewportWidth + 20 ? '있음' : '없음'}`);
      
      // 스크린샷 저장
      await page.screenshot({ 
        path: `test-results/${device.name.replace(' ', '-').toLowerCase()}-screenshot.png`,
        fullPage: true 
      });
      
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 50);
    }
  });

  test('터치 친화적 UI 요소 확인', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // 클릭 가능한 요소들 찾기
    const clickableSelectors = [
      'button', 
      'a', 
      'input[type="submit"]', 
      'input[type="button"]',
      '[role="button"]',
      '.btn'
    ];
    
    let totalClickable = 0;
    let appropriatelySized = 0;
    
    for (const selector of clickableSelectors) {
      const elements = await page.locator(selector).all();
      
      for (const element of elements) {
        try {
          if (await element.isVisible()) {
            totalClickable++;
            
            const box = await element.boundingBox();
            if (box) {
              // 최소 터치 타겟 크기 (44px는 iOS 권장사항)
              const minDimension = Math.min(box.width, box.height);
              if (minDimension >= 32) { // 조금 완화된 기준
                appropriatelySized++;
              }
              
              console.log(`${selector}: ${box.width.toFixed(0)}x${box.height.toFixed(0)}px`);
            }
          }
        } catch (e) {
          // 요소 처리 중 오류 발생 시 무시
        }
      }
    }
    
    console.log(`총 클릭 가능 요소: ${totalClickable}`);
    console.log(`적절한 크기 요소: ${appropriatelySized}`);
    
    // 클릭 가능한 요소가 있으면 대부분이 적절한 크기여야 함
    if (totalClickable > 0) {
      const ratio = appropriatelySized / totalClickable;
      expect(ratio).toBeGreaterThan(0.5); // 50% 이상
    }
  });

  test('폰트 크기 및 가독성', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // 텍스트 요소들의 폰트 크기 확인
    const textSelectors = ['p', 'span', 'div', 'h1', 'h2', 'h3', 'button', 'a'];
    
    let totalTextElements = 0;
    let readableElements = 0;
    
    for (const selector of textSelectors) {
      const elements = await page.locator(selector).all();
      
      for (const element of elements) {
        try {
          if (await element.isVisible()) {
            const text = await element.textContent();
            if (text && text.trim().length > 0) {
              totalTextElements++;
              
              const fontSize = await element.evaluate(el => {
                return parseInt(window.getComputedStyle(el).fontSize);
              });
              
              if (fontSize >= 14) { // 모바일 최소 권장 크기
                readableElements++;
              }
              
              console.log(`${selector}: ${fontSize}px - "${text.slice(0, 30)}..."`);
            }
          }
        } catch (e) {
          // 요소 처리 중 오류 발생 시 무시
        }
      }
    }
    
    console.log(`총 텍스트 요소: ${totalTextElements}`);
    console.log(`읽기 좋은 크기: ${readableElements}`);
    
    if (totalTextElements > 0) {
      const ratio = readableElements / totalTextElements;
      expect(ratio).toBeGreaterThan(0.7); // 70% 이상
    }
  });

  test('로딩 성능 기본 체크', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const startTime = Date.now();
    await page.goto('/');
    
    // 기본 로딩 완료까지의 시간
    const loadTime = Date.now() - startTime;
    console.log(`기본 로드 시간: ${loadTime}ms`);
    
    // DOM 로드 완료 대기
    await page.waitForLoadState('domcontentloaded');
    const domTime = Date.now() - startTime;
    console.log(`DOM 로드 시간: ${domTime}ms`);
    
    // 네트워크 완료 대기
    await page.waitForLoadState('networkidle');
    const networkTime = Date.now() - startTime;
    console.log(`네트워크 완료 시간: ${networkTime}ms`);
    
    // 모바일에서 합리적인 로드 시간인지 확인 (10초 이내)
    expect(networkTime).toBeLessThan(10000);
    
    // 페이지가 실제로 로드되었는지 확인
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});