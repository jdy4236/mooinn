"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import io from "socket.io-client";

let socket;

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId"); // URL 쿼리 파라미터로 방 ID 가져오기

  useEffect(() => {
    if (!roomId) {
      return; // 방 ID가 없으면 아무 작업도 하지 않음
    }

    // WebSocket 연결 및 방 참가
    socket = io("http://localhost:3000");
    socket.emit("joinRoom", roomId);

    // 메시지 수신 처리
    socket.on("message", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("message", { roomId, message });
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Chat Room: {roomId}</h1>
      <div className="mt-4 w-full max-w-md">
        <div className="p-4 border bg-white rounded shadow">
          <ul>
            {messages.map((msg, index) => (
              <li key={index} className="mb-2">
                {msg}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex mt-4">
          <input
            type="text"
            className="flex-grow p-2 border rounded-l"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button
            className="p-2 bg-blue-500 text-white rounded-r"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
