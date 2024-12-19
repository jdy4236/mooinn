"use client";

import { useState } from "react";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [nickname, setNickname] = useState("");

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 9);
    window.location.href = `/chat?roomId=${newRoomId}&nickname=${nickname}`;
  };

  const joinRoom = () => {
    if (roomId.trim() && nickname.trim()) {
      window.location.href = `/chat?roomId=${roomId}&nickname=${nickname}`;
    }
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
    </div>
  );
}
