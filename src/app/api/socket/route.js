// src/app/api/socket/route.js

import { Server } from "socket.io";

export const config = {
    api: {
        bodyParser: false, // Socket.io는 자체적으로 파싱을 처리
    },
};

const ioHandler = (req, res) => {
    if (!res.socket.server.io) {
        console.log("Initializing Socket.io");

        const io = new Server(res.socket.server, {
            path: "/socket.io", // 클라이언트와 일치하도록 경로 설정
            addTrailingSlash: false,
            cors: {
                origin: "*", // 필요에 따라 특정 출처로 제한 가능
                methods: ["GET", "POST"],
            },
        });

        io.on("connection", (socket) => {
            console.log("A user connected:", socket.id);

            // 방 참가
            socket.on("joinRoom", ({ roomId, nickname }) => {
                socket.join(roomId);
                socket.nickname = nickname;
                console.log(`${nickname} joined room ${roomId}`);

                // 현재 방의 사용자 목록을 업데이트
                const users = Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
                    (id) => {
                        const s = io.sockets.sockets.get(id);
                        return s.nickname;
                    }
                );
                io.to(roomId).emit("roomUsers", users);
            });

            // 메시지 전송
            socket.on("message", ({ roomId, message, nickname, timestamp }) => {
                console.log(`Message from ${nickname} in room ${roomId}: ${message}`);
                io.to(roomId).emit("message", { nickname, message, timestamp });
            });

            socket.on("disconnect", () => {
                console.log("User disconnected:", socket.id);
                // 필요 시 사용자 목록 업데이트 로직 추가
            });
        });

        res.socket.server.io = io;
    } else {
        console.log("Socket.io already initialized");
    }
    res.end();
};

export default ioHandler;
