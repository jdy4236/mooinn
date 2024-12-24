import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function GET(req) {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader && authHeader.split(" ")[1];

    const userId = authenticate(token); // JWT 인증
    if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try {
        const rooms = await prisma.room.findMany({
            where: { createdBy: userId }, // 요청자가 생성한 방만 조회
        });
        return new Response(JSON.stringify({ rooms }), { status: 200 });
    } catch (error) {
        console.error("Error fetching rooms:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
