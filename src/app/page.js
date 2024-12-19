"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [nickname, setNickname] = useState("");
  const [isInvite, setIsInvite] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const inviteRoomId = searchParams.get("roomId");
    const invite = searchParams.get("invite");
    if (invite && inviteRoomId) {
      setRoomId(inviteRoomId);
      setIsInvite(true);
    }
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">MOOINN Chat</h1>
      <input
        type="text"
        placeholder="Enter your nickname"
        className="border p-2 rounded mb-4"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      {!isInvite && (
        <>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
            onClick={createRoom}
          >
            Create Room
          </button>
          <div className="flex">
            <input
              type="text"
              placeholder="Enter Room ID"
              className="border p-2 rounded-l"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-green-500 text-white rounded-r"
              onClick={joinRoom}
            >
              Join Room
            </button>
          </div>
        </>
      )}
      {isInvite && (
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={joinRoom}
        >
          Join Room
        </button>
      )}
    </div>
  );
}
