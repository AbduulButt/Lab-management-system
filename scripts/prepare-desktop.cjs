const fs = require("node:fs");
const path = require("node:path");

const root = path.join(
    __dirname,
    "..",
);

const standalone =
    path.join(
        root,
        ".next",
        "standalone",
    );

function copy(
    source,
    destination,
) {
    if (!fs.existsSync(source)) {
        console.log(
            `Skipped: ${source}`,
        );

        return;
    }

    fs.mkdirSync(
        path.dirname(destination),
        {
            recursive: true,
        },
    );

    fs.cpSync(
        source,
        destination,
        {
            recursive: true,
            force: true,
        },
    );

    console.log(
        `Copied ${source}`,
    );
}

copy(
    path.join(
        root,
        "public",
    ),

    path.join(
        standalone,
        "public",
    ),
);

copy(
    path.join(
        root,
        ".next",
        "static",
    ),

    path.join(
        standalone,
        ".next",
        "static",
    ),
);

console.log(
    "Desktop build files prepared.",
);