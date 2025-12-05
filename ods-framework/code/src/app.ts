/**
 * Copyright (c) 2025 Capital One
*/

const compression = require('compression');
import express from "express";
import * as path from "path";
import { Server, Config, Logger } from "dlms-server";
import swaggerUi from "swagger-ui-express";
import "./controllers/index";
import "./controllers/dfsServicesController";
import "./controllers/etlController";
import "./controllers/odsController";
import { RegisterRoutes } from "./routes";
import { Ods } from "./ods";
import { ValidateError } from "tsoa";
import { setupProxy } from "./proxyConfig";
setupProxy();
const axios = require("axios")
const { spawn } = require("child_process");
const log = new Logger("ods-app");
import { Role } from "ods-common";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
const dbApp = process.env["DB_APP"] || "ods";

const userLog:any = {}; // [email]: date
const accessLog: any = {}; // [url]: count // not sure if this is useful
let appMgr:Ods;

process.on('unhandledRejection', (reason: any, p: Promise<any>) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

process.on('uncaughtException', (error: Error) => {
    console.error(`Caught exception: ${error}\n` + `Exception origin: ${error.stack}`);
});

async function addCustomRoutes(app: express.Application) {
    // Can't read cookie in xhr from remote app, so add context to header so 
    // remote app can get the user info and roles
    app.use(async function handler(req: express.Request, res: express.Response, next: express.NextFunction) {
        const ctx = (req as any)._ctx;
        res.setHeader("ctx", JSON.stringify(ctx));
        next();
    });

    const shouldCompress = (req: express.Request, res: express.Response) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        console.log("Compressing result " + req.url);
        return compression.filter(req, res);
    };

    app.use(compression({
        filter: shouldCompress,
        threshold: 0
    }));

    app.get("/api/info", function (_req: express.Request, res: express.Response) {
        const port = process.env["PORT"];
        const baseUrl = process.env["BASE_URL"];
        const oauthEnabled = process.env["OAUTH_ENABLED"];
        const basicAuthEnabled = process.env["BASIC_AUTH_ENABLED"];
        const etlEnabled = process.env["ETL_ENABLED"];
        res.send({ baseUrl, port, oauthEnabled, basicAuthEnabled, dbApp, etlEnabled });
    });

    const swaggerDocument = require("../build/swagger.json");
    app.use("/api/ods-swagger", swaggerUi.serveFiles(swaggerDocument), swaggerUi.setup(swaggerDocument));

    RegisterRoutes(app);

    app.use(async function handler(req: express.Request, res: express.Response, next: express.NextFunction) {
        const url = req.originalUrl;
        const ctx = (req as any)._ctx;
        if (ctx?.user?.email) {
            const now = Date.now();
            // If user not found or not accessed in last 5 min, then log user
            if (!userLog[ctx.user.email] || (userLog[ctx.user.email] < (now - 5*60*1000))) {
                await appMgr.writeLog(ctx, "User logged in: " + ctx.user.email)
            }
            userLog[ctx.user.email] = now;
        }
        next();
    })

    app.use(function errorHandler(
        err: unknown,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ): express.Response | void {
        if (err instanceof ValidateError) {
          console.warn(`Caught Validation Error for ${req.path}:`, JSON.stringify(err.fields,null,4));
          console.warn("request was ", JSON.stringify(req.body,null,4))
          return res.status(422).json({
            message: "Validation Failed",
            details: err?.fields,
          });
        }
        if (err instanceof Error) {
            console.log("err =", err);
            console.log("err json =", JSON.stringify(err,null,4));
            const scode = (err as any).scode || 500;
            console.log(">>> scode =", scode);
            let message = err.message || "Internal Server Error";
            console.log(">>> message =", message);
            const statusText = err.name || "Internal Server Error";
            console.log(">>> statusText =", statusText);
            if (scode == 404) {
                message = "Not Found";
            }
            if (scode == 422) {
                return res.status(422).json({
                    statusText: "Validation Failed", 
                    message: message,
                  });
            }
            return res.status(scode).json({
                statusText: statusText,
                message: message,
            });
        }
      
        next();
      });

    if (process.env.NODE_ENV !== "production") {
        // Check if React dev server is running on PORT+1
        const port = parseInt(process.env["PORT"] || "3000");
        let reactPort = port + 1;
        let found = 0;
        while (found < 2) {
            try {
                log.info("Looking for React dev server on port", reactPort);
                const r = await axios.get(`http://127.0.0.1:${reactPort}`, { proxy: false } );
                // If found on port, then done
                if (r.data.indexOf("Ods") > -1) {
                    log.info("Found React Dev server running on port ", reactPort);
                    found = 2;
                }
                else {
                    reactPort++;
                }
            }
            catch (e) {
                if ((e as any).code == "ECONNREFUSED") {
                    log.info("Not running on port, so start it")
                    const subprocess = spawn(`cd src/ui && PORT=${reactPort} REACT_APP_SERVER=${port} REACT_APP_DB_APP=${dbApp} BROWSER=none npm run start`, {
                        shell: true,
                    });
                    subprocess.unref();
                    subprocess.stdout.on("data", (data:Buffer) => {
                        log.info("React: ", data.toString());
                    })
                    found = 2;
                }
                else {
                    log.info("Error:", e);
                    log.info("Error starting React Dev server - Exiting")
                    process.exit(1);
                }
            }
        }

        app.get('/*', async function (_req: express.Request, res: express.Response, next: express.NextFunction) {
            const url = _req.url;
            log.info(`GET ${url}`);

            // Get url
            const getUrl = async (url: string) => {
                try {
                    const r = await axios.get(`http://127.0.0.1:${reactPort}${url}`, { responseType: "arraybuffer", proxy: false });
                    const buffer = Buffer.from(r.data);
                    const contentType = r.headers["content-type"];
                    res.setHeader("content-type", contentType)
                    res.status(200).send(buffer); 
                    return true;
                }
                catch (e) {
                    log.info("e=",e);
                    return false;
                }
            }

            // If file with extension, then try to get file
            if (url.indexOf(".") > -1) {
                if (await getUrl(url)) { return }
            }

            // If no extension, then send to React dev server
            if (await getUrl("")) { return }

            // If not found, then try to get file
            if (await getUrl(url)) { return }

            // If still not found, then send to next handler
            next();
        });
    }
    else {
        let dirname = __dirname;
        const i = __dirname.indexOf("/build");
        if (i > -1) {
            dirname = __dirname.substring(0, i) + "/src/";
        }
        log.debug("dirname=",dirname);
        app.use(express.static(path.join(dirname, 'ui/build')));
        app.get('/*', function (_req: express.Request, res: express.Response) {
        res.sendFile(path.join(dirname, 'ui/build', 'index.html'));
        });
    }
}

export const users = [
    {
        id: "editor",
        name: "Editor",
        roles: [Role.Editor, Role.Employee],
        department: "Product Development",
        email: "requestor@test.com",
        title: "Project Lead",
        employeeNumber: "1234",
    },
    {
        id: "admin",
        name: "Admin",
        roles: [Role.Administrator],
        department: "Computer Room",
        email: "admin@test.com",
        title: "Tech Guru",
        employeeNumber: "3456",
    },
    {
        id: "employee",
        name: "Employee",
        roles: [Role.Employee],
        department: "Product Development",
        email: "reviewer@test.com",
        title: "Director",
        employeeNumber: "9876",
    },
];

async function main() {
    appMgr = await Ods.init();
    const userId = "employee";
    let user = users[0];
    for (const _user of users) {
        if (_user.id == userId) {
            user = _user;
        }
    }
    log.info("Default user=", user);
    await Server.run(appMgr, {addCustomRoutes, disabledAuthUser: user}); 
}

main();