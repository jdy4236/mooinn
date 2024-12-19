"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

let socket;

export default function ChatPage() {
  const [roomId, setRoomId] = useState(null);
  const [nickname, setNickname] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const room = searchParams.get("roomId");
    const name = searchParams.get("nickname");
    const isInvite = searchParams.get("invite");

    if (!room || !name) {
      router.push("/");
      return;
    }

    setRoomId(room);
    setNickname(name);

    socket = io("http://localhost:3000");

    // 방 참가
    socket.emit("joinRoom", { roomId: room, nickname: name });

    // 닉네임 중복 에러 처리
    socket.on("nicknameError", ({ message }) => {
      alert(message);
      router.push(`/?invite=true&roomId=${room}`); // 초대장 URL 유지
    });

    // 사용자 목록 업데이트
    socket.on("roomUsers", (users) => setUsers(users));

    // 메시지 수신 처리
    socket.on("message", ({ nickname, message, timestamp }) => {
      setMessages((prev) => [...prev, { nickname, message, timestamp }]);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => {
      socket.disconnect();
    };
  }, [router]);

  const sendMessage = () => {
    if (message.trim() && roomId && nickname) {
      const timestamp = new Date().toLocaleTimeString();
      socket.emit("message", { roomId, message, nickname, timestamp });
      setMessage("");
    }
  };

  const generateInvite = async () => {
    const inviteLink = `http://localhost:3000/?invite=true&roomId=${roomId}`;
    await navigator.clipboard.writeText(inviteLink);
    alert("Invite link copied to clipboard!");
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-blue-600 text-white py-4 px-6 flex justify-between">
        <div>
          <h1 className="text-lg font-bold">Chat Room: {roomId}</h1>
          <p>Nickname: {nickname}</p>
        </div>
        <button
          onClick={generateInvite}
          className="bg-white text-blue-600 px-4 py-2 rounded shadow"
        >
          Generate Invite
        </button>
      </header>
      <main className="flex-grow overflow-y-auto bg-gray-50 p-4">
        <ul>
          {messages.map((msg, index) => (
            <li key={index} className="mb-2">
              <strong>{msg.nickname}</strong>{" "}
              <span className="text-gray-500">({msg.timestamp})</span>:{" "}
              {msg.message}
            </li>
          ))}
        </ul>
        <div ref={messagesEndRef} />
      </main>
      <footer className="bg-white p-4 flex">
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
      </footer>
    </div>
  );
}
