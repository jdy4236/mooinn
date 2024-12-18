"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";

// 서버 주소와 WebSocket 경로를 명확히 설정
const socket = io("http://localhost:3000");

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // 메시지 수신 처리
    socket.on("message", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("message", message);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold">Chat Room</h1>
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
