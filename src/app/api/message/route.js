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

    // 요청 데이터 파싱
    const { roomId, content } = await req.json();
    if (!roomId || !content) {
        return new Response(JSON.stringify({ error: "Room ID and content are required" }), { status: 400 });
    }

    try {
        // 메시지 저장
        const message = await prisma.message.create({
            data: {
                roomId,
                senderId: userId,
                content,
            },
        });

        return new Response(JSON.stringify({ success: true, message }), { status: 201 });
    } catch (error) {
        console.error("Error saving message:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
