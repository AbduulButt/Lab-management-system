"use server";

import { Prisma, UserRole } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/authorization";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

export type UserActionState = {
    success: boolean;
    message: string;
};

const initialError: UserActionState = {
    success: false,
    message: "Unable to perform this action.",
};

function cleanText(
    value: FormDataEntryValue | null,
): string {
    return typeof value === "string"
        ? value.trim()
        : "";
}

function parseRole(
    value: FormDataEntryValue | null,
): UserRole | null {
    if (
        value === UserRole.ADMIN ||
        value === UserRole.RECEPTIONIST ||
        value === UserRole.TECHNICIAN
    ) {
        return value;
    }

    return null;
}

/* =========================================================
   CREATE USER
========================================================= */

export async function createUserAction(
    _previousState: UserActionState,
    formData: FormData,
): Promise<UserActionState> {
    try {
        const admin = await requireAdmin();

        const fullName = cleanText(
            formData.get("fullName"),
        );

        const username = cleanText(
            formData.get("username"),
        ).toLowerCase();

        const password = cleanText(
            formData.get("password"),
        );

        const role = parseRole(
            formData.get("role"),
        );

        if (!fullName) {
            return {
                success: false,
                message: "Full name is required.",
            };
        }

        if (!username) {
            return {
                success: false,
                message: "Username is required.",
            };
        }

        if (username.length < 3) {
            return {
                success: false,
                message:
                    "Username must contain at least 3 characters.",
            };
        }

        if (!password) {
            return {
                success: false,
                message: "Password is required.",
            };
        }

        if (password.length < 6) {
            return {
                success: false,
                message:
                    "Password must contain at least 6 characters.",
            };
        }

        if (!role) {
            return {
                success: false,
                message: "Please select a valid role.",
            };
        }

        const existingUser =
            await prisma.user.findUnique({
                where: {
                    username,
                },
                select: {
                    id: true,
                },
            });

        if (existingUser) {
            return {
                success: false,
                message:
                    "A user with this username already exists.",
            };
        }

        const passwordHash =
            await hashPassword(password);

        const createdUser =
            await prisma.$transaction(
                async (transaction) => {
                    const user =
                        await transaction.user.create({
                            data: {
                                fullName,
                                username,
                                passwordHash,
                                role,
                                isActive: true,
                            },
                        });

                    await transaction.auditLog.create({
                        data: {
                            userId: admin.id,
                            action: "CREATE",
                            entityType: "USER",
                            entityId: user.id,
                            description: `Created user account "${user.username}".`,
                            newValues: {
                                fullName: user.fullName,
                                username: user.username,
                                role: user.role,
                                isActive: user.isActive,
                            },
                        },
                    });

                    return user;
                },
            );

        revalidatePath("/portal/users");

        return {
            success: true,
            message: `${createdUser.fullName} was created successfully.`,
        };
    } catch (error) {
        console.error(
            "Create user error:",
            error,
        );

        if (
            error instanceof
            Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return {
                success: false,
                message:
                    "This username is already in use.",
            };
        }

        return {
            ...initialError,
            message:
                error instanceof Error
                    ? error.message
                    : initialError.message,
        };
    }
}

/* =========================================================
   UPDATE USER
========================================================= */

export async function updateUserAction(
    userId: string,
    formData: FormData,
): Promise<UserActionState> {
    try {
        const admin = await requireAdmin();

        const fullName = cleanText(
            formData.get("fullName"),
        );

        const username = cleanText(
            formData.get("username"),
        ).toLowerCase();

        const role = parseRole(
            formData.get("role"),
        );

        if (!userId) {
            return {
                success: false,
                message: "User ID is missing.",
            };
        }

        if (!fullName || !username || !role) {
            return {
                success: false,
                message:
                    "Full name, username and role are required.",
            };
        }

        const existingUser =
            await prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });

        if (!existingUser) {
            return {
                success: false,
                message: "User not found.",
            };
        }

        /*
         * Safety:
         * don't allow the logged-in admin
         * to remove their own ADMIN role.
         */
        if (
            admin.id === userId &&
            role !== UserRole.ADMIN
        ) {
            return {
                success: false,
                message:
                    "You cannot remove your own Administrator role.",
            };
        }

        const duplicateUsername =
            await prisma.user.findFirst({
                where: {
                    username,
                    id: {
                        not: userId,
                    },
                },
                select: {
                    id: true,
                },
            });

        if (duplicateUsername) {
            return {
                success: false,
                message:
                    "Another account already uses this username.",
            };
        }

        const updatedUser =
            await prisma.$transaction(
                async (transaction) => {
                    const user =
                        await transaction.user.update({
                            where: {
                                id: userId,
                            },
                            data: {
                                fullName,
                                username,
                                role,
                            },
                        });

                    await transaction.auditLog.create({
                        data: {
                            userId: admin.id,
                            action: "UPDATE",
                            entityType: "USER",
                            entityId: user.id,
                            description: `Updated user account "${user.username}".`,
                            oldValues: {
                                fullName:
                                    existingUser.fullName,
                                username:
                                    existingUser.username,
                                role: existingUser.role,
                            },
                            newValues: {
                                fullName: user.fullName,
                                username: user.username,
                                role: user.role,
                            },
                        },
                    });

                    return user;
                },
            );

        revalidatePath("/portal/users");

        return {
            success: true,
            message: `${updatedUser.fullName} was updated successfully.`,
        };
    } catch (error) {
        console.error(
            "Update user error:",
            error,
        );

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to update user.",
        };
    }
}

