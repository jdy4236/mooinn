"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";

let socket;

export default function AdminDashboard() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    // Socket.io 초기화
    socket = io("http://localhost:3000");

    // 서버로부터 방 목록 실시간 업데이트 받기
    socket.on("adminRooms", (data) => setRooms(data));

    // 새로고침 시 서버로부터 초기 방 목록 가져오기
    fetch("/admin/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch((err) => console.error("Failed to fetch rooms:", err));

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>
      {rooms.length === 0 ? (
        <p className="text-center text-gray-600">No active rooms</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.roomId}
              className="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">Room ID: {room.roomId}</h2>
              <h3 className="text-lg font-semibold mb-2">Users:</h3>
              <ul>
                {room.users.map((user) => (
                  <li key={user.id}>{user.nickname}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
