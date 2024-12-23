// src/app/page.js

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from './page.module.css'; // CSS 모듈 사용

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [nickname, setNickname] = useState("");
  const [isInvite, setIsInvite] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 초기 로딩 상태 추가
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const inviteRoomId = searchParams.get("roomId");
    const invite = searchParams.get("invite");
    if (invite && inviteRoomId) {
      setRoomId(inviteRoomId);
      setIsInvite(true);
    }
    setIsLoading(false); // 로딩 완료
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
        <h1 className={styles.title}>MOOINN Chat</h1>
        <div className={styles.loading}></div> {/* 로딩 스피너 */}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>MOOINN Chat</h1>
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
