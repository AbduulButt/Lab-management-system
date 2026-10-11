import "dotenv/config";

import { prisma } from "../src/lib/prisma";

async function addDoctor(doctorName: string) {
    const existingDoctor =
        await prisma.doctor.findFirst({
            where: {
                doctorName: {
                    equals: doctorName,
                    mode: "insensitive",
                },
            },
        });

    if (existingDoctor) {
        console.log(
            `${doctorName} already exists. Skipping.`,
        );

        return;
    }

    const doctor = await prisma.doctor.create({
        data: {
            doctorName,
            status: "ACTIVE",
        },
    });

    console.log(
        `Created doctor: ${doctor.doctorName}`,
    );
}

async function main() {
    await addDoctor("Dr Fayyaz Butt");
    await addDoctor("Dr Asma Fayyaz Butt");

    console.log("Doctor setup completed.");
}

main()
    .catch((error) => {
        console.error("Add doctors error:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });