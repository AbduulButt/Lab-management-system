import fs from "node:fs/promises";
import path from "node:path";

export async function loadReportLogoDataUrl() {
    try {
        const logoPath = path.join(
            process.cwd(),
            "public",
            "images",
            "life-care-lab-logo.png",
        );

        const buffer = await fs.readFile(logoPath);

        return `data:image/png;base64,${buffer.toString(
            "base64",
        )}`;
    } catch (error) {
        console.error(
            "Unable to load report logo:",
            error,
        );

        return null;
    }
}