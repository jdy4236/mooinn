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
  const [isAuthenticated, setIsAuthenticated] = useState(false); // 인증 상태
  const [userRooms, setUserRooms] = useState([]); // 사용자가 생성한 방 목록
  const [activeTab, setActiveTab] = useState("anonymous"); // 현재 활성화된 탭 ('anonymous' 또는 'authenticated')
  const router = useRouter();

  useEffect(() => {

    socket = io();

    // URL 검색 파라미터 처리
    const searchParams = new URLSearchParams(window.location.search);
    const inviteRoomId = searchParams.get("roomId");
    const invite = searchParams.get("invite");
    if (invite && inviteRoomId) {
      setRoomId(inviteRoomId);
      setIsInvite(true);
    }

    // JWT 토큰 확인
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true); // 토큰이 있으면 인증 상태로 설정
    }

    setIsLoading(false); // 로딩 완료

    // 컴포넌트 언마운트 시 소켓 연결 해제
    return () => {
      socket.disconnect();
    };
  }, []);

  // 사용자 방 목록 가져오기 함수
  const fetchUserRooms = async () => {
    try {
      const res = await fetch("/api/auth-room/list", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // JWT 토큰
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUserRooms(data.rooms); // 사용자가 생성한 방 목록 설정
      } else {
        console.error("Failed to fetch rooms");
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserRooms(); // 인증된 경우 방 목록 가져오기
    }
  }, [isAuthenticated]);

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

  const createAuthenticatedRoom = async () => {
    if (!isAuthenticated) {
      alert("You need to be logged in to create an authenticated room.");
      return;
    }
    const newRoomId = `auth_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const res = await fetch("/api/auth-room/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ roomId: newRoomId }),
      });

      if (res.ok) {
        alert(`Authenticated Room Created: ${newRoomId}`);
        fetchUserRooms(); // 방 목록 업데이트
      } else {
        const { error } = await res.json();
        alert(`Failed to create room: ${error}`);
      }
    } catch (err) {
      console.error("Error creating authenticated room:", err);
      alert("An error occurred while creating the room.");
    }
  };

  const deleteAuthenticatedRoom = async (roomId) => {
    if (!isAuthenticated) {
      alert("You need to be logged in to delete an authenticated room.");
      return;
    }

    try {
      const res = await fetch("/api/auth-room/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ roomId }),
      });

      if (res.ok) {
        alert(`Room Deleted: ${roomId}`);
        setUserRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId)); // 삭제된 방 목록에서 제거
      } else {
        const { error } = await res.json();
        alert(`Failed to delete room: ${error}`);
      }
    } catch (err) {
      console.error("Error deleting authenticated room:", err);
      alert("An error occurred while deleting the room.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    alert("You have been logged out.");
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
    <div>
      {/* Top 메뉴 */}
      <header className="bg-gray-800 text-white p-4 flex justify-between">
        <h1 className="text-lg font-bold">MOOINN</h1>
        <div>
          {!isAuthenticated ? (
            <>
              <button
                className="bg-blue-500 px-4 py-2 rounded mr-2"
                onClick={() => router.push("/login")}
              >
                Login
              </button>
              <button
                className="bg-green-500 px-4 py-2 rounded"
                onClick={() => router.push("/signup")}
              >
                Signup
              </button>
            </>
          ) : (
            <>
              <span className="mr-4">Welcome, {nickname || "User"}!</span>
              <button
                className="bg-red-500 px-4 py-2 rounded"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </header>

      <div className={styles.container}>
        {/* 탭 전환 */}
        <div className="flex justify-center mb-4">
          <button
            className={`px-4 py-2 ${activeTab === "anonymous" ? "bg-blue-500 text-white" : "bg-gray-300"}`}
            onClick={() => setActiveTab("anonymous")}
          >
            Anonymous Rooms
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "authenticated" ? "bg-blue-500 text-white" : "bg-gray-300"}`}
            onClick={() => setActiveTab("authenticated")}
          >
            Authenticated Rooms
          </button>
        </div>

        {/* 익명방 UI */}
        {activeTab === "anonymous" && (
          <div>
            <h2 className="text-lg font-bold mb-4">Anonymous Rooms</h2>
            <input
              type="text"
              placeholder="Enter your nickname"
              className={styles.input}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
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
          </div>
        )}

        {/* 인증방 UI */}
        {activeTab === "authenticated" && isAuthenticated && (
          <div>
            <h2 className="text-lg font-bold mb-4">Authenticated Rooms</h2>
            <input
              type="text"
              placeholder="Enter your nickname"
              className={styles.input}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <button className={styles.button} onClick={createAuthenticatedRoom}>
              Create Authenticated Room
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
                Join Authenticated Room
              </button>
            </div>

            {/* 인증방 삭제 UI */}
            <div className="mt-6">
              <h2 className="text-lg font-bold mb-4">Your Rooms</h2>
              <ul>
                {userRooms.map((room) => (
                  <li key={room.id} className="mb-2 flex justify-between items-center">
                    <span>{room.id}</span>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded"
                      onClick={() => deleteAuthenticatedRoom(room.id)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
