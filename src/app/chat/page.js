"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

let socket;

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);
  const roomId = searchParams.get("roomId");
  const nickname = searchParams.get("nickname");

  useEffect(() => {
    if (!roomId || !nickname) {
      router.push("/");
      return;
    }

    socket = io("http://localhost:3000");

    // 방 참가
    socket.emit("joinRoom", { roomId, nickname });

    // 메시지 수신 처리
    socket.on("message", ({ nickname, message }) => {
      setMessages((prevMessages) => [...prevMessages, { nickname, message }]);
    });

    // 사용자 목록 업데이트
    socket.on("roomUsers", (users) => {
      setUsers(users);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, nickname, router]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("message", { roomId, message, nickname });
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Chat Room: {roomId}</h1>
      <p className="mb-4">Nickname: {nickname}</p>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Users in Room:</h2>
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.nickname}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4 w-full max-w-md">
        <div className="p-4 border bg-white rounded shadow">
          <ul>
            {messages.map((msg, index) => (
              <li key={index} className="mb-2">
                <strong>{msg.nickname}:</strong> {msg.message}
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
