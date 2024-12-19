const { createServer } = require("http");
const next = require("next");
const express = require("express");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const app = express(); // Express 초기화
  const server = createServer(app); // Express 서버를 HTTP 서버로 변환
  const io = new Server(server);

  // WebSocket 서버 설정
  const rooms = {};
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ roomId, nickname }) => {
    try {
      // 유효성 검사
      if (!roomId || !nickname) {
        socket.emit("error", { message: "Invalid room ID or nickname." });
        return;
      }

      // 방 정보 초기화
      if (!rooms[roomId]) {
        rooms[roomId] = [];
      }

      // 중복 닉네임 검사
      const isDuplicate = rooms[roomId].some((user) => user.nickname === nickname);
      if (isDuplicate) {
        socket.emit("duplicateNickname", { message: "Nickname already exists in this room." });
        return;
      }

      // 닉네임 추가 및 방 입장
      rooms[roomId].push({ id: socket.id, nickname });
      socket.join(roomId);

      // 사용자 목록 업데이트
      io.to(roomId).emit("roomUsers", rooms[roomId]);
    } catch (error) {
      console.error("Error in joinRoom:", error);
      socket.emit("error", { message: "An unexpected error occurred." });
    }
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter((user) => user.id !== socket.id);
      io.to(roomId).emit("roomUsers", rooms[roomId]);
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      }
    }
  });
});



  // 관리자용 REST API 엔드포인트 추가
  app.get("/admin/rooms", (req, res) => {
    const roomDetails = Object.keys(rooms).map((roomId) => ({
      roomId,
      users: rooms[roomId],
    }));
    res.json(roomDetails); // 활성화된 방 정보를 JSON으로 반환
  });

  // Next.js 요청 핸들링
  app.all("*", (req, res) => {
    return nextHandler(req, res); // Next.js로 요청 전달
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
