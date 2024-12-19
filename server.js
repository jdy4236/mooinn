const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server);

  // 각 방의 사용자 정보 저장
  const rooms = {};

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // 방 참가
    socket.on("joinRoom", ({ roomId, nickname }) => {
      console.log(`${nickname} joined room: ${roomId}`);

      // 방 정보 초기화
      if (!rooms[roomId]) {
        rooms[roomId] = [];
      }

      // 닉네임과 소켓 ID 저장
      rooms[roomId].push({ id: socket.id, nickname });

      socket.join(roomId);

      // 현재 방의 사용자 목록 업데이트
      io.to(roomId).emit("roomUsers", rooms[roomId]);
    });

    // 메시지 수신 및 방에 전달
    socket.on("message", ({ roomId, message, nickname }) => {
      console.log(`Message in room ${roomId} from ${nickname}: ${message}`);
      io.to(roomId).emit("message", { nickname, message });
    });

    // 연결 종료 처리
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);

      // 모든 방에서 해당 사용자 제거
      for (const roomId in rooms) {
        rooms[roomId] = rooms[roomId].filter((user) => user.id !== socket.id);

        // 업데이트된 사용자 목록 전달
        io.to(roomId).emit("roomUsers", rooms[roomId]);
      }
    });
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
