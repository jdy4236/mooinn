"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

let socket;

export default function ChatPage() {
  const [roomId, setRoomId] = useState(null);
  const [nickname, setNickname] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // URL에서 roomId와 nickname 가져오기
    const searchParams = new URLSearchParams(window.location.search);
    const room = searchParams.get("roomId");
    const name = searchParams.get("nickname");

    if (!room || !name) {
      router.push("/"); // 유효하지 않으면 홈으로 리다이렉트
      return;
    }

    setRoomId(room);
    setNickname(name);

    socket = io("http://localhost:3000");

    // 방 참가
    socket.emit("joinRoom", { roomId: room, nickname: name });

    // 메시지 수신 처리
    socket.on("message", ({ nickname, message }) => {
      setMessages((prevMessages) => [...prevMessages, { nickname, message }]);
    });

    return () => {
      socket.disconnect();
    };
  }, [router]);

  const sendMessage = () => {
    if (message.trim() && roomId && nickname) {
      socket.emit("message", { roomId, message, nickname });
      setMessage("");
    }
  };

  if (!roomId || !nickname) {
    return null; // roomId와 nickname이 없으면 아무것도 렌더링하지 않음
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Chat Room: {roomId}</h1>
      <p className="mb-4">Nickname: {nickname}</p>
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
