"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const response = await fetch("/admin/rooms");
      const data = await response.json();
      setRooms(data);
    };

    fetchRooms();

    const interval = setInterval(fetchRooms, 5000); // 5초마다 업데이트
    return () => clearInterval(interval); // 컴포넌트가 언마운트되면 정리
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {rooms.length === 0 ? (
        <p>No active rooms</p>
      ) : (
        <ul className="w-full max-w-lg">
          {rooms.map((room) => (
            <li key={room.roomId} className="mb-4 p-4 border rounded shadow bg-white">
              <h2 className="text-xl font-semibold mb-2">Room ID: {room.roomId}</h2>
              <h3 className="text-lg font-semibold">Users:</h3>
              <ul>
                {room.users.map((user) => (
                  <li key={user.id}>{user.nickname}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
