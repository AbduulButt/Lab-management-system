const fs = require("node:fs");
const path = require("node:path");

exports.default = async function afterPack(context) {
    console.log("");
    console.log("===== AFTER PACK STARTED =====");

    const projectRoot =
        context.packager.projectDir;

    const source = path.join(
        projectRoot,
        ".next",
        "standalone",
    );

    const destination = path.join(
        context.appOutDir,
        "resources",
        "standalone",
    );

    console.log("Source:");
    console.log(source);

    console.log("Destination:");
    console.log(destination);

    console.log(
        "Source exists:",
        fs.existsSync(source),
    );

    if (!fs.existsSync(source)) {
        throw new Error(
            `Standalone source does not exist: ${source}`,
        );
    }

    if (fs.existsSync(destination)) {
        fs.rmSync(destination, {
            recursive: true,
            force: true,
        });
    }

    fs.mkdirSync(destination, {
        recursive: true,
    });

    fs.cpSync(
        source,
        destination,
        {
            recursive: true,
            force: true,
        },
    );

    const serverPath = path.join(
        destination,
        "server.js",
    );

    const nextPath = path.join(
        destination,
        "node_modules",
        "next",
    );

    console.log(
        "server.js copied:",
        fs.existsSync(serverPath),
    );

    console.log(
        "node_modules/next copied:",
        fs.existsSync(nextPath),
    );

    if (!fs.existsSync(serverPath)) {
        throw new Error(
            "server.js was not copied.",
        );
    }

    if (!fs.existsSync(nextPath)) {
        throw new Error(
            "node_modules/next was not copied.",
        );
    }

    console.log(
        "===== AFTER PACK COMPLETED =====",
    );
    console.log("");
};