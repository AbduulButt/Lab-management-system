import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "lms_session";
const SESSION_DURATION_DAYS = 7;

function hashSessionToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = hashSessionToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

    await prisma.session.create({
        data: {
            userId,
            tokenHash,
            expiresAt,
        },
    });

    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
    });
}

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!rawToken) {
        return null;
    }

    const tokenHash = hashSessionToken(rawToken);

    const session = await prisma.session.findUnique({
        where: {
            tokenHash,
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    username: true,
                    role: true,
                    isActive: true,
                },
            },
        },
    });

    if (!session) {
        return null;
    }

    if (session.expiresAt <= new Date() || !session.user.isActive) {
        await prisma.session.delete({
            where: {
                id: session.id,
            },
        });

        return null;
    }

    await prisma.session.update({
        where: {
            id: session.id,
        },
        data: {
            lastUsedAt: new Date(),
        },
    });

    return session.user;
}

export async function deleteCurrentSession(): Promise<void> {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (rawToken) {
        const tokenHash = hashSessionToken(rawToken);

        await prisma.session.deleteMany({
            where: {
                tokenHash,
            },
        });
    }

    cookieStore.delete(SESSION_COOKIE_NAME);
}