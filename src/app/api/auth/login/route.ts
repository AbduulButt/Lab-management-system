import { NextResponse } from "next/server";

import { createSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

type LoginRequest = {
    username?: unknown;
    password?: unknown;
};

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as LoginRequest;

        const username =
            typeof body.username === "string"
                ? body.username.trim().toLowerCase()
                : "";

        const password =
            typeof body.password === "string" ? body.password : "";

        if (!username || !password) {
            return NextResponse.json(
                {
                    message: "Username and password are required.",
                },
                {
                    status: 400,
                },
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                username,
            },
        });

        if (!user || !user.isActive) {
            return NextResponse.json(
                {
                    message: "Invalid username or password.",
                },
                {
                    status: 401,
                },
            );
        }

        const passwordIsValid = await verifyPassword(
            password,
            user.passwordHash,
        );

        if (!passwordIsValid) {
            return NextResponse.json(
                {
                    message: "Invalid username or password.",
                },
                {
                    status: 401,
                },
            );
        }

        await prisma.session.deleteMany({
            where: {
                userId: user.id,
                expiresAt: {
                    lte: new Date(),
                },
            },
        });

        await createSession(user.id);

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                lastLoginAt: new Date(),
            },
        });

        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: "LOGIN",
                entityType: "USER",
                entityId: user.id,
                description: `${user.fullName} logged in.`,
            },
        });

        return NextResponse.json({
            message: "Login successful.",
        });
    } catch (error) {
        console.error("Login error:", error);

        return NextResponse.json(
            {
                message: "Unable to log in. Please try again.",
            },
            {
                status: 500,
            },
        );
    }
}