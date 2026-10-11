import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

import { PrismaClient, UserRole } from "../src/generated/prisma/client";

async function main() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error("DATABASE_URL is missing.");
    }

    const adapter = new PrismaPg({
        connectionString: databaseUrl,
    });

    const prisma = new PrismaClient({
        adapter,
    });

    try {
        const username = "admin";
        const password = "Admin@123";

        const passwordHash = await bcrypt.hash(password, 12);

        const admin = await prisma.user.upsert({
            where: {
                username,
            },
            update: {
                fullName: "System Administrator",
                passwordHash,
                role: UserRole.ADMIN,
                isActive: true,
            },
            create: {
                fullName: "System Administrator",
                username,
                passwordHash,
                role: UserRole.ADMIN,
                isActive: true,
            },
        });

        console.log("Admin account created successfully.");
        console.log(`Username: ${admin.username}`);
        console.log(`Temporary password: ${password}`);
        console.log("Change this password after the first login.");
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((error: unknown) => {
    console.error("Failed to create Admin account:", error);
    process.exit(1);
});