import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function POST(req) {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader && authHeader.split(" ")[1];

    // JWT 인증
    const userId = authenticate(token);
    if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // 요청에서 roomId 추출
    const { roomId } = await req.json();
    if (!roomId) {
        return new Response(JSON.stringify({ error: "Room ID is required" }), { status: 400 });
    }

    try {
        // 방 정보 데이터베이스에 저장
        const room = await prisma.room.create({
            data: {
                id: roomId,           // 방 ID
                type: "AUTHENTICATED", // 방 유형
                createdBy: userId,    // 방 생성자 ID
            },
        });

        // 성공 응답
        return new Response(JSON.stringify({ success: true, room }), { status: 201 });
    } catch (error) {
        console.error("Error creating authenticated room:", error);

        // 방 ID 중복 에러 처리
        if (error.code === 'P2002') {
            return new Response(JSON.stringify({ error: "Room ID already exists" }), { status: 409 });
        }

        // 기타 에러 처리
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
