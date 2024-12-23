// src/app/dashboard/page.js

"use client";

import { useEffect, useState } from "react";
import jwt from 'jsonwebtoken';

export default function Dashboard() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                setUser(decoded);
            } catch (error) {
                console.error("Invalid token");
            }
        }
    }, []);

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <p>Welcome, user {user.userId}!</p>
        </div>
    );
}
