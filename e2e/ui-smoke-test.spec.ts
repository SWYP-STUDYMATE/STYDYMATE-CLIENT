import { test, expect } from '@playwright/test';

/**
 * 간단한 UI 스모크 테스트
 * Mock API를 활용하여 기본 UI/UX 문제점 빠르게 식별
 */
test.describe('UI 스모크 테스트 - Mock 모드', () => {
  
  test('Mock 모드 기본 기능 확인', async ({ page }) => {
    console.log('🎯 Mock 모드 기본 기능 테스트 시작');
    
    // Mock 모드로 접속
    await page.goto('/?mock=true', { timeout: 10000 });
    
    // Mock 배너가 표시되는지 확인
    try {
      await expect(page.locator('#mock-mode-banner')).toBeVisible({ timeout: 5000 });
      console.log('✅ Mock 배너 표시 확인');
    } catch {
      console.log('⚠️ Mock 배너가 표시되지 않음');
    }
    
    // 메인 페이지로 이동
    await page.goto('/main?mock=true', { timeout: 10000 });
    
    // 페이지 로딩 대기
    await page.waitForTimeout(3000);
    
    // 기본 UI 요소들 확인
    const uiChecks = [
      { selector: '[data-testid="main-container"]', name: '메인 컨테이너' },
      { selector: 'body', name: '페이지 body' },
      { selector: 'nav, [role="navigation"]', name: '네비게이션' },
      { selector: 'button', name: '버튼 요소들' }
    ];
    
    for (const check of uiChecks) {
      try {
        const element = page.locator(check.selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`✅ ${check.name} 확인`);
        } else {
          console.log(`⚠️ ${check.name} 찾을 수 없음`);
        }
      } catch {
        console.log(`⚠️ ${check.name} 에러 발생`);
      }
    }
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'test-results/ui-smoke-test.png',
      fullPage: true 
    });
    
    console.log('✅ Mock 모드 기본 기능 테스트 완료');
  });

  test('UI 레이아웃 기본 확인', async ({ page }) => {
    console.log('🎯 UI 레이아웃 기본 확인 시작');
    
    await page.goto('/main?mock=true', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log('📄 페이지 제목:', title);
    
    // CSS 에러 체크
    const cssErrors = await page.evaluate(() => {
      const errors: any[] = [];
      const allElements = document.querySelectorAll('*');
      
      Array.from(allElements).slice(0, 50).forEach(element => {
        const styles = window.getComputedStyle(element);
        
        // 기본적인 CSS 문제점 체크
        if (styles.fontSize === '0px' && element.textContent) {
          errors.push({
            issue: 'Font size is 0px but has content',
            element: element.tagName,
            content: element.textContent.substring(0, 30)
          });
        }
        
        if (styles.display === 'none' && element.getAttribute('aria-hidden') !== 'true') {
          errors.push({
            issue: 'Hidden element without aria-hidden',
            element: element.tagName,
            id: element.id
          });
        }
      });
      
      return errors;
    });
    
    console.log('🎨 CSS 문제점:', cssErrors.length > 0 ? cssErrors : '문제점 없음');
    
    // 콘솔 에러 확인
    const logs: any[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push({ type: 'error', text: msg.text() });
      }
    });
    
    await page.waitForTimeout(2000);
    
    if (logs.length > 0) {
      console.log('🚨 콘솔 에러들:', logs);
    } else {
      console.log('✅ 콘솔 에러 없음');
    }
    
    console.log('✅ UI 레이아웃 기본 확인 완료');
  });

  test('네비게이션 기능 확인', async ({ page }) => {
    console.log('🎯 네비게이션 기능 확인 시작');
    
    await page.goto('/main?mock=true', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // 현재 URL 확인
    const currentUrl = page.url();
    console.log('🌐 현재 URL:', currentUrl);
    
    // 네비게이션 요소들 찾기
    const navElements = await page.locator('a, button[onclick], [data-testid*="nav"], [data-testid*="menu"]').all();
    console.log('🧭 네비게이션 요소 개수:', navElements.length);
    
    // 클릭 가능한 요소들 확인
    let clickableCount = 0;
    for (const element of navElements.slice(0, 10)) { // 처음 10개만 확인
      try {
        if (await element.isVisible({ timeout: 1000 })) {
          const text = await element.textContent();
          const href = await element.getAttribute('href');
          const testId = await element.getAttribute('data-testid');
          
          console.log(`🔗 클릭 가능 요소: ${text?.substring(0, 30) || href || testId || 'Unknown'}`);
          clickableCount++;
        }
      } catch {
        // 무시
      }
    }
    
    console.log(`✅ 총 ${clickableCount}개의 클릭 가능한 요소 확인`);
    
    // 간단한 네비게이션 테스트
    try {
      // 매칭 페이지로 이동 시도
      const matchingLink = page.locator('a[href*="matching"], button[data-testid*="matching"], [data-testid*="matching-nav"]').first();
      if (await matchingLink.isVisible({ timeout: 2000 })) {
        await matchingLink.click();
        await page.waitForTimeout(1000);
        const newUrl = page.url();
        console.log('🎯 매칭 페이지 이동:', newUrl);
      }
    } catch {
      console.log('⚠️ 매칭 페이지 네비게이션 실패');
    }
    
    console.log('✅ 네비게이션 기능 확인 완료');
  });

  test('반응형 디자인 빠른 체크', async ({ page }) => {
    console.log('🎯 반응형 디자인 빠른 체크 시작');
    
    await page.goto('/main?mock=true', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Desktop', width: 1200, height: 800 }
    ];
    
    for (const viewport of viewports) {
      console.log(`📱 ${viewport.name} 뷰포트 테스트`);
      
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      
      // 기본 레이아웃 확인
      const bodyWidth = await page.evaluate(() => document.body.offsetWidth);
      console.log(`📏 Body 너비: ${bodyWidth}px`);
      
      // 오버플로우 확인
      const overflowElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const overflowing: any[] = [];
        
        Array.from(elements).slice(0, 30).forEach(el => {
          if (el.scrollWidth > el.clientWidth) {
            overflowing.push({
              tag: el.tagName,
              id: el.id,
              scrollWidth: el.scrollWidth,
              clientWidth: el.clientWidth
            });
          }
        });
        
        return overflowing;
      });
      
      if (overflowElements.length > 0) {
        console.log(`⚠️ ${viewport.name}에서 오버플로우 요소:`, overflowElements.slice(0, 3));
      } else {
        console.log(`✅ ${viewport.name} 오버플로우 없음`);
      }
      
      // 스크린샷
      await page.screenshot({ 
        path: `test-results/responsive-${viewport.name.toLowerCase()}.png`
      });
    }
    
    console.log('✅ 반응형 디자인 빠른 체크 완료');
  });

  test('Mock API 응답 확인', async ({ page }) => {
    console.log('🎯 Mock API 응답 확인 시작');
    
    // 네트워크 요청 감시
    const networkRequests: any[] = [];
    page.on('response', response => {
      networkRequests.push({
        url: response.url(),
        status: response.status(),
        contentType: response.headers()['content-type']
      });
    });
    
    await page.goto('/main?mock=true', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    console.log('🌐 네트워크 요청 수:', networkRequests.length);
    
    // API 요청들 필터링
    const apiRequests = networkRequests.filter(req => 
      req.url.includes('/api/') || req.url.includes('mock')
    );
    
    console.log('🔌 API 요청들:');
    apiRequests.slice(0, 5).forEach(req => {
      console.log(`  - ${req.status} ${req.url.split('/').pop()}`);
    });
    
    // Mock 모드 활성화 확인
    const mockModeActive = await page.evaluate(() => {
      return window.location.search.includes('mock=true') || 
             localStorage.getItem('mockCurrentUser') !== null ||
             document.querySelector('#mock-mode-banner') !== null;
    });
    
    console.log('🎭 Mock 모드 활성:', mockModeActive);
    
    // Mock 사용자 데이터 확인
    const mockUserData = await page.evaluate(() => {
      const currentUser = localStorage.getItem('mockCurrentUser');
      return {
        currentUser,
        hasAccessToken: !!localStorage.getItem('accessToken'),
        mockBannerVisible: !!document.querySelector('#mock-mode-banner')
      };
    });
    
    console.log('👤 Mock 사용자 데이터:', mockUserData);
    
    console.log('✅ Mock API 응답 확인 완료');
  });

  test('전반적인 사용자 경험 체크', async ({ page }) => {
    console.log('🎯 전반적인 사용자 경험 체크 시작');
    
    const startTime = Date.now();
    await page.goto('/main?mock=true', { timeout: 15000 });
    
    // 로딩 시간 측정
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ 페이지 로딩 시간: ${loadTime}ms`);
    
    // 상호작용 가능한 요소들 확인
    const interactiveElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('button, a, input, select, textarea, [onclick], [role="button"]');
      return {
        total: elements.length,
        visible: Array.from(elements).filter(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        }).length
      };
    });
    
    console.log(`🎮 상호작용 요소: 총 ${interactiveElements.total}개, 보이는 것 ${interactiveElements.visible}개`);
    
    // 이미지 로딩 상태 확인
    const imageStats = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      let loaded = 0, failed = 0;
      
      Array.from(images).forEach(img => {
        if (img.complete && img.naturalWidth > 0) {
          loaded++;
        } else if (img.complete && img.naturalWidth === 0) {
          failed++;
        }
      });
      
      return { total: images.length, loaded, failed };
    });
    
    console.log(`🖼️ 이미지 로딩: 총 ${imageStats.total}개, 로딩됨 ${imageStats.loaded}개, 실패 ${imageStats.failed}개`);
    
    // 텍스트 내용 품질 확인
    const textQuality = await page.evaluate(() => {
      const textElements = document.querySelectorAll('h1, h2, h3, p, span, div');
      let emptyElements = 0;
      let koreanTextCount = 0;
      let englishTextCount = 0;
      
      Array.from(textElements).forEach(el => {
        const text = el.textContent?.trim();
        if (!text) {
          emptyElements++;
        } else if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text)) {
          koreanTextCount++;
        } else if (/[a-zA-Z]/.test(text)) {
          englishTextCount++;
        }
      });
      
      return { 
        empty: emptyElements, 
        korean: koreanTextCount, 
        english: englishTextCount,
        total: textElements.length 
      };
    });
    
    console.log('📝 텍스트 품질:', textQuality);
    
    // 전반적인 평가
    const overallScore = {
      loading: loadTime < 5000 ? '✅' : '⚠️',
      interactivity: interactiveElements.visible > 0 ? '✅' : '⚠️',
      images: imageStats.failed === 0 ? '✅' : '⚠️',
      content: textQuality.korean > 0 || textQuality.english > 0 ? '✅' : '⚠️'
    };
    
    console.log('🎯 전반적인 평가:', overallScore);
    
    console.log('✅ 전반적인 사용자 경험 체크 완료');
  });
});