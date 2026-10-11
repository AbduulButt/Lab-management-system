const fs = require("node:fs");
function writeLog(message) {
    const logPath = path.join(
        app.getPath("userData"),
        "startup.log",
    );

    fs.appendFileSync(
        logPath,
        `[${new Date().toISOString()}] ${message}\n`,
    );
}
const {
    app,
    BrowserWindow,
} = require("electron");
app.disableHardwareAcceleration();
const {
    spawn,
} = require("node:child_process");

const path = require("node:path");
const http = require("node:http");

let mainWindow = null;
let nextServer = null;

const PORT = 3000;
const HOST = "127.0.0.1";

function getServerPath() {
    if (app.isPackaged) {
        return path.join(
            process.resourcesPath,
            "standalone",
            "server.js",
        );
    }

    return path.join(
        __dirname,
        "..",
        ".next",
        "standalone",
        "server.js",
    );
}

function waitForServer(
    url,
    attempts = 60,
) {
    return new Promise(
        (resolve, reject) => {
            let count = 0;

            const check = () => {
                count += 1;

                const request = http.get(
                    url,
                    (response) => {
                        response.resume();
                        resolve();
                    },
                );

                request.on(
                    "error",
                    () => {
                        if (count >= attempts) {
                            reject(
                                new Error(
                                    "Next.js server did not start.",
                                ),
                            );

                            return;
                        }

                        setTimeout(
                            check,
                            500,
                        );
                    },
                );
            };

            check();
        },
    );
}

function startNextServer() {
    const serverPath = getServerPath();

    writeLog(`Server path: ${serverPath}`);
    writeLog(
        `Server exists: ${fs.existsSync(serverPath)}`,
    );

    nextServer = spawn(
        process.execPath,
        [serverPath],
        {
            env: {
                ...process.env,
                ELECTRON_RUN_AS_NODE: "1",
                NODE_ENV: "production",
                PORT: String(PORT),
                HOSTNAME: HOST,
            },

            stdio: [
                "ignore",
                "pipe",
                "pipe",
            ],

            windowsHide: true,
        },
    );

    nextServer.stdout.on(
        "data",
        (data) => {
            writeLog(
                `Next stdout: ${data.toString()}`,
            );
        },
    );

    nextServer.stderr.on(
        "data",
        (data) => {
            writeLog(
                `Next stderr: ${data.toString()}`,
            );
        },
    );

    nextServer.on(
        "error",
        (error) => {
            writeLog(
                `Next spawn error: ${error.stack || error.message}`,
            );
        },
    );

    nextServer.on(
        "exit",
        (code) => {
            writeLog(
                `Next server exited with code ${code}`,
            );
        },
    );
}

async function createWindow() {
    startNextServer();

    await waitForServer(
        `http://${HOST}:${PORT}`,
    );

    mainWindow =
        new BrowserWindow({
            width: 1440,
            height: 900,

            minWidth: 1100,
            minHeight: 700,

            show: false,

            backgroundColor:
                "#f8fafc",

            autoHideMenuBar:
                true,

            webPreferences: {
                contextIsolation:
                    true,

                nodeIntegration:
                    false,
                sandbox: false,
            },
        });

    await mainWindow.loadURL(
        `http://${HOST}:${PORT}`,
    );

    mainWindow.maximize();

    mainWindow.show();

    mainWindow.on(
        "closed",
        () => {
            mainWindow = null;
        },
    );
}

app.whenReady().then(async () => {
    try {
        writeLog("Electron application started.");

        await createWindow();
    } catch (error) {
        writeLog(
            `Application startup error: ${error instanceof Error
                ? error.stack || error.message
                : String(error)
            }`,
        );

        app.quit();
    }
});

app.on(
    "window-all-closed",
    () => {
        if (nextServer) {
            nextServer.kill();
            nextServer = null;
        }

        app.quit();
    },
);

app.on(
    "before-quit",
    () => {
        if (nextServer) {
            nextServer.kill();
            nextServer = null;
        }
    },
);