import axios from "axios";
import SockJS from "sockjs-client";
import { over } from "stompjs";

axios.defaults.baseURL = "http://localhost:8080";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// REST: 내 채팅방 목록 조회
export async function fetchChatRooms() {
  try {
    const res = await axios.get("/api/chat/rooms");
    return Array.isArray(res.data.data) ? res.data.data : [];
  } catch (err) {
    console.error("fetchChatRooms 실패", err);
    return [];
  }
}

// REST: 공개 채팅방 목록 조회
export async function fetchPublicChatRooms() {
  try {
    const res = await axios.get("/api/chat/rooms/public");
    return Array.isArray(res.data.data) ? res.data.data : [];
  } catch (err) {
    console.error("fetchPublicChatRooms 실패", err);
    return [];
  }
}

// REST: 채팅방 참여
export async function joinChatRoom(roomId) {
  try {
    const res = await axios.post(`/api/chat/rooms/${roomId}/join`);
    return res.data.data;
  } catch (err) {
    console.error("joinChatRoom 실패", err);
    throw err;
  }
}

// REST: 채팅방 나가기
export async function leaveChatRoom(roomId) {
  try {
    const res = await axios.post(`/api/chat/rooms/${roomId}/leave`);
    return res.data.data;
  } catch (err) {
    console.error("leaveChatRoom 실패", err);
    throw err;
  }
}

// REST: 채팅방 생성
export async function createChatRoom({ roomName, participantIds }) {
  const res = await axios.post("/api/chat/rooms", { roomName, participantIds });
  return res.data.data;
}

// REST: 채팅 히스토리 조회
export async function fetchChatHistory(roomId, page = 0, size = 50) {
  const res = await axios.get(
    `/api/chat/rooms/${roomId}/messages?page=${page}&size=${size}`
  );
  return res.data.data;
}

// REST: 채팅 이미지 업로드
export async function uploadChatImages(roomId, files) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  const res = await axios.post(`/api/chat/rooms/${roomId}/images`, formData, {
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
  const res = await axios.post(`/api/chat/rooms/${roomId}/audio`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data.data;
}

// WS+STOMP: 초기화 및 메시지 발송/구독
export function initStompClient(roomId, onMessage) {
  const token = localStorage.getItem("accessToken");
  // 1) 토큰을 쿼리 파라미터로도 보내면 SockJS 핸드셰이크에 포함됩니다.
  const socketUrl = `http://localhost:8080/ws/chat?token=${token}`;
  const socket = new SockJS(socketUrl);
  const client = over(socket);

  client.connect(
    { Authorization: `Bearer ${token}` }, // 2) CONNECT 프레임에도 헤더로 붙임
    (frame) => {
      console.log("STOMP Connected:", frame);
      client.subscribe(`/sub/chat/room/${roomId}`, (message) => {
        onMessage(JSON.parse(message.body));
      });
    },
    (error) => {
      console.error("STOMP Error:", error);
    }
  );
  return client;
}

export function initGlobalStompClient(onRoomCreated) {
  const token = localStorage.getItem("accessToken");
  const socketUrl = `http://localhost:8080/ws/chat?token=${token}`;
  const socket = new SockJS(socketUrl);
  const client = over(socket);

  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;

  const connect = () => {
    client.connect(
      { Authorization: `Bearer ${token}` },
      (frame) => {
        console.log("Global STOMP Connected:", frame);
        reconnectAttempts = 0; // 연결 성공 시 재시도 횟수 초기화

        // 채팅방 생성 알림 구독
        client.subscribe(`/user/queue/rooms`, (message) => {
          try {
            const roomData = JSON.parse(message.body);
            console.log("Received new room notification:", roomData);
            onRoomCreated(roomData);
          } catch (error) {
            console.error("Error parsing room notification:", error);
          }
        });

        // 공개 채팅방 생성 알림 구독
        client.subscribe(`/sub/chat/public-rooms`, (message) => {
          try {
            const roomData = JSON.parse(message.body);
            console.log(
              "Received public room creation notification:",
              roomData
            );
            onRoomCreated(roomData);
          } catch (error) {
            console.error("Error parsing public room notification:", error);
          }
        });
      },
      (error) => {
        console.error("Global STOMP Error:", error);

        // 재연결 시도
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(
            `Reconnecting... Attempt ${reconnectAttempts}/${maxReconnectAttempts}`
          );
          setTimeout(() => {
            connect();
          }, 3000); // 3초 후 재연결 시도
        } else {
          console.error("Max reconnection attempts reached");
        }
      }
    );
  };

  connect();

  // 연결 해제 시 정리
  const originalDisconnect = client.disconnect;
  client.disconnect = () => {
    console.log("Disconnecting global STOMP client");
    originalDisconnect.call(client);
  };

  return client;
}
