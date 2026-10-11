import { NextResponse } from "next/server";

import { deleteCurrentSession, getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();

        if (user) {
            await prisma.auditLog.create({
                data: {
                    userId: user.id,
                    action: "LOGOUT",
                    entityType: "USER",
                    entityId: user.id,
                    description: `${user.fullName} logged out.`,
                },
            });
        }

        await deleteCurrentSession();

        return NextResponse.redirect(new URL("/login", request.url));
    } catch (error) {
        console.error("Logout error:", error);

        return NextResponse.json(
            {
                message: "Unable to log out.",
            },
            {
                status: 500,
            },
        );
    }
}