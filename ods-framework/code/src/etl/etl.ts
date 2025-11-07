/**
 * Copyright (c) 2025 Capital One
*/

import { Ods } from "../ods";
import { UserContext, Logger, throwErr, LogLevel } from "dlms-server";
import { STATUS,  logType, scriptType } from "ods-common";
import { Cron } from "croner";
import path from "node:path";
import Sandbox from "v8-sandbox";

const log = new Logger("etl", LogLevel.Debug);

const CRON_ENABLED = process.env["CRON_ENABLED"]?.toLowerCase() || "false";

// every 8 hrs starting at midnight (0, 8, 16)
const CRON_JOB_0 = process.env["CRON_JOB_0"] || "0 0/8 * * *"

// every 8 hrs starting at 2am (gives refresh 2 hr to finish) (2, 10, 18)
const CRON_JOB_1 = process.env["CRON_JOB_1"] || "0 2/8 * * *"

// every 8 hrs starting at 4am (gives refresh 2 hr to finish) (4, 12, 20)
const CRON_JOB_2 = process.env["CRON_JOB_2"] || "0 4/8 * * *"

// every 8 hrs starting at 6am (gives refresh 2 hr to finish) (8, 14, 22)
const CRON_JOB_3 = process.env["CRON_JOB_3"] || "0 6/8 * * *"

const GROUP_EDITOR = "Editor";

var DEBUG = false;
export function setDEBUG(b: boolean) {
    DEBUG = b;
}
export function isDEBUG() {
    return DEBUG;
}
var readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);
export function stopExecution(prompt: string) {
    return new Promise(resolve => {
        if (!DEBUG) {
            return resolve(true);
        }
        rl.question(`\n\n---> ${prompt}`, (input:string) => resolve(input));
    });
}

const sleep = (delay:number) => new Promise((resolve) => setTimeout(resolve, delay))

export class ETL {
    public static lockName = "etl";

    private static instance: ETL | undefined;
    mgr: Ods;
    ctx: any;

    constructor(mgr:Ods) {
        log.debug(`ETL constructor`)
        this.mgr = mgr;
    }

    /**
     * Sets the instance of DocMgr if it has not been set already.
     *
     * @param {DocMgr} instance - The instance of DocMgr to set
     * @returns {void}
     */
    public static setInstance(instance: ETL) {
        if (ETL.instance) {
            return throwErr(500, `ETL.setInstance has already been called`);
        }
        ETL.instance = instance;
    }

    /**
     * Get the instance of DocMgr.
     *
     * @returns {DocMgr} The instance of DocMgr
     */
    public static getInstance(mgr:Ods): ETL {
        log.debug(`ETL.getInstance()`)
        if (!ETL.instance) {
            const etl = new ETL(mgr);
            ETL.instance = etl;

            // Create cron jobs
            if (CRON_ENABLED == "true") {
                console.log("Creating cron jobs...")
                console.log("CRON_JOB_0 = ", CRON_JOB_0)
                console.log("CRON_JOB_1 = ", CRON_JOB_1)
                console.log("CRON_JOB_2 = ", CRON_JOB_2);
                console.log("CRON_JOB_3 = ", CRON_JOB_3)
                if (CRON_JOB_0) {
                    const name = "cronJob0";
                    const cronJob0 = new Cron(
                        CRON_JOB_0, { 
                            name: name,
                            catch: (e) => {
                                log.info(`Error running Job ${name}: `, e);
                            },
                            protect: (job) => {
                                log.info(`Job ${name} at ${new Date().toISOString()} was blocked by call started at ${job?.currentRun()?.toISOString()}`);
                            },
                        },
                        async (job: Cron) => {
                            console.log(`Job ${name} started at ${job?.currentRun()?.toISOString()}`);
                            const ctx = mgr.getAdminContext();

                            // If server is busy, then skip
                            let serverStatus = await etl.getServerStatus();
                            if (serverStatus && ![STATUS.STOPPED, STATUS.IDLE].includes(serverStatus)) { 
                                await etl.writeLog(ctx, `Server is busy so can't run job ${name}`);
                                return;
                            }

                            // Try to get lock
                            let lock = await mgr.getLock(ETL.lockName);
                            if (!lock) {
                                console.log(`Failed to get lock - cancelling job`)
                                await etl.writeLog(ctx,`Failed to get lock for ${name} - cancelling job`)
                            }
                            else {
                                await etl.writeLog(ctx,`Got lock for ${name} - running job`)

                                try {
                                    await etl.writeLog(ctx,`Run user scripts at start - Start`)
                                    log.info(`Running user scripts`)
                                    await etl.runScriptsFromCron(ctx, "0", "start");
                                    await etl.writeLog(ctx,`Run user scripts at start - Done`)
                                } catch (e) {
                                    log.info(`Error running user scripts at start:` + e);
                                    await etl.writeLog(ctx,`Run user scripts at start - Error: ` + e)
                                }
                                etl.setStatus(STATUS.IDLE, "Run user scripts at start", "Done");

                                if (mgr.etlConfig.cronJob0Start) {
                                    try {
                                        await etl.writeLog(ctx,`Run ods scripts at start - Start`)
                                        log.info(`Running ods scripts`)
                                        await mgr.etlConfig.cronJob0Start(ctx, etl, "0", "start");
                                        await etl.writeLog(ctx,`Run ods scripts at start - Done`)
                                    } catch (e) {
                                        log.info(`Error running ods scripts at start:` + e);
                                        await etl.writeLog(ctx,`Run ods scripts at start - Error: ` + e)
                                    }
                                    etl.setStatus(STATUS.IDLE, "Run ods scripts at start", "Done");
                                }

                                if (mgr.etlConfig.cronJob0End) {
                                    try {
                                        await etl.writeLog(ctx,`Run ods scripts at end - Start`)
                                        log.info(`Running ods scripts`)
                                        await mgr.etlConfig.cronJob0End(ctx, etl, "0", "end");
                                        await etl.writeLog(ctx,`Run ods scripts at end - Done`)
                                    } catch (e) {
                                        log.info(`Error running ods scripts at end:` + e);
                                        await etl.writeLog(ctx,`Run ods scripts at end - Error: ` + e)
                                    }
                                    etl.setStatus(STATUS.IDLE, "Run ods scripts at end", "Done");
                                }

                                try {
                                    await etl.writeLog(ctx,`Run user scripts at end - Start`)
                                    log.info(`Running user scripts at end`)
                                    await etl.runScriptsFromCron(ctx, "0", "end");
                                    await etl.writeLog(ctx,`Run user scripts at end - Done`)
                                } catch (e) {
                                    log.info(`Error running user scrdipts at end:` + e);
                                    await etl.writeLog(ctx,`Run user scripts at end - Error: ` + e)
                                }
                                etl.setStatus(STATUS.IDLE, "Run user scripts at end", "Done");

                                await mgr.clearLock(ETL.lockName)
                            }

                            console.log(`Job ${name} started at ${job?.currentRun()?.toISOString()} finished at ${new Date().toISOString()}`);
                        }
                    )
                }
                if (CRON_JOB_1) {
                    const name = "cronJob1";
                    const cronJob1 = new Cron(
                        CRON_JOB_1, { 
                            name: name,
                            catch: (e) => {
                                log.info(`Error running Job ${name}: `, e);
                            },
                            protect: (job) => {
                                log.info(`Job ${name} at ${new Date().toISOString()} was blocked by call started at ${job?.currentRun()?.toISOString()}`);
                            },
                        },
                        async (job: Cron) => {
                            console.log(`Job ${name} started at ${job?.currentRun()?.toISOString()}`);
                            const ctx = mgr.getAdminContext();

                            // If server is busy, then skip
                            let serverStatus = await etl.getServerStatus();
                            if (serverStatus && ![STATUS.STOPPED, STATUS.IDLE].includes(serverStatus)) { 
                                await etl.writeLog(ctx, `Server is busy so can't run job ${name}`);
                                return;
                            }

                            // Try to get lock
                            let lock = await mgr.getLock(ETL.lockName);
                            if (!lock) {
                                console.log(`Failed to get lock - cancelling job`)
                                await etl.writeLog(ctx,`Failed to get lock for ${name} - cancelling job`)
                            }
                            else {
                                await etl.writeLog(ctx,`Got lock for ${name} - running job`)

                                try {
                                    await etl.writeLog(ctx,`Run user scripts at start - Start`)
                                    log.info(`Running user scripts`)
                                    await etl.runScriptsFromCron(ctx, "1", "start");
                                    await etl.writeLog(ctx,`Run user scripts at start - Done`)
                                } catch (e) {
                                    log.info(`Error running user scripts at start:` + e);
                                    await etl.writeLog(ctx,`Run user scripts at start - Error: ` + e)
                                }
                                etl.setStatus(STATUS.IDLE, "Run user scripts at start", "Done");

                                if (mgr.etlConfig.cronJob1Start) {
                                    try {
                                        await etl.writeLog(ctx,`Run ods scripts at start - Start`)
                                        log.info(`Running ods scripts`)
                                        await mgr.etlConfig.cronJob1Start(ctx, etl, "1", "start");
                                        await etl.writeLog(ctx,`Run ods scripts at start - Done`)
                                    } catch (e) {
                                        log.info(`Error running ods scripts at start:` + e);
                                        await etl.writeLog(ctx,`Run ods scripts at start - Error: ` + e)
                                    }
                                    etl.setStatus(STATUS.IDLE, "Run ods scripts at start", "Done");
                                }

                                if (mgr.etlConfig.cronJob1End) {
                                    try {
                                        await etl.writeLog(ctx,`Run ods scripts at end - Start`)
                                        log.info(`Running ods scripts`)
                                        await mgr.etlConfig.cronJob1End(ctx, etl, "1", "end");
                                        await etl.writeLog(ctx,`Run ods scripts at end - Done`)
                                    } catch (e) {
                                        log.info(`Error running ods scripts at end:` + e);
                                        await etl.writeLog(ctx,`Run ods scripts at end - Error: ` + e)
                                    }
                                    etl.setStatus(STATUS.IDLE, "Run ods scripts at end", "Done");
                                }

                                try {
                                    await etl.writeLog(ctx,`Run user scripts at end - Start`)
                                    log.info(`Running user scripts at end`)
                                    await etl.runScriptsFromCron(ctx, "1", "end");
                                    await etl.writeLog(ctx,`Run user scripts at end - Done`)
                                } catch (e) {
                                    log.info(`Error running user scrdipts at end:` + e);
                                    await etl.writeLog(ctx,`Run user scripts at end - Error: ` + e)
                                }
                                etl.setStatus(STATUS.IDLE, "Run user scripts at end", "Done");

                                await mgr.clearLock(ETL.lockName)
                            }

                            console.log(`Job ${name} started at ${job?.currentRun()?.toISOString()} finished at ${new Date().toISOString()}`);
                        }
                    )
                }

                if (CRON_JOB_2) {
                    const name = "cronJob2";
                    const cronJob2 = new Cron(
                        CRON_JOB_2, { 
                            name: name,
                            catch: (e) => {
                                log.info(`Error running Job ${name}: `, e);
                            },
                            protect: (job) => {
                                log.info(`Job ${name} at ${new Date().toISOString()} was blocked by call started at ${job?.currentRun()?.toISOString()}`);
                            },
                        },
                        async (job: Cron) => {
                            console.log(`Job ${name} started at ${job?.currentRun()?.toISOString()}`);
                            const ctx = mgr.getAdminContext();

                            // If server is busy, then skip
                            let serverStatus = await etl.getServerStatus();
                            if (serverStatus && ![STATUS.STOPPED, STATUS.IDLE].includes(serverStatus)) { 
                                await etl.writeLog(ctx, `Server is busy so can't run job ${name}`);
                                return;
                            }

                            // Try to get lock
                            let lock = await mgr.getLock(ETL.lockName);
                            if (!lock) {
                                console.log(`Failed to get lock - cancelling job`)
                                await etl.writeLog(ctx,`Failed to get lock for ${name} - cancelling job`)
                            }
                            else {
                                await etl.writeLog(ctx,`Got lock for ${name} - running job`)

                                try {
                                    await etl.writeLog(ctx,`Run user scripts at start - Start`)
                                    log.info(`Running user scripts`)
                                    await etl.runScriptsFromCron(ctx, "3", "start");
                                    await etl.writeLog(ctx,`Run user scripts at start - Done`)
                                } catch (e) {
                                    log.info(`Error running user scripts at start:` + e);
                                    await etl.writeLog(ctx,`Run user scripts at start - Error: ` + e)
                                }
                                etl.setStatus(STATUS.IDLE, "Run user scripts at start", "Done");

                                if (mgr.etlConfig.cronJob2Start) {
                                    try {
                                        await etl.writeLog(ctx,`Run ods scripts at start - Start`)
                                        log.info(`Running ods scripts`)
                                        await mgr.etlConfig.cronJob2Start(ctx, etl, "2", "start");
                                        await etl.writeLog(ctx,`Run ods scripts at start - Done`)
                                    } catch (e) {
                                        log.info(`Error running ods scripts at start:` + e);
                                        await etl.writeLog(ctx,`Run ods scripts at start - Error: ` + e)
                                    }
                                    etl.setStatus(STATUS.IDLE, "Run ods scripts at start", "Done");
                                }

                                if (mgr.etlConfig.cronJob2End) {
                                    try {
                                        await etl.writeLog(ctx,`Run ods scripts at end - Start`)
                                        log.info(`Running ods scripts`)
                                        await mgr.etlConfig.cronJob2End(ctx, etl, "2", "end");
                                        await etl.writeLog(ctx,`Run ods scripts at end - Done`)
                                    } catch (e) {
                                        log.info(`Error running ods scripts at end:` + e);
                                        await etl.writeLog(ctx,`Run ods scripts at end - Error: ` + e)
                                    }
                                    etl.setStatus(STATUS.IDLE, "Run ods scripts at end", "Done");
                                }

                                try {
                                    await etl.writeLog(ctx,`Run user scripts at end - Start`)
                                    log.info(`Running user scripts at end`)
                                    await etl.runScriptsFromCron(ctx, "2", "end");
                                    await etl.writeLog(ctx,`Run user scripts at end - Done`)
                                } catch (e) {
                                    log.info(`Error running user scrdipts at end:` + e);
                                    await etl.writeLog(ctx,`Run user scripts at end - Error: ` + e)
                                }
                                etl.setStatus(STATUS.IDLE, "Run user scripts at end", "Done");

                                await mgr.clearLock(ETL.lockName)
                            }

                            console.log(`Job ${name} started at ${job?.currentRun()?.toISOString()} finished at ${new Date().toISOString()}`);
                        }
                    )
                }

                if (CRON_JOB_3) {
                    const name = "cronJob3";
                    const cronJob3 = new Cron(
                        CRON_JOB_3, { 
                            name: name,
                            catch: (e) => {
                                log.info(`Error running Job ${name}: `, e);
                            },
                            protect: (job) => {
                                log.info(`Job ${name} at ${new Date().toISOString()} was blocked by call started at ${job?.currentRun()?.toISOString()}`);
                            },
                        },
                        async (job: Cron) => {
                            console.log(`Job ${name} started at ${job?.currentRun()?.toISOString()}`);
                            const ctx = mgr.getAdminContext();

                            // If server is busy, then skip
                            let serverStatus = await etl.getServerStatus();
                            if (serverStatus && ![STATUS.STOPPED, STATUS.IDLE].includes(serverStatus)) { 
                                await etl.writeLog(ctx, `Server is busy so can't run job ${name}`);
                                return;
                            }

                            // Try to get lock
                            let lock = await mgr.getLock(ETL.lockName);
                            if (!lock) {
                                console.log(`Failed to get lock - cancelling job`)
                                await etl.writeLog(ctx,`Failed to get lock for ${name} - cancelling job`)
                            }
                            else {
                                await etl.writeLog(ctx,`Got lock for ${name} - running job`)

                                try {
                                    await etl.writeLog(ctx,`Run user scripts at start - Start`)
                                    log.info(`Running user scripts`)
                                    await etl.runScriptsFromCron(ctx, "3", "start");
                                    await etl.writeLog(ctx,`Run user scripts at start - Done`)
                                } catch (e) {
                                    log.info(`Error running user scripts at start:` + e);
                                    await etl.writeLog(ctx,`Run user scripts at start - Error: ` + e)
                                }
                                etl.setStatus(STATUS.IDLE, "Run user scripts at start", "Done");

                                if (mgr.etlConfig.cronJob3Start) {
                                    try {
                                        await etl.writeLog(ctx,`Run ods scripts at start - Start`)
                                        log.info(`Running ods scripts`)
                                        await mgr.etlConfig.cronJob3Start(ctx, etl, "3", "start");
                                        await etl.writeLog(ctx,`Run ods scripts at start - Done`)
                                    } catch (e) {
                                        log.info(`Error running ods scripts at start:` + e);
                                        await etl.writeLog(ctx,`Run ods scripts at start - Error: ` + e)
                                    }
                                    etl.setStatus(STATUS.IDLE, "Run ods scripts at start", "Done");
                                }

                                if (mgr.etlConfig.cronJob3End) {
                                    try {
                                        await etl.writeLog(ctx,`Run ods scripts at end - Start`)
                                        log.info(`Running ods scripts`)
                                        await mgr.etlConfig.cronJob3End(ctx, etl, "3", "end");
                                        await etl.writeLog(ctx,`Run ods scripts at end - Done`)
                                    } catch (e) {
                                        log.info(`Error running ods scripts at end:` + e);
                                        await etl.writeLog(ctx,`Run ods scripts at end - Error: ` + e)
                                    }
                                    etl.setStatus(STATUS.IDLE, "Run ods scripts at end", "Done");
                                }

                                try {
                                    await etl.writeLog(ctx,`Run user scripts at end - Start`)
                                    log.info(`Running user scripts at end`)
                                    await etl.runScriptsFromCron(ctx, "3", "end");
                                    await etl.writeLog(ctx,`Run user scripts at end - Done`)
                                } catch (e) {
                                    log.info(`Error running user scrdipts at end:` + e);
                                    await etl.writeLog(ctx,`Run user scripts at end - Error: ` + e)
                                }
                                etl.setStatus(STATUS.IDLE, "Run user scripts at end", "Done");

                                await mgr.clearLock(ETL.lockName)
                            }

                            console.log(`Job ${name} started at ${job?.currentRun()?.toISOString()} finished at ${new Date().toISOString()}`);
                        }
                    )
                }
            }

        }
        return ETL.instance;
    }

    /**
     * Write persistent log
     * 
     * @param message 
     * @returns 
     */
    public async writeLog(ctx: UserContext, message: string)  {
        const r = this.mgr.createDoc(ctx, logType, {
            key: "etl-log",
            value: message,
        })
        return r;
    }

    /**
     * Get all persistent logs
     * 
     * @returns array
     */
    public async getLogs(ctx: UserContext) {
        const r = await this.mgr.getDocs(ctx, logType, {match: { key: "etl-log" }});
        return r;
        /*const sorted = r.sort((o1:any, o2:any) => {
            return (o2.dateCreated - o1.dateCreated);
        });
        return sorted;*/
    }

    /**
     * Delete a persistent log entry
     * 
     * @param id 
     * @returns 
     */
    public async deleteLog(ctx: UserContext, id: string) {
        await this.assertIsAdminOrEditor(ctx);
        const r = await this.mgr.deleteDoc(ctx, {type: logType, id: id});
        return r;
    }

    /**
     * Delete a persistent log entries before date
     * 
     * @param date 
     * @returns 
     */
    public async deleteLogs(ctx: UserContext, date: string) {
        await this.assertIsAdminOrEditor(ctx);
        const logs = await this.mgr.getDocs(ctx,logType,{match: { key: "etl-log" }});
        for (const log of logs) {
            if (log.dateCreated <= date) {
                await this.mgr.deleteDoc(ctx, {type: logType, id: log.id});;
            }
        }
    }

    /**
     * Get the status of the ETL process
     * 
     * @returns 
     */
    public async getStatus() {
        return await this.mgr.getStatus(ETL.lockName);
    }

    /**
     * Get the server status field
     * 
     * @returns 
     */
    public async getServerStatus() {
        const serverStatus = await this.getStatus();
        return serverStatus?.status;
    }

    /**
     * Set the status of the ETL process
     * 
     * @param status 
     * @param command
     * @param comment 
     * @returns 
     */
    public async setStatus(status: string | null, command?: string, comment?: string) {
        return await this.mgr.setStatus(status, command, comment, ETL.lockName);
    }

    /**
     * Set the status comment of the ETL process
     * 
     * @param comment 
     */
    public async setStatusComment(comment?: string) {
        return await this.mgr.setStatusComment(comment, ETL.lockName);
    }

    /**
     * Stop currently running ETL process
     */
    public async stop() {
        log.debug(">>>> STOP")
        await this.mgr.stop(ETL.lockName);
    }

    /**
     * Run user scripts that are assigned to run periodically during a specific cron job.
     * 
     * @param cronJob - The cron job (0, 1, 2, 3)
     * @param runAt - Run at the start or end
     */
    public async runScriptsFromCron(ctx: UserContext, cronJob: string, runAt: string) {
        log.debug(`runScriptsFromCron(${cronJob}, ${runAt})`);
        try {
            const scripts = await this.mgr.getDocs(ctx, scriptType, {cronJob: cronJob, cronRunAt: runAt, type: "admin"}, {projection: {id:1, name:1}})
            if (scripts && scripts.length > 0) {
                for (const script of scripts) {
                    try {
                        console.log(`Running script ${script.id} - ${script.name}...`);
                        await this.mgr.runUserScriptId(ctx, script.id, {})
                        console.log(`Done running script ${script.id} - ${script.name}`);
                    } catch (e) {
                        console.log(`Error running script ${script.id} - ${script.name}:`, e);
                        await this.writeLog(ctx, `Error running cron script ${script.id} - ${script.name}:` + e);
                    }
                }
            }
        } catch (e) {
            log.err(`Error getting scripts for cron job ${cronJob} @ ${runAt}:`, e);
            await this.writeLog(ctx, `Error getting scripts for cron job ${cronJob} @ ${runAt}:` + e);
        }
    }

    public async runTestScript(ctx: UserContext, script: string, params?: any) {
        log.debug("runTestScript()");
        (global as any).ctx = ctx;
        (global as any).etl = this;

        const REQUIRE = this.mgr.sandboxFunctions || path.join(__dirname, 'adminSandboxFunctions.js');
        console.log("userScript REQUIRE=", REQUIRE);
        const sandbox = new Sandbox({ require: REQUIRE });

        const code = `
            log("Running script in sandbox - Start")
            try {
                
                ${script}

                const r = getSboms({params:{
                match: {
                    "metadata.component.name": {
                    $regex:".*axios.*", $options:"i"
                    }
                },
                options: {
                    projection: { id:1, "metadata.component.bom-ref":1 }
                }
                }});
                setResult({value: r});
                log("Running script in sandbox - Done")
            } catch (e) {
                log("Running script in sandbox - Error")
                log(e);
            }
        `;

        const { error, value } = await sandbox.execute({ 
            code, 
            timeout: 300000, 
            globals: { 
                ctx: ctx,
                params: params,
            } 
        });
        
        // await sandbox.shutdown();
        
        log.debug("runScript() returned =", Array.isArray(value) ? value[0] : value);
        return {
            message1: "Total number of sboms found: " + value.length,
            message2: "First sbom:",
            value: value[0]
        };
    }

    async assertIsAdminOrEditor(ctx: UserContext) {
        if (await this.mgr.isAdmin(ctx)) {
            return;
        }
        if (await this.mgr.isInUserGroups(ctx, [GROUP_EDITOR])) {
            return;
        }
        return throwErr(401, `Caller is not Admin or Editor`);
    }

}