/* =========================================================
   ACTIVATE / DEACTIVATE
========================================================= */

export async function toggleUserStatusAction(
    userId: string,
): Promise<UserActionState> {
    try {
        const admin = await requireAdmin();

        if (admin.id === userId) {
            return {
                success: false,
                message:
                    "You cannot deactivate your own account.",
            };
        }

        const existingUser =
            await prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });

        if (!existingUser) {
            return {
                success: false,
                message: "User not found.",
            };
        }

        const newStatus =
            !existingUser.isActive;

        await prisma.$transaction(
            async (transaction) => {
                await transaction.user.update({
                    where: {
                        id: userId,
                    },
                    data: {
                        isActive: newStatus,
                    },
                });

                /*
                 * If account is deactivated,
                 * remove existing sessions immediately.
                 */
                if (!newStatus) {
                    await transaction.session.deleteMany({
                        where: {
                            userId,
                        },
                    });
                }

                await transaction.auditLog.create({
                    data: {
                        userId: admin.id,
                        action: newStatus
                            ? "ACTIVATE"
                            : "DEACTIVATE",
                        entityType: "USER",
                        entityId: userId,
                        description: `${newStatus
                                ? "Activated"
                                : "Deactivated"
                            } user account "${existingUser.username}".`,
                        oldValues: {
                            isActive:
                                existingUser.isActive,
                        },
                        newValues: {
                            isActive: newStatus,
                        },
                    },
                });
            },
        );

        revalidatePath("/portal/users");

        return {
            success: true,
            message: newStatus
                ? `${existingUser.fullName} has been activated.`
                : `${existingUser.fullName} has been deactivated.`,
        };
    } catch (error) {
        console.error(
            "Toggle user status error:",
            error,
        );

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to change account status.",
        };
    }
}

/* =========================================================
   RESET PASSWORD
========================================================= */

export async function resetUserPasswordAction(
    userId: string,
    newPassword: string,
): Promise<UserActionState> {
    try {
        const admin = await requireAdmin();

        const password =
            newPassword.trim();

        if (password.length < 6) {
            return {
                success: false,
                message:
                    "New password must contain at least 6 characters.",
            };
        }

        const existingUser =
            await prisma.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    id: true,
                    username: true,
                    fullName: true,
                },
            });

        if (!existingUser) {
            return {
                success: false,
                message: "User not found.",
            };
        }

        const passwordHash =
            await hashPassword(password);

        await prisma.$transaction(
            async (transaction) => {
                await transaction.user.update({
                    where: {
                        id: userId,
                    },
                    data: {
                        passwordHash,
                    },
                });

                /*
                 * Logout existing sessions.
                 * The user must login again
                 * using the new password.
                 */
                await transaction.session.deleteMany({
                    where: {
                        userId,
                    },
                });

                await transaction.auditLog.create({
                    data: {
                        userId: admin.id,
                        action: "UPDATE",
                        entityType: "USER",
                        entityId: userId,
                        description: `Reset password for user "${existingUser.username}".`,
                    },
                });
            },
        );

        revalidatePath("/portal/users");

        return {
            success: true,
            message: `Password for ${existingUser.fullName} was reset successfully.`,
        };
    } catch (error) {
        console.error(
            "Reset password error:",
            error,
        );

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to reset password.",
        };
    }
}