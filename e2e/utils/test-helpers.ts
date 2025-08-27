import { Page, expect } from '@playwright/test';
import { testUsers, waitTimes } from '../fixtures/test-data';

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * 모킹된 Naver OAuth 로그인 수행
   */
  async mockNaverLogin(user = testUsers.validUser) {
    // 네이버 로그인 버튼 클릭
    await this.page.click('[data-testid="naver-login-button"]');
    
    // OAuth 콜백 URL로 리다이렉트 모킹
    await this.page.route('**/login/oauth2/code/naver**', async (route) => {
      await route.fulfill({
        status: 302,
        headers: {
          'Location': '/agreement'
        }
      });
    });
    
    // API 응답 모킹
    await this.page.route('**/api/v1/auth/**', async (route) => {
      const url = route.request().url();
      
      if (url.includes('/refresh')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              accessToken: 'mock-access-token',
              refreshToken: 'mock-refresh-token'
            }
          })
        });
      } else if (url.includes('/logout')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Successfully logged out'
          })
        });
      }
    });

    // 사용자 정보 API 모킹
    await this.page.route('**/api/v1/users/profile**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: user
        })
      });
    });
  }

  /**
   * 약관 동의 처리
   */
  async agreeToTerms() {
    await this.page.waitForSelector('[data-testid="agreement-checkbox"]');
    await this.page.check('[data-testid="agreement-checkbox"]');
    await this.page.click('[data-testid="agree-button"]');
  }

  /**
   * 온보딩 완료 상태 모킹
   */
  async mockOnboardingComplete() {
    await this.page.route('**/api/v1/onboarding/status**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            isCompleted: true,
            currentStep: 4,
            completedSteps: [1, 2, 3, 4],
            totalSteps: 4
          }
        })
      });
    });
  }

  /**
   * 온보딩 미완료 상태 모킹
   */
  async mockOnboardingIncomplete(currentStep = 1) {
    await this.page.route('**/api/v1/onboarding/status**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            isCompleted: false,
            currentStep,
            completedSteps: Array.from({ length: currentStep - 1 }, (_, i) => i + 1),
            totalSteps: 4
          }
        })
      });
    });
  }

  /**
   * 매칭 파트너 목록 모킹
   */
  async mockMatchingPartners() {
    await this.page.route('**/api/v1/matching/partners**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            partners: [
              {
                id: 2,
                englishName: 'Sarah Kim',
                profileImage: 'https://api.languagemate.kr/uploads/profiles/2.jpg',
                location: 'Seoul, South Korea',
                nativeLanguage: 'English',
                learningLanguage: 'Korean',
                languageLevel: 'BEGINNER',
                matchScore: 85,
                commonInterests: ['Movies', 'Travel', 'Technology']
              },
              {
                id: 3,
                englishName: 'John Smith',
                profileImage: 'https://api.languagemate.kr/uploads/profiles/3.jpg',
                location: 'Busan, South Korea',
                nativeLanguage: 'English',
                learningLanguage: 'Korean',
                languageLevel: 'INTERMEDIATE',
                matchScore: 78,
                commonInterests: ['Music', 'Sports', 'Travel']
              }
            ],
            totalElements: 2,
            totalPages: 1,
            currentPage: 0
          }
        })
      });
    });
  }

  /**
   * 채팅방 목록 모킹
   */
  async mockChatRooms() {
    await this.page.route('**/api/v1/chat/rooms**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            rooms: [
              {
                id: 456,
                name: 'Sarah Kim',
                type: 'DIRECT',
                participants: [
                  {
                    id: 1,
                    name: '테스트사용자',
                    profileImage: 'https://api.languagemate.kr/uploads/profiles/1.jpg'
                  },
                  {
                    id: 2,
                    name: 'Sarah Kim',
                    profileImage: 'https://api.languagemate.kr/uploads/profiles/2.jpg'
                  }
                ],
                lastMessage: {
                  content: 'Nice to meet you!',
                  createdAt: new Date().toISOString(),
                  senderName: 'Sarah Kim'
                },
                unreadCount: 2,
                updatedAt: new Date().toISOString()
              }
            ],
            totalElements: 1,
            currentPage: 0
          }
        })
      });
    });
  }

  /**
   * 채팅 메시지 목록 모킹
   */
  async mockChatMessages(roomId: number) {
    await this.page.route(`**/api/v1/chat/rooms/${roomId}/messages**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            messages: [
              {
                id: 1001,
                content: 'Hello! Nice to meet you.',
                messageType: 'TEXT',
                senderId: 2,
                senderName: 'Sarah Kim',
                createdAt: new Date(Date.now() - 60000).toISOString(),
                readAt: new Date().toISOString()
              },
              {
                id: 1002,
                content: 'Hello! Nice to meet you too!',
                messageType: 'TEXT',
                senderId: 1,
                senderName: '테스트사용자',
                createdAt: new Date(Date.now() - 30000).toISOString(),
                readAt: null
              }
            ],
            totalElements: 2,
            currentPage: 0
          }
        })
      });
    });
  }

  /**
   * WebSocket 연결 모킹
   */
  async mockWebSocket() {
    await this.page.addInitScript(() => {
      // SockJS 모킹
      (window as any).SockJS = class MockSockJS {
        readyState = 1; // OPEN
        onopen: any;
        onmessage: any;
        onclose: any;
        onerror: any;

        constructor(url: string) {
          setTimeout(() => {
            if (this.onopen) this.onopen();
          }, 100);
        }

        send(data: string) {
          console.log('Mock WebSocket send:', data);
          // 메시지 전송 응답 모킹
          setTimeout(() => {
            if (this.onmessage) {
              this.onmessage({
                data: JSON.stringify({
                  type: 'CHAT_MESSAGE',
                  data: {
                    messageId: Date.now(),
                    roomId: 456,
                    senderId: 1,
                    senderName: '테스트사용자',
                    content: JSON.parse(data).content,
                    messageType: 'TEXT',
                    createdAt: new Date().toISOString()
                  }
                })
              });
            }
          }, 100);
        }

        close() {
          if (this.onclose) this.onclose();
        }
      };

      // Stomp 모킹
      (window as any).Stomp = {
        over: () => ({
          connect: (headers: any, successCallback: any) => {
            setTimeout(successCallback, 100);
          },
          subscribe: (destination: string, callback: any) => {
            console.log('Mock STOMP subscribe:', destination);
          },
          send: (destination: string, headers: any, body: string) => {
            console.log('Mock STOMP send:', destination, body);
          },
          disconnect: () => {
            console.log('Mock STOMP disconnect');
          }
        })
      };
    });
  }

  /**
   * 로딩 상태 대기
   */
  async waitForLoading(selector = '[data-testid="loading"]') {
    try {
      await this.page.waitForSelector(selector, { timeout: waitTimes.short });
      await this.page.waitForSelector(selector, { state: 'detached', timeout: waitTimes.api });
    } catch {
      // 로딩이 이미 완료된 경우 무시
    }
  }

  /**
   * 페이지 네비게이션 대기
   */
  async waitForNavigation(url?: string) {
    if (url) {
      await this.page.waitForURL(url, { timeout: waitTimes.navigation });
    } else {
      await this.page.waitForLoadState('networkidle', { timeout: waitTimes.navigation });
    }
  }

  /**
   * API 요청 대기
   */
  async waitForApiCall(urlPattern: string) {
    return this.page.waitForResponse(response => 
      response.url().includes(urlPattern) && response.status() === 200,
      { timeout: waitTimes.api }
    );
  }

  /**
   * 에러 메시지 확인
   */
  async expectErrorMessage(message: string) {
    await expect(this.page.locator('[data-testid="error-message"]')).toContainText(message);
  }

  /**
   * 성공 메시지 확인
   */
  async expectSuccessMessage(message: string) {
    await expect(this.page.locator('[data-testid="success-message"]')).toContainText(message);
  }

  /**
   * 모바일 뷰포트 설정
   */
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  /**
   * 데스크톱 뷰포트 설정
   */
  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1200, height: 800 });
  }

  /**
   * 스크린샷 촬영
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }

  /**
   * 페이지 성능 측정
   */
  async measurePerformance() {
    const performanceMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });

    return performanceMetrics;
  }
}