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

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // 방 참가
    socket.on("joinRoom", (roomId) => {
      console.log(`${socket.id} joined room: ${roomId}`);
      socket.join(roomId);
    });

    // 메시지 수신 및 특정 방에 메시지 전달
    socket.on("message", ({ roomId, message }) => {
      console.log(`Message in room ${roomId}: ${message}`);
      io.to(roomId).emit("message", message); // 해당 방에만 메시지 전달
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
