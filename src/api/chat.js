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

  client.connect(
        { Authorization: `Bearer ${token}` },
        (frame) => {
          console.log("Global STOMP Connected:", frame);
          client.subscribe(`/user/queue/rooms`, (message) => {
            console.log("Received new room notification:", JSON.parse(message.body));
            onRoomCreated(JSON.parse(message.body));
          });
        },
        (error) => {
          console.error("Global STOMP Error:", error);
        }
      );
      return client;
    }
