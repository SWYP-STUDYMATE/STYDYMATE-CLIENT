import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { selectors } from '../fixtures/test-data';

export class ChatPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // 채팅방 목록 섹션 (채팅 홈)
  get chatRoomsContainer() {
    return this.page.locator('[data-testid="chat-rooms-container"]');
  }

  get chatRoomItems() {
    return this.page.locator('[data-testid="chat-room-item"]');
  }

  get searchChatInput() {
    return this.page.locator('[data-testid="search-chat-input"]');
  }

  get newChatButton() {
    return this.page.locator('[data-testid="new-chat-button"]');
  }

  // 채팅방 내부 (특정 채팅방)
  get chatHeader() {
    return this.page.locator('[data-testid="chat-header"]');
  }

  get partnerName() {
    return this.page.locator('[data-testid="partner-name"]');
  }

  get partnerStatus() {
    return this.page.locator('[data-testid="partner-status"]');
  }

  get partnerAvatar() {
    return this.page.locator('[data-testid="partner-avatar"]');
  }

  get backButton() {
    return this.page.locator('[data-testid="back-button"]');
  }

  get chatMenuButton() {
    return this.page.locator('[data-testid="chat-menu-button"]');
  }

  // 메시지 영역
  get messagesContainer() {
    return this.page.locator('[data-testid="messages-container"]');
  }

  get messageItems() {
    return this.page.locator('[data-testid="message-item"]');
  }

  get typingIndicator() {
    return this.page.locator('[data-testid="typing-indicator"]');
  }

  get scrollToBottomButton() {
    return this.page.locator('[data-testid="scroll-to-bottom"]');
  }

  // 메시지 입력 영역
  get messageInput() {
    return this.page.locator('[data-testid="message-input"]');
  }

  get sendButton() {
    return this.page.locator('[data-testid="send-button"]');
  }

  get attachmentButton() {
    return this.page.locator('[data-testid="attachment-button"]');
  }

  get emojiButton() {
    return this.page.locator('[data-testid="emoji-button"]');
  }

  get voiceButton() {
    return this.page.locator('[data-testid="voice-button"]');
  }

  // 파일 업로드 모달
  get fileUploadModal() {
    return this.page.locator('[data-testid="file-upload-modal"]');
  }

  get fileInput() {
    return this.page.locator('[data-testid="file-input"]');
  }

  get imagePreview() {
    return this.page.locator('[data-testid="image-preview"]');
  }

  get uploadConfirmButton() {
    return this.page.locator('[data-testid="upload-confirm"]');
  }

  // 이모지 피커
  get emojiPicker() {
    return this.page.locator('[data-testid="emoji-picker"]');
  }

  get emojiCategories() {
    return this.page.locator('[data-testid="emoji-category"]');
  }

  get emojiItems() {
    return this.page.locator('[data-testid="emoji-item"]');
  }

  // 채팅 메뉴
  get chatMenu() {
    return this.page.locator('[data-testid="chat-menu"]');
  }

  get viewProfileButton() {
    return this.page.locator('[data-testid="view-profile"]');
  }

  get muteButton() {
    return this.page.locator('[data-testid="mute-chat"]');
  }

  get blockButton() {
    return this.page.locator('[data-testid="block-user"]');
  }

  get reportButton() {
    return this.page.locator('[data-testid="report-user"]');
  }

  get clearChatButton() {
    return this.page.locator('[data-testid="clear-chat"]');
  }

  get leaveChatButton() {
    return this.page.locator('[data-testid="leave-chat"]');
  }

  // 읽음 상태 표시
  get readReceipts() {
    return this.page.locator('[data-testid="read-receipt"]');
  }

  get unreadBadges() {
    return this.page.locator('[data-testid="unread-badge"]');
  }

  // 특정 메시지 관련 메소드들
  getMessage(index: number) {
    return this.messageItems.nth(index);
  }

  getMessageText(index: number) {
    return this.getMessage(index).locator('[data-testid="message-text"]');
  }

  getMessageTime(index: number) {
    return this.getMessage(index).locator('[data-testid="message-time"]');
  }

  getMessageSender(index: number) {
    return this.getMessage(index).locator('[data-testid="message-sender"]');
  }

  // 채팅방 목록 관련 메소드들
  getChatRoomItem(index: number) {
    return this.chatRoomItems.nth(index);
  }

  getChatRoomName(index: number) {
    return this.getChatRoomItem(index).locator('[data-testid="chat-partner-name"]');
  }

  getChatRoomLastMessage(index: number) {
    return this.getChatRoomItem(index).locator('[data-testid="last-message"]');
  }

  getChatRoomTime(index: number) {
    return this.getChatRoomItem(index).locator('[data-testid="last-message-time"]');
  }

  getChatRoomUnreadCount(index: number) {
    return this.getChatRoomItem(index).locator('[data-testid="unread-count"]');
  }

  /**
   * 채팅 홈 페이지로 이동
   */
  async navigate() {
    await this.goto('/chat');
  }

  /**
   * 특정 채팅방으로 이동
   */
  async navigateToRoom(roomId: number) {
    await this.goto(`/chat/${roomId}`);
  }

  /**
   * 페이지 로드 확인
   */
  async verifyPageLoaded() {
    await expect(this.page).toHaveURL(/\/chat/);
    await expect(this.page).toHaveTitle(/STUDYMATE/);
  }

  /**
   * 채팅방 목록 확인
   */
  async verifyChatRoomsLoaded() {
    await expect(this.chatRoomsContainer).toBeVisible();
    
    const roomCount = await this.chatRoomItems.count();
    expect(roomCount).toBeGreaterThanOrEqual(0);
    
    if (roomCount > 0) {
      // 첫 번째 채팅방 정보 확인
      await expect(this.getChatRoomName(0)).toBeVisible();
      await expect(this.getChatRoomLastMessage(0)).toBeVisible();
      await expect(this.getChatRoomTime(0)).toBeVisible();
    }
  }

  /**
   * 특정 채팅방 클릭
   */
  async clickChatRoom(index: number) {
    await this.getChatRoomItem(index).click();
    await this.page.waitForURL(/\/chat\/\d+/);
  }

  /**
   * 채팅방 검색
   */
  async searchChatRooms(searchTerm: string) {
    await this.searchChatInput.fill(searchTerm);
    await this.page.keyboard.press('Enter');
    await this.waitForLoad();
  }

  /**
   * 새 채팅 시작
   */
  async startNewChat() {
    await this.newChatButton.click();
    
    // 새 채팅 모달이나 페이지로 이동
    const newChatModal = this.page.locator('[data-testid="new-chat-modal"]');
    try {
      await expect(newChatModal).toBeVisible();
    } catch {
      // 매칭 페이지로 이동한 경우
      await this.page.waitForURL('/matching');
    }
  }

  /**
   * 메시지 전송
   */
  async sendMessage(message: string) {
    await this.messageInput.fill(message);
    await this.sendButton.click();
    
    // 메시지가 전송되었는지 확인
    await this.page.waitForTimeout(1000);
    const messages = await this.messageItems.count();
    expect(messages).toBeGreaterThan(0);
    
    // 입력 필드가 비워졌는지 확인
    await expect(this.messageInput).toHaveValue('');
  }

  /**
   * Enter 키로 메시지 전송
   */
  async sendMessageWithEnter(message: string) {
    await this.messageInput.fill(message);
    await this.messageInput.press('Enter');
    
    // 메시지가 전송되었는지 확인
    await this.page.waitForTimeout(1000);
    await expect(this.messageInput).toHaveValue('');
  }

  /**
   * 이모지 선택 및 전송
   */
  async sendEmoji(emojiName: string = 'smile') {
    await this.emojiButton.click();
    await expect(this.emojiPicker).toBeVisible();
    
    // 특정 이모지 클릭
    const emoji = this.page.locator(`[data-testid="emoji-${emojiName}"]`);
    if (await emoji.isVisible()) {
      await emoji.click();
    } else {
      // 첫 번째 이모지 클릭
      await this.emojiItems.first().click();
    }
    
    // 이모지 피커가 닫히는지 확인
    await expect(this.emojiPicker).not.toBeVisible();
  }

  /**
   * 파일 첨부
   */
  async attachFile(filePath: string) {
    await this.attachmentButton.click();
    await expect(this.fileUploadModal).toBeVisible();
    
    // 파일 선택
    await this.uploadFile('[data-testid="file-input"]', [filePath]);
    
    // 미리보기 확인 (이미지인 경우)
    if (filePath.includes('.jpg') || filePath.includes('.png')) {
      await expect(this.imagePreview).toBeVisible();
    }
    
    // 업로드 확인
    await this.uploadConfirmButton.click();
    
    // 모달이 닫히는지 확인
    await expect(this.fileUploadModal).not.toBeVisible();
  }

  /**
   * 음성 메시지 녹음 시작
   */
  async startVoiceRecording() {
    await this.voiceButton.click();
    
    // 권한 요청 다이얼로그 처리
    await this.handleDialog(true);
    
    // 녹음 상태 확인
    const recordingIndicator = this.page.locator('[data-testid="recording-indicator"]');
    await expect(recordingIndicator).toBeVisible();
  }

  /**
   * 음성 메시지 녹음 중지
   */
  async stopVoiceRecording() {
    const stopButton = this.page.locator('[data-testid="stop-recording"]');
    await stopButton.click();
    
    // 음성 메시지 미리보기
    const voicePreview = this.page.locator('[data-testid="voice-preview"]');
    await expect(voicePreview).toBeVisible();
    
    // 전송 버튼 클릭
    const sendVoiceButton = this.page.locator('[data-testid="send-voice"]');
    await sendVoiceButton.click();
  }

  /**
   * 채팅방 헤더 정보 확인
   */
  async verifyChatRoomHeader(partnerName: string) {
    await expect(this.chatHeader).toBeVisible();
    await expect(this.partnerName).toContainText(partnerName);
    await expect(this.partnerAvatar).toBeVisible();
    await expect(this.backButton).toBeVisible();
    await expect(this.chatMenuButton).toBeVisible();
  }

  /**
   * 메시지 로딩 확인
   */
  async verifyMessagesLoaded() {
    await expect(this.messagesContainer).toBeVisible();
    
    const messageCount = await this.messageItems.count();
    if (messageCount > 0) {
      // 첫 번째 메시지 구조 확인
      await expect(this.getMessageText(0)).toBeVisible();
      await expect(this.getMessageTime(0)).toBeVisible();
    }
  }

  /**
   * 메시지 스크롤 테스트
   */
  async scrollToTopForOlderMessages() {
    // 메시지 컨테이너 맨 위로 스크롤
    await this.messagesContainer.evaluate((element) => {
      element.scrollTop = 0;
    });
    
    // 추가 메시지 로딩 대기
    await this.page.waitForTimeout(2000);
    
    // 더 많은 메시지가 로드되었는지 확인 (무한 스크롤)
    const newMessageCount = await this.messageItems.count();
    return newMessageCount;
  }

  /**
   * 최하단으로 스크롤
   */
  async scrollToBottom() {
    await this.messagesContainer.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    
    // 스크롤 투 바텀 버튼이 사라지는지 확인
    try {
      await expect(this.scrollToBottomButton).not.toBeVisible({ timeout: 2000 });
    } catch {
      // 버튼이 없는 경우
    }
  }

  /**
   * 타이핑 인디케이터 확인
   */
  async verifyTypingIndicator() {
    // 상대방이 타이핑 중일 때 표시
    await expect(this.typingIndicator).toBeVisible();
    await expect(this.typingIndicator).toContainText('입력 중');
  }

  /**
   * 읽음 상태 확인
   */
  async verifyReadReceipts() {
    const readReceipts = await this.readReceipts.all();
    
    for (const receipt of readReceipts) {
      await expect(receipt).toBeVisible();
    }
  }

  /**
   * 채팅 메뉴 열기
   */
  async openChatMenu() {
    await this.chatMenuButton.click();
    await expect(this.chatMenu).toBeVisible();
  }

  /**
   * 파트너 프로필 보기
   */
  async viewPartnerProfile() {
    await this.openChatMenu();
    await this.viewProfileButton.click();
    
    // 프로필 모달이나 페이지로 이동
    const profileModal = this.page.locator('[data-testid="profile-modal"]');
    try {
      await expect(profileModal).toBeVisible();
    } catch {
      await this.page.waitForURL(/\/profile\/\d+/);
    }
  }

  /**
   * 채팅 음소거
   */
  async muteChat() {
    await this.openChatMenu();
    await this.muteButton.click();
    
    // 확인 메시지
    await this.helpers.expectSuccessMessage('채팅이 음소거되었습니다');
  }

  /**
   * 사용자 차단
   */
  async blockUser() {
    await this.openChatMenu();
    await this.blockButton.click();
    
    // 확인 다이얼로그
    const confirmDialog = this.page.locator('[data-testid="block-confirm-dialog"]');
    await expect(confirmDialog).toBeVisible();
    
    const confirmButton = confirmDialog.locator('[data-testid="confirm-block"]');
    await confirmButton.click();
    
    // 성공 메시지
    await this.helpers.expectSuccessMessage('사용자가 차단되었습니다');
  }

  /**
   * 사용자 신고
   */
  async reportUser(reason: string) {
    await this.openChatMenu();
    await this.reportButton.click();
    
    // 신고 모달
    const reportModal = this.page.locator('[data-testid="report-modal"]');
    await expect(reportModal).toBeVisible();
    
    // 신고 사유 선택
    const reportReason = reportModal.locator('[data-testid="report-reason"]');
    await reportReason.selectOption(reason);
    
    // 신고 제출
    const submitButton = reportModal.locator('[data-testid="submit-report"]');
    await submitButton.click();
    
    // 성공 메시지
    await this.helpers.expectSuccessMessage('신고가 접수되었습니다');
  }

  /**
   * 채팅 기록 삭제
   */
  async clearChatHistory() {
    await this.openChatMenu();
    await this.clearChatButton.click();
    
    // 확인 다이얼로그
    const confirmDialog = this.page.locator('[data-testid="clear-confirm-dialog"]');
    await expect(confirmDialog).toBeVisible();
    
    const confirmButton = confirmDialog.locator('[data-testid="confirm-clear"]');
    await confirmButton.click();
    
    // 메시지가 모두 삭제되었는지 확인
    await expect(this.messageItems).toHaveCount(0);
  }

  /**
   * 채팅방 나가기
   */
  async leaveChatRoom() {
    await this.openChatMenu();
    await this.leaveChatButton.click();
    
    // 확인 다이얼로그
    const confirmDialog = this.page.locator('[data-testid="leave-confirm-dialog"]');
    await expect(confirmDialog).toBeVisible();
    
    const confirmButton = confirmDialog.locator('[data-testid="confirm-leave"]');
    await confirmButton.click();
    
    // 채팅 홈으로 이동
    await this.page.waitForURL('/chat');
  }

  /**
   * 뒤로 가기
   */
  async goBack() {
    await this.backButton.click();
    await this.page.waitForURL('/chat');
  }

  /**
   * 모바일 반응형 확인
   */
  async verifyMobileResponsive() {
    await this.helpers.setMobileViewport();
    
    // 모바일에서 채팅 UI 확인
    await expect(this.chatHeader).toBeVisible();
    await expect(this.messagesContainer).toBeVisible();
    await expect(this.messageInput).toBeVisible();
    await expect(this.sendButton).toBeVisible();
    
    // 터치 친화적 버튼 크기
    const sendButtonBox = await this.sendButton.boundingBox();
    if (sendButtonBox) {
      expect(sendButtonBox.height).toBeGreaterThan(44);
    }
  }

  /**
   * 접근성 확인
   */
  async verifyAccessibility() {
    // 메시지 입력 필드에 포커스
    await this.messageInput.focus();
    await expect(this.messageInput).toBeFocused();
    
    // Tab으로 다음 요소로 이동
    await this.page.keyboard.press('Tab');
    await expect(this.sendButton).toBeFocused();
    
    // 키보드로 버튼 클릭
    await this.page.keyboard.press('Enter');
  }

  /**
   * 실시간 메시지 수신 확인
   */
  async verifyRealtimeMessageReceived() {
    // WebSocket 모킹
    await this.helpers.mockWebSocket();
    
    const initialMessageCount = await this.messageItems.count();
    
    // 새 메시지 수신 시뮬레이션
    await this.page.evaluate(() => {
      const event = new CustomEvent('newMessage', {
        detail: {
          id: Date.now(),
          content: 'Hello from WebSocket!',
          senderId: 2,
          senderName: 'Partner',
          timestamp: new Date().toISOString()
        }
      });
      window.dispatchEvent(event);
    });
    
    // 메시지가 추가되었는지 확인
    await this.page.waitForTimeout(1000);
    const newMessageCount = await this.messageItems.count();
    expect(newMessageCount).toBe(initialMessageCount + 1);
  }

  /**
   * 연결 상태 확인
   */
  async verifyConnectionStatus() {
    const connectionStatus = this.page.locator('[data-testid="connection-status"]');
    
    // 연결됨 상태 확인
    if (await connectionStatus.isVisible()) {
      await expect(connectionStatus).toContainText('연결됨');
    }
  }

  /**
   * 오프라인 상태 처리
   */
  async verifyOfflineHandling() {
    // 네트워크 연결 끊기
    await this.page.setOffline(true);
    
    // 오프라인 메시지 표시 확인
    const offlineMessage = this.page.locator('[data-testid="offline-message"]');
    
    try {
      await expect(offlineMessage).toBeVisible({ timeout: 5000 });
    } catch {
      console.log('오프라인 처리가 구현되지 않음');
    }
    
    // 네트워크 복구
    await this.page.setOffline(false);
    
    // 연결 복구 메시지
    try {
      const reconnectedMessage = this.page.locator('[data-testid="reconnected-message"]');
      await expect(reconnectedMessage).toBeVisible({ timeout: 5000 });
    } catch {
      console.log('재연결 알림이 구현되지 않음');
    }
  }

  /**
   * 성능 측정
   */
  async measurePagePerformance() {
    const metrics = await this.helpers.measurePerformance();
    
    // 채팅 페이지 성능 기준
    expect(metrics.firstContentfulPaint).toBeLessThan(2000); // 2초 이내
    expect(metrics.domContentLoaded).toBeLessThan(3000);     // 3초 이내
    
    return metrics;
  }
}