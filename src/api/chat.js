import api from './index.js';
import websocketService from '../services/websocketService.js';
// REST: 내 채팅방 목록 조회
export async function fetchChatRooms() {
  try {
    const res = await api.get("/chat/rooms");
    return Array.isArray(res.data.data) ? res.data.data : [];
  } catch (err) {
    console.error("fetchChatRooms 실패", err);
    return [];
  }
}

// REST: 공개 채팅방 목록 조회
export async function fetchPublicChatRooms() {
  try {
    const res = await api.get("/chat/rooms/public");
    return Array.isArray(res.data.data) ? res.data.data : [];
  } catch (err) {
    console.error("fetchPublicChatRooms 실패", err);
    return [];
  }
}

// REST: 채팅방 참여
export async function joinChatRoom(roomId) {
  try {
    const res = await api.post(`/chat/rooms/${roomId}/join`);
    return res.data.data;
  } catch (err) {
    console.error("joinChatRoom 실패", err);
    throw err;
  }
}

// REST: 채팅방 나가기
export async function leaveChatRoom(roomId) {
  try {
    const res = await api.post(`/chat/rooms/${roomId}/leave`);
    return res.data.data;
  } catch (err) {
    console.error("leaveChatRoom 실패", err);
    throw err;
  }
}

// REST: 채팅방 생성
export async function createChatRoom({ roomName, participantIds }) {
  const res = await api.post("/chat/rooms", { roomName, participantIds });
  return res.data.data;
}

// REST: 채팅 히스토리 조회
export async function fetchChatHistory(roomId, page = 0, size = 50) {
  const res = await api.get(
    `/chat/rooms/${roomId}/messages?page=${page}&size=${size}`
  );
  return res.data.data;
}

// REST: 채팅 이미지 업로드
export async function uploadChatImages(roomId, files) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  const res = await api.post(`/chat/rooms/${roomId}/images`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data.data;
}

// REST: 채팅 오디오 업로드
export async function uploadChatAudio(roomId, file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post(`/chat/rooms/${roomId}/audio`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data.data;
}

// WS+STOMP: 채팅방 클라이언트 초기화
export async function initStompClient(roomId, onMessage, onConnectionChange, onError) {
  try {
    // WebSocket 연결 (이미 연결된 경우 재사용)
    if (!websocketService.getConnectionStatus().isConnected) {
      await websocketService.connect({
        debug: import.meta.env.DEV
      });
    }

    // 연결 상태 리스너 등록
    if (onConnectionChange) {
      websocketService.addConnectionListener(onConnectionChange);
    }

    // 에러 리스너 등록
    if (onError) {
      websocketService.addErrorListener(onError);
    }

    // 채팅방 메시지 구독
    const subscriptionId = websocketService.subscribe(
      `/sub/chat/room/${roomId}`,
      (message) => {
        if (onMessage) {
          onMessage(message);
        }
      }
    );

    // 클라이언트 객체 반환 (기존 인터페이스 호환)
    return {
      send: (destination, headers, body) => {
        try {
          const message = typeof body === 'string' ? JSON.parse(body) : body;
          websocketService.send(destination, message, headers);
        } catch (error) {
          console.error("Failed to send message:", error);
        }
      },
      disconnect: () => {
        websocketService.unsubscribe(subscriptionId);
        if (onConnectionChange) {
          websocketService.removeConnectionListener(onConnectionChange);
        }
        if (onError) {
          websocketService.removeErrorListener(onError);
        }
      },
      subscriptionId,
      isConnected: () => websocketService.getConnectionStatus().isConnected
    };
  } catch (error) {
    console.error("Failed to initialize STOMP client:", error);
    if (onError) {
      onError('connection_failed', error);
    }
    throw error;
  }
}

export async function initGlobalStompClient(onRoomCreated, onConnectionChange, onError) {
  try {
    // WebSocket 연결 (이미 연결된 경우 재사용)
    if (!websocketService.getConnectionStatus().isConnected) {
      await websocketService.connect({
        debug: import.meta.env.DEV
      });
    }

    // 연결 상태 리스너 등록
    if (onConnectionChange) {
      websocketService.addConnectionListener(onConnectionChange);
    }

    // 에러 리스너 등록
    if (onError) {
      websocketService.addErrorListener(onError);
    }

    // 채팅방 생성 알림 구독
    const roomSubscriptionId = websocketService.subscribe(
      `/user/queue/rooms`,
      (roomData) => {
        console.log("Received new room notification:", roomData);
        if (onRoomCreated) {
          onRoomCreated(roomData);
        }
      }
    );

    // 공개 채팅방 생성 알림 구독
    const publicRoomSubscriptionId = websocketService.subscribe(
      `/sub/chat/public-rooms`,
      (roomData) => {
        console.log("Received public room creation notification:", roomData);
        if (onRoomCreated) {
          onRoomCreated(roomData);
        }
      }
    );

    // 클라이언트 객체 반환 (기존 인터페이스 호환)
    return {
      disconnect: () => {
        websocketService.unsubscribe(roomSubscriptionId);
        websocketService.unsubscribe(publicRoomSubscriptionId);
        if (onConnectionChange) {
          websocketService.removeConnectionListener(onConnectionChange);
        }
        if (onError) {
          websocketService.removeErrorListener(onError);
        }
      },
      isConnected: () => websocketService.getConnectionStatus().isConnected,
      subscriptionIds: [roomSubscriptionId, publicRoomSubscriptionId]
    };
  } catch (error) {
    console.error("Failed to initialize global STOMP client:", error);
    if (onError) {
      onError('connection_failed', error);
    }
    throw error;
  }
}

// ===== 파일 관리 =====

/**
 * 현재 사용자가 업로드한 모든 채팅 파일을 조회합니다.
 * 서버는 ApiResponse<List<ChatFileResponse>> 형식을 반환합니다.
 */
export async function fetchMyChatFiles() {
  try {
    const response = await api.get('/chat/files/my-files');
    return response.data?.data ?? response.data ?? [];
  } catch (error) {
    console.error('fetchMyChatFiles 실패', error);
    throw error;
  }
}

/**
 * 채팅 파일을 삭제합니다 (논리 삭제).
 * @param {number|string} fileId 삭제할 파일 ID
 */
export async function deleteChatFile(fileId) {
  try {
    await api.delete(`/chat/files/${fileId}`);
  } catch (error) {
    console.error('deleteChatFile 실패', error);
    throw error;
  }
}

// 타이핑 상태 전송
export function sendTypingStatus(roomId, isTyping) {
  try {
    websocketService.send('/pub/chat/typing', {
      roomId,
      isTyping,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to send typing status:', error);
  }
}

// 타이핑 상태 구독 (채팅방별)
export function subscribeToTyping(roomId, onTypingChange) {
  return websocketService.subscribe(
    `/sub/chat/room/${roomId}/typing`,
    (typingData) => {
      if (onTypingChange) {
        onTypingChange(typingData);
      }
    }
  );
}

// 타이핑 상태 구독 해제
export function unsubscribeFromTyping(subscriptionId) {
  websocketService.unsubscribe(subscriptionId);
}

// 메시지 읽음 처리
export async function markMessagesAsRead(roomId) {
  try {
    const res = await api.post(`/chat/read-status/rooms/${roomId}/read-all`);
    return res.data.data;
  } catch (error) {
    console.error("메시지 읽음 처리 실패:", error);
    throw error;
  }
}

// 미읽은 메시지 수 조회
export async function getUnreadMessageCount(roomId) {
  try {
    const res = await api.get(`/chat/read-status/rooms/${roomId}/unread-count`);
    return res.data.data;
  } catch (error) {
    console.error("미읽은 메시지 수 조회 실패:", error);
    return 0;
  }
}

// 전체 미읽은 메시지 수 조회
export async function getTotalUnreadCount() {
  try {
    const res = await api.get('/chat/read-status/total-unread-count');
    return res.data.data;
  } catch (error) {
    console.error("전체 미읽은 메시지 수 조회 실패:", error);
    return 0;
  }
}

// 채팅 메시지 검색
export async function searchChatMessages(roomId, keyword, page = 0, size = 20) {
  try {
    const res = await api.get(`/chat/rooms/${roomId}/messages/search`, {
      params: { keyword, page, size }
    });
    return res.data.data;
  } catch (error) {
    console.error("메시지 검색 실패:", error);
    return { content: [], totalElements: 0 };
  }
}
