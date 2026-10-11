import UserManagement from "@/components/users/user-management";
import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
    const admin = await requireAdmin();

    const users = await prisma.user.findMany({
        orderBy: [
            {
                isActive: "desc",
            },
            {
                fullName: "asc",
            },
        ],

        select: {
            id: true,
            fullName: true,
            username: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
        },
    });

    const formattedUsers = users.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        role: user.role,
        isActive: user.isActive,

        lastLoginAt:
            user.lastLoginAt?.toISOString() ?? null,

        createdAt: user.createdAt.toISOString(),

        isCurrentUser: user.id === admin.id,
    }));

    return (
        <UserManagement users={formattedUsers} />
    );
}