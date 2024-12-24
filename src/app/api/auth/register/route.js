import prisma from '@/lib/prisma.js';
import bcrypt from 'bcrypt';

export async function POST(request) {
    const { nickname, email, password } = await request.json();

    if (!nickname || !email || !password) {
        return new Response(
            JSON.stringify({ error: 'All fields are required.' }),
            { status: 400 }
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                nickname,
                email,
                password: hashedPassword,
            },
        });

        return new Response(
            JSON.stringify({ success: true, user }),
            { status: 201 }
        );
    } catch (error) {
        if (error.code === 'P2002') {
            // 고유 제약 조건 위반 (중복 에러)
            return new Response(
                JSON.stringify({ error: 'Email or nickname already exists.' }),
                { status: 409 }
            );
        }

        console.error("Error during user registration:", error); // 콘솔에 에러 출력
        return new Response(
            JSON.stringify({ error: 'Internal server error.', details: error.message }),
            { status: 500 }
        );
    }
}
