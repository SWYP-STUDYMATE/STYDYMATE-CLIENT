import React, { useEffect, useState, useRef } from 'react';
import {
  fetchChatHistory,
  initStompClient
} from '../../api/chat';

export default function ChatWindow({ room, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const stompClient = useRef(null);
  const scrollRef = useRef();

  useEffect(() => {
    (async () => {
      try {
        const history = await fetchChatHistory(room.roomId);
        setMessages(history);
        scrollToBottom();
      } catch (err) {
        console.error(err);
      }
    })();

    stompClient.current = initStompClient(room.roomId, msg => {
      setMessages(prev => [...prev, msg]);
      scrollToBottom();
    });

    return () => stompClient.current.disconnect();
  }, [room.roomId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }, 50);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    stompClient.current.send(
      '/pub/chat/message',
      {},
      JSON.stringify({ roomId: room.roomId, message: input })
    );
    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="flex items-center p-4 bg-gray-100 border-b">
        <button
          onClick={onBack}
          className="mr-4 text-blue-500 hover:underline"
        >
          ← 목록
        </button>
        <h2 className="text-xl font-bold">{room.roomName}</h2>
      </header>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 bg-white"
      >
        {messages.map(msg => (
          <div key={msg.messageId} className="flex mb-4 items-start">
            <img
              src={msg.sender.profileImage}
              alt={msg.sender.name}
              className="w-8 h-8 rounded-full mr-3"
            />
            <div>
              <p className="text-sm font-medium">{msg.sender.name}</p>
              <p className="mt-1 p-2 bg-gray-100 rounded">{msg.message}</p>
              <span className="text-xs text-gray-400">
                {new Date(msg.sentAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-50 border-t flex">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 border rounded px-3 py-2 mr-2 focus:outline-none"
          placeholder="메시지를 입력하세요"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          전송
        </button>
      </div>
    </div>
  );
}
