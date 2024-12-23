// server.js
import { createServer } from "http";
import next from "next";
import express from "express";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

await nextApp.prepare();

const app = express();
const server = createServer(app);
const io = new Server(server);

// 방 정보를 메모리에 저장
const rooms = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // 방 참가
  socket.on("joinRoom", ({ roomId, nickname }) => {
    console.log(`${nickname} joined room: ${roomId}`);

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    // 닉네임 중복 체크
    const isDuplicate = rooms[roomId].some((user) => user.nickname === nickname);
    if (isDuplicate) {
      socket.emit("nicknameError", { message: "Nickname already exists in this room." });
      return;
    }

    // 유저 추가
    rooms[roomId].push({ id: socket.id, nickname });
    socket.join(roomId);

    // 방 사용자 목록 업데이트
    io.to(roomId).emit("roomUsers", rooms[roomId]);

    // 관리자에게 방 정보 업데이트
    io.emit("adminRooms", getRoomDetails());
  });

  // 메시지 처리
  socket.on("message", ({ roomId, message, nickname, timestamp }) => {
    io.to(roomId).emit("message", { nickname, message, timestamp });
  });

  // 연결 종료 처리
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);

    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter((user) => user.id !== socket.id);

      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      } else {
        io.to(roomId).emit("roomUsers", rooms[roomId]);
      }
    }

    // 관리자에게 방 정보 업데이트
    io.emit("adminRooms", getRoomDetails());
  });
});

// 관리자 페이지 방 목록 API
app.get("/admin/rooms", (req, res) => {
  res.json(getRoomDetails());
});

app.all("*", (req, res) => {
  return nextHandler(req, res);
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`> Ready on http://localhost:${port}`);
});

// 방 정보 가져오기
function getRoomDetails() {
  return Object.keys(rooms).map((roomId) => ({
    roomId,
    users: rooms[roomId],
  }));
}
