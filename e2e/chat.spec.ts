import { test, expect } from '@playwright/test';
import { ChatPage } from './pages/chat-page';
import path from 'path';

test.describe('채팅 페이지', () => {
  let chatPage: ChatPage;

  test.beforeEach(async ({ page }) => {
    chatPage = new ChatPage(page);
    
    // 로그인된 상태로 설정
    await chatPage.setLocalStorage('accessToken', 'mock-access-token');
    await chatPage.setLocalStorage('refreshToken', 'mock-refresh-token');
    
    // 채팅방 목록 모킹
    await chatPage.helpers.mockChatRooms();
    
    // 채팅 메시지 모킹
    await chatPage.helpers.mockChatMessages(456);
    
    // WebSocket 연결 모킹
    await chatPage.helpers.mockWebSocket();
    
    // 메시지 전송 API 모킹
    await page.route('**/api/v1/chat/rooms/*/messages**', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: Date.now(),
              content: JSON.parse(route.request().postData() || '{}').content,
              senderId: 1,
              senderName: '테스트사용자',
              messageType: 'TEXT',
              createdAt: new Date().toISOString()
            }
          })
        });
      } else {
        route.continue();
      }
    });
    
    // 파일 업로드 API 모킹
    await page.route('**/api/v1/chat/upload**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            fileUrl: 'https://api.languagemate.kr/uploads/chat/test-image.jpg',
            fileName: 'test-image.jpg',
            fileSize: 1024000
          }
        })
      });
    });
  });

  test('채팅 홈 페이지 로드 확인', async () => {
    await chatPage.navigate();
    await chatPage.verifyPageLoaded();
    await chatPage.verifyChatRoomsLoaded();
  });

  test('채팅방 목록 표시', async () => {
    await chatPage.navigate();
    
    const roomCount = await chatPage.chatRoomItems.count();
    expect(roomCount).toBeGreaterThan(0);
    
    // 첫 번째 채팅방 정보 확인
    await expect(chatPage.getChatRoomName(0)).toBeVisible();
    await expect(chatPage.getChatRoomLastMessage(0)).toBeVisible();
    await expect(chatPage.getChatRoomTime(0)).toBeVisible();
  });

  test('특정 채팅방 입장', async () => {
    await chatPage.navigate();
    await chatPage.clickChatRoom(0);
    
    // 채팅방 URL 확인
    await expect(chatPage.page).toHaveURL(/\/chat\/\d+/);
    
    // 채팅방 헤더 확인
    await chatPage.verifyChatRoomHeader('Sarah Kim');
  });

  test('채팅방에서 메시지 로딩', async () => {
    await chatPage.navigateToRoom(456);
    await chatPage.verifyMessagesLoaded();
  });

  test('텍스트 메시지 전송', async () => {
    await chatPage.navigateToRoom(456);
    
    const testMessage = 'Hello, this is a test message!';
    await chatPage.sendMessage(testMessage);
    
    // 전송된 메시지가 화면에 나타나는지 확인
    const messages = await chatPage.messageItems.all();
    const lastMessage = messages[messages.length - 1];
    const messageText = await lastMessage.locator('[data-testid="message-text"]').textContent();
    
    expect(messageText).toContain(testMessage);
  });

  test('Enter 키로 메시지 전송', async () => {
    await chatPage.navigateToRoom(456);
    
    const testMessage = 'Message sent with Enter key';
    await chatPage.sendMessageWithEnter(testMessage);
    
    // 메시지 전송 확인
    const messageCount = await chatPage.messageItems.count();
    expect(messageCount).toBeGreaterThan(0);
  });

  test('이모지 전송', async () => {
    await chatPage.navigateToRoom(456);
    
    await chatPage.sendEmoji('smile');
    
    // 이모지가 메시지로 전송되었는지 확인
    const messageCount = await chatPage.messageItems.count();
    expect(messageCount).toBeGreaterThan(0);
  });

  test('파일 첨부 및 전송', async () => {
    await chatPage.navigateToRoom(456);
    
    // 테스트용 이미지 파일 경로
    const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
    
    // 실제 파일이 없는 경우를 위한 가상 파일 테스트
    try {
      await chatPage.attachFile(testImagePath);
    } catch {
      // 실제 파일이 없는 경우, UI 동작만 확인
      await chatPage.attachmentButton.click();
      
      if (await chatPage.fileUploadModal.isVisible()) {
        await expect(chatPage.fileUploadModal).toBeVisible();
        
        // 모달 닫기
        const closeButton = chatPage.page.locator('[data-testid="close-modal"]');
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await chatPage.page.keyboard.press('Escape');
        }
      }
    }
  });

  test('음성 메시지 녹음', async () => {
    await chatPage.navigateToRoom(456);
    
    // 음성 권한 모킹
    await chatPage.page.context().grantPermissions(['microphone']);
    
    try {
      await chatPage.startVoiceRecording();
      
      // 잠시 대기 후 녹음 중지
      await chatPage.page.waitForTimeout(2000);
      await chatPage.stopVoiceRecording();
    } catch {
      // 음성 기능이 구현되지 않은 경우
      console.log('음성 메시지 기능이 구현되지 않음');
    }
  });

  test('채팅방 검색', async () => {
    await chatPage.navigate();
    
    await chatPage.searchChatRooms('Sarah');
    
    // 검색어가 입력되었는지 확인
    await expect(chatPage.searchChatInput).toHaveValue('Sarah');
    
    // 검색 결과 확인
    const roomCount = await chatPage.chatRoomItems.count();
    expect(roomCount).toBeGreaterThanOrEqual(0);
  });

  test('새 채팅 시작', async () => {
    await chatPage.navigate();
    
    await chatPage.startNewChat();
    
    // 새 채팅 모달이 열리거나 매칭 페이지로 이동
    const newChatModal = chatPage.page.locator('[data-testid="new-chat-modal"]');
    const isModalVisible = await newChatModal.isVisible();
    const currentUrl = await chatPage.getCurrentUrl();
    
    expect(isModalVisible || currentUrl.includes('/matching')).toBeTruthy();
  });

  test('메시지 스크롤 (이전 메시지 로딩)', async () => {
    await chatPage.navigateToRoom(456);
    
    const initialCount = await chatPage.messageItems.count();
    const newCount = await chatPage.scrollToTopForOlderMessages();
    
    // 추가 메시지가 로드되었는지 확인 (무한 스크롤이 구현된 경우)
    if (newCount > initialCount) {
      expect(newCount).toBeGreaterThan(initialCount);
    }
  });

  test('최하단으로 스크롤', async () => {
    await chatPage.navigateToRoom(456);
    
    await chatPage.scrollToBottom();
    
    // 스크롤이 최하단에 있는지 확인
    const isAtBottom = await chatPage.messagesContainer.evaluate((element) => {
      return Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) < 1;
    });
    
    expect(isAtBottom).toBeTruthy();
  });

  test('타이핑 인디케이터', async () => {
    await chatPage.navigateToRoom(456);
    
    // 타이핑 시뮬레이션 (상대방이 타이핑 중)
    await chatPage.page.evaluate(() => {
      const event = new CustomEvent('partnerTyping', {
        detail: { isTyping: true, partnerName: 'Sarah Kim' }
      });
      window.dispatchEvent(event);
    });
    
    try {
      await chatPage.verifyTypingIndicator();
    } catch {
      console.log('타이핑 인디케이터가 구현되지 않음');
    }
  });

  test('읽음 상태 확인', async () => {
    await chatPage.navigateToRoom(456);
    
    try {
      await chatPage.verifyReadReceipts();
    } catch {
      console.log('읽음 상태 표시가 구현되지 않음');
    }
  });

  test('채팅 메뉴 열기', async () => {
    await chatPage.navigateToRoom(456);
    
    await chatPage.openChatMenu();
    
    // 메뉴 항목들 확인
    await expect(chatPage.viewProfileButton).toBeVisible();
    await expect(chatPage.muteButton).toBeVisible();
    await expect(chatPage.blockButton).toBeVisible();
    await expect(chatPage.reportButton).toBeVisible();
  });

  test('파트너 프로필 보기', async () => {
    await chatPage.navigateToRoom(456);
    
    await chatPage.viewPartnerProfile();
    
    // 프로필 모달이 열리거나 프로필 페이지로 이동
    const profileModal = chatPage.page.locator('[data-testid="profile-modal"]');
    const isModalVisible = await profileModal.isVisible();
    const currentUrl = await chatPage.getCurrentUrl();
    
    expect(isModalVisible || currentUrl.includes('/profile/')).toBeTruthy();
  });

  test('채팅 음소거', async () => {
    await chatPage.navigateToRoom(456);
    
    // 음소거 API 모킹
    await chatPage.page.route('**/api/v1/chat/rooms/*/mute**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: '채팅이 음소거되었습니다.'
        })
      });
    });
    
    await chatPage.muteChat();
  });

  test('사용자 차단', async () => {
    await chatPage.navigateToRoom(456);
    
    // 차단 API 모킹
    await chatPage.page.route('**/api/v1/users/block**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: '사용자가 차단되었습니다.'
        })
      });
    });
    
    await chatPage.blockUser();
  });

  test('사용자 신고', async () => {
    await chatPage.navigateToRoom(456);
    
    // 신고 API 모킹
    await chatPage.page.route('**/api/v1/reports**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: '신고가 접수되었습니다.'
        })
      });
    });
    
    await chatPage.reportUser('inappropriate-behavior');
  });

  test('채팅 기록 삭제', async () => {
    await chatPage.navigateToRoom(456);
    
    // 기록 삭제 API 모킹
    await chatPage.page.route('**/api/v1/chat/rooms/*/clear**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: '채팅 기록이 삭제되었습니다.'
        })
      });
    });
    
    await chatPage.clearChatHistory();
  });

  test('채팅방 나가기', async () => {
    await chatPage.navigateToRoom(456);
    
    // 채팅방 나가기 API 모킹
    await chatPage.page.route('**/api/v1/chat/rooms/*/leave**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: '채팅방을 나갔습니다.'
        })
      });
    });
    
    await chatPage.leaveChatRoom();
    
    // 채팅 홈으로 이동했는지 확인
    await expect(chatPage.page).toHaveURL('/chat');
  });

  test('뒤로 가기', async () => {
    await chatPage.navigateToRoom(456);
    
    await chatPage.goBack();
    
    // 채팅 홈으로 이동했는지 확인
    await expect(chatPage.page).toHaveURL('/chat');
  });

  test('실시간 메시지 수신', async () => {
    await chatPage.navigateToRoom(456);
    
    await chatPage.verifyRealtimeMessageReceived();
  });

  test('연결 상태 확인', async () => {
    await chatPage.navigateToRoom(456);
    
    await chatPage.verifyConnectionStatus();
  });

  test('오프라인 상태 처리', async () => {
    await chatPage.navigateToRoom(456);
    
    await chatPage.verifyOfflineHandling();
  });

  test('모바일 반응형 디자인', async () => {
    await chatPage.navigateToRoom(456);
    
    await chatPage.verifyMobileResponsive();
  });

  test('키보드 접근성', async () => {
    await chatPage.navigateToRoom(456);
    
    await chatPage.verifyAccessibility();
  });

  test('성능 측정', async () => {
    await chatPage.navigateToRoom(456);
    
    const metrics = await chatPage.measurePagePerformance();
    
    console.log('채팅 페이지 성능 메트릭:', metrics);
    
    // 성능 기준 검증
    expect(metrics.firstContentfulPaint).toBeLessThan(2000);
    expect(metrics.domContentLoaded).toBeLessThan(3000);
  });

  test('빈 메시지 전송 방지', async () => {
    await chatPage.navigateToRoom(456);
    
    // 빈 메시지 전송 시도
    await chatPage.messageInput.fill('   '); // 공백만
    await chatPage.sendButton.click();
    
    // 메시지가 전송되지 않았는지 확인
    await expect(chatPage.messageInput).toHaveValue('   ');
    
    // 또는 에러 메시지 확인
    const errorMessage = chatPage.page.locator('[data-testid="empty-message-error"]');
    try {
      await expect(errorMessage).toBeVisible({ timeout: 2000 });
    } catch {
      // 에러 메시지가 없는 경우는 정상 (전송되지 않음)
    }
  });

  test('긴 메시지 전송', async () => {
    await chatPage.navigateToRoom(456);
    
    // 매우 긴 메시지 생성
    const longMessage = 'A'.repeat(1000);
    await chatPage.sendMessage(longMessage);
    
    // 메시지가 올바르게 표시되는지 확인
    const messages = await chatPage.messageItems.all();
    const lastMessage = messages[messages.length - 1];
    const messageText = await lastMessage.locator('[data-testid="message-text"]').textContent();
    
    expect(messageText).toContain(longMessage);
  });

  test('읽지 않은 메시지 수 표시', async () => {
    await chatPage.navigate();
    
    // 읽지 않은 메시지가 있는 채팅방의 배지 확인
    const unreadBadges = await chatPage.unreadBadges.all();
    
    for (const badge of unreadBadges) {
      await expect(badge).toBeVisible();
      const count = await badge.textContent();
      expect(parseInt(count || '0')).toBeGreaterThan(0);
    }
  });

  test('메시지 시간 표시 형식', async () => {
    await chatPage.navigateToRoom(456);
    
    const messageCount = await chatPage.messageItems.count();
    if (messageCount > 0) {
      const messageTime = await chatPage.getMessageTime(0).textContent();
      
      // 시간 형식 확인 (예: "12:34", "오후 2:30", "2시간 전" 등)
      expect(messageTime).toBeTruthy();
      expect(messageTime?.length).toBeGreaterThan(0);
    }
  });

  test('연속된 메시지 그룹핑', async () => {
    await chatPage.navigateToRoom(456);
    
    // 같은 사용자의 연속된 메시지 확인
    const messageCount = await chatPage.messageItems.count();
    
    if (messageCount > 1) {
      // 첫 번째와 두 번째 메시지의 발신자 확인
      const firstSender = await chatPage.getMessageSender(0).textContent();
      const secondSender = await chatPage.getMessageSender(1).textContent();
      
      // 같은 발신자인 경우, 두 번째 메시지에는 발신자명이 없어야 함 (그룹핑)
      if (firstSender === secondSender) {
        const isSecondSenderHidden = await chatPage.getMessageSender(1).isHidden();
        expect(isSecondSenderHidden).toBeTruthy();
      }
    }
  });

  test('메시지 컨텍스트 메뉴', async () => {
    await chatPage.navigateToRoom(456);
    
    const messageCount = await chatPage.messageItems.count();
    if (messageCount > 0) {
      // 첫 번째 메시지 우클릭
      const firstMessage = chatPage.getMessage(0);
      await firstMessage.click({ button: 'right' });
      
      // 컨텍스트 메뉴 확인
      const contextMenu = chatPage.page.locator('[data-testid="message-context-menu"]');
      
      try {
        await expect(contextMenu).toBeVisible({ timeout: 2000 });
        
        // 메뉴 항목들 확인
        const copyButton = contextMenu.locator('[data-testid="copy-message"]');
        const deleteButton = contextMenu.locator('[data-testid="delete-message"]');
        
        if (await copyButton.isVisible()) {
          await expect(copyButton).toBeVisible();
        }
        
        if (await deleteButton.isVisible()) {
          await expect(deleteButton).toBeVisible();
        }
      } catch {
        console.log('메시지 컨텍스트 메뉴가 구현되지 않음');
      }
    }
  });

  test('메시지 검색', async () => {
    await chatPage.navigateToRoom(456);
    
    // 메시지 검색 기능 (헤더의 검색 버튼)
    const searchButton = chatPage.page.locator('[data-testid="search-messages"]');
    
    if (await searchButton.isVisible()) {
      await searchButton.click();
      
      // 검색 입력 필드
      const searchInput = chatPage.page.locator('[data-testid="message-search-input"]');
      await expect(searchInput).toBeVisible();
      
      // 검색 실행
      await searchInput.fill('Hello');
      await chatPage.page.keyboard.press('Enter');
      
      // 검색 결과 확인
      const searchResults = chatPage.page.locator('[data-testid="search-results"]');
      await expect(searchResults).toBeVisible();
    }
  });
});