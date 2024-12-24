"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import styles from './chat.module.css'; // CSS 모듈 임포트

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

    // Socket.io 서버 초기화 (환경에 따라 URL 변경 필요)
    socket = io("http://localhost:3000", {
      path: "/socket.io", // 서버에서 설정한 경로와 일치해야 함
    });

    // 방 참가
    socket.emit("joinRoom", { roomId: room, nickname: name });

    // 닉네임 중복 에러 처리
    socket.on("nicknameError", ({ message }) => {
      alert(message);
      router.push(`/?invite=true&roomId=${room}`); // 초대장 URL 유지
    });

    // 사용자 목록 업데이트
    socket.on("roomUsers", (users) => {
      console.log("Received users:", users); // 디버깅용 로그
      setUsers(users);
    });

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
    <div className={`flex flex-col h-screen ${styles.container}`}>
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
      <div className="flex flex-grow">
        <main className={`flex-grow overflow-y-auto p-4 ${styles.chatBox}`}>
          <ul>
            {messages.map((msg, index) => (
              <li key={index} className={styles.message}>
                <strong className={styles.nickname}>{msg.nickname}</strong>{" "}
                <span className={styles.timestamp}>({msg.timestamp})</span>:{" "}
                {msg.message}
              </li>
            ))}
          </ul>
          <div ref={messagesEndRef} />
        </main>
        <aside className={styles.userList}>
          <h2 className={styles.userListTitle}>Users</h2>
          <ul>
            {users.map((user, index) => (
              <li key={index} className={styles.userItem}>
                {user.nickname ? user.nickname : user}
              </li>
            ))}
          </ul>
        </aside>
      </div>
      <footer className="bg-white p-4 flex">
        <div className={styles.inputContainer}>
          <input
            type="text"
            className={`${styles.input} text-black`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button
            className={styles.button}
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}
