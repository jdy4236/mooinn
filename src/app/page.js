// src/app/page.js

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import styles from './page.module.css'; // CSS 모듈 사용

let socket;

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [nickname, setNickname] = useState("");
  const [isInvite, setIsInvite] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 초기 로딩 상태 추가
  const [messages, setMessages] = useState([]); // 메시지 상태 추가
  const [newMessage, setNewMessage] = useState(""); // 새 메시지 입력 상태
  const router = useRouter();

  useEffect(() => {
    // Socket.io 서버 초기화
    fetch("/api/socket");

    socket = io();

    // 서버로부터 메시지 수신
    socket.on("receive-message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // URL 검색 파라미터 처리
    const searchParams = new URLSearchParams(window.location.search);
    const inviteRoomId = searchParams.get("roomId");
    const invite = searchParams.get("invite");
    if (invite && inviteRoomId) {
      setRoomId(inviteRoomId);
      setIsInvite(true);
    }
    setIsLoading(false); // 로딩 완료

    // 컴포넌트 언마운트 시 소켓 연결 해제
    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = () => {
    if (!nickname.trim()) {
      alert("Please enter a nickname.");
      return;
    }
    const newRoomId = Math.random().toString(36).substring(2, 9);
    router.push(`/chat?roomId=${newRoomId}&nickname=${nickname}`);
  };

  const joinRoom = () => {
    if (!nickname.trim()) {
      alert("Please enter a nickname.");
      return;
    }
    if (!roomId.trim() && !isInvite) {
      alert("Please enter a valid room ID.");
      return;
    }
    router.push(`/chat?roomId=${roomId}&nickname=${nickname}`);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Chat</h1>
        <div className={styles.loading}></div> {/* 로딩 스피너 */}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Chat</h1>
      <input
        type="text"
        placeholder="Enter your nickname"
        className={styles.input}
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      {!isInvite && (
        <>
          <button className={styles.button} onClick={createRoom}>
            Create Room
          </button>
          <div className={styles.roomContainer}>
            <input
              type="text"
              placeholder="Enter Room ID"
              className={`${styles.input} ${styles.roomInput}`}
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button className={styles.button} onClick={joinRoom}>
              Join Room
            </button>
          </div>
        </>
      )}
      {isInvite && (
        <button className={styles.button} onClick={joinRoom}>
          Join Room
        </button>
      )}
    </div>
  );
}
