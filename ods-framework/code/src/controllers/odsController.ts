/**
 * Copyright (c) 2025 Capital One
*/

import { Ods, CollectionNamesArray } from "../ods";
import express from "express";
import { Controller, Route, Get, Post, Delete, Body, Request, Path, Query, Example } from "tsoa";
import { Logger } from "dlms-server";
import { compress } from "lz-ts";
const log = new Logger("documentController");
const drainTimeout = parseInt("" + process.env["DRAIN_TIMEOUT"]) || 60000;

@Route("/api/service")
export class EtlLogController extends Controller {

    /**
     * Delete a specific log.
     * @param req
     * @param id - The log id
     */
    @Get("process/deleteLog/{id}")
    public async deleteLog(@Request() req: express.Request, @Path() id: string): Promise<any> {
        const mgr = Ods.getInstance();
        const ctx = mgr.getCtx(req);
        const etl = mgr.etl;
        if (!etl) {
        return req.res?.status(404).json({
            message: "ETL is not enabled",
        });
        }
        const r = await etl.deleteLog(ctx, id);
        return r;
    }

    /**
     * Delete all logs older than the specific date.
     * @param req
     * @param date - The date as a timestamp string
     */
    @Get("process/deleteLogs/{date}")
    public async deleteLogs(@Request() req: express.Request, @Path() date: string): Promise<any> {
        const mgr = Ods.getInstance();
        const ctx = mgr.getCtx(req);
        const etl = mgr.etl;
        if (!etl) {
        return req.res?.status(404).json({
            message: "ETL is not enabled",
        });
        }
        const r = await etl.deleteLogs(ctx, date);
        return r;
    }
}

interface GetRemoteCollectionNamesBody {
    odsUrl: string;
    user: string;
    pass: string;
}

interface ImportCollectionsBody extends GetRemoteCollectionNamesBody {
    names: CollectionNamesArray;
    encoding?: string;
    alwaysUpdate?: boolean;
    deleteCollection?: boolean;
}

@Route("/api/backup")
export class BackupController extends Controller {

    /**
     * Retrieve the collection names for all documents managed by the ODS.
     * @param req
     * 
     * @returns Array of collection names.
     */
    @Example<object>({})
    @Get("getCollectionNames")
    public async getCollectionNames(@Request() req: express.Request): Promise<string[]> {
        const mgr = Ods.getInstance();
        return await mgr.getCollectionNames(mgr.getCtx(req));
    }

    /**
     * Get all collection names from another ODS Server.
     * @param req
     * @param body - Body containing { odsUrl, user, pass }
     * 
     * @returns Array of collection names.
     */
    @Example<object>({ odsUrl: "http://localhost:3000", user: "employee", pass: "password" })
    @Post("getRemoteCollectionNames")
    public async getRemoteCollectionNames(@Request() req: express.Request, @Body() body: GetRemoteCollectionNamesBody): Promise<string[]> {

        const mgr = Ods.getInstance();
        const odsUrl = body.odsUrl || "";
        const user = body.user || "";
        const pass = body.pass || "";
        return await mgr.getRemoteCollectionNames(mgr.getCtx(req), odsUrl, user, pass);
    }

    /**
     * Get collection data for the names.
     * @param req
     * @param names - List of collection names as JSON array string
     * @param encoding - [Optional] Encoding to use (default is base64)
     * 
     * @returns Collection data.
     */
    @Get("getCollectionData")
    public async getCollectionData(@Request() req: express.Request, @Query() names: string, @Query() encoding?: string): Promise<any> {
        const mgr = Ods.getInstance();
        const namesArray: CollectionNamesArray = JSON.parse(names);
        return mgr.getCollectionData(mgr.getCtx(req), namesArray, encoding || "base64", req.res);
    }

    /**
     * Import collection data from another ODS Server.
     * @param req
     * @param body - Body containing { names, odsUrl, user, pass, encoding, alwaysUpdate, deleteCollection }
     * 
     * @returns Collection data
     */
    @Post("importCollections")
    public async importCollections(@Request() req: express.Request, @Body() body: ImportCollectionsBody): Promise<any> {
        const mgr = Ods.getInstance();
        const namesArray = body.names;
        const odsUrl = body.odsUrl;
        const user = body.user;
        const pass = body.pass;
        const encoding = body.encoding || "base64";
        const alwaysUpdate = body.alwaysUpdate;
        const deleteCollection = body.deleteCollection;
        return mgr.importCollections(mgr.getCtx(req), namesArray, odsUrl, user, pass, encoding, alwaysUpdate, deleteCollection);
    }
}

@Route("/api")
export class OdsController extends Controller {

    /**
     * Get the status of the ODS Server set by ETL processes.
     * @param req
     * 
     * @returns Status object.
     */
    @Get("status")
    public async odsStatus(@Request() req: express.Request): Promise<any> {
        const mgr = await Ods.getInstance();
        const status = await mgr.getStatus();
        return status;

    }

    /**
     * Get the roles for the current user.
     * @param req
     * 
     * @returns List of roles.
     */
    @Get("roles")
    public async roles(@Request() req: express.Request): Promise<any> {
        const mgr = await Ods.getInstance();
        const ctx = mgr.getCtx(req);
        const r = await mgr.getRoles(ctx);
        return r;
    }

    /**
     * Run the script with id.
     * @param req
     * @param id - Script document id
     * @param body - Body containing script parameters
     * 
     * @returns JSON object.
     */
    @Post("/script/run/{id}")
    public async runScriptId(@Request() req: express.Request, @Path() id: string, @Body() body: any) {
        const mgr = Ods.getInstance();
        const ctx = mgr.getCtx(req);
        const etl = mgr.etl;
        if (!etl) {
            return req.res?.status(404).json({
                message: "ETL is not enabled",
            });
        }
        const r = await mgr.runUserScriptId(ctx, id, body);
        // log.debug("r=", r);
        return r;
    }

    /**
     * Run the script.
     * @param req
     * @param id - Script document id
     * @param body - Body containing { script, parameters, stream }
     * 
     * @returns JSON object.
     */
    @Post("script/run")
    public async runScript(@Request() req: express.Request, @Body() body: any, @Query() type?: string) {
        const mgr = Ods.getInstance();
        const ctx = mgr.getCtx(req);
        const etl = mgr.etl;
        const sleep = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration));
        let count = 0;
        let origChars = 0;
        let sentChars = 0;
        let waitingForDrain = 0;
        let pause = 0;
        const doCompression = ("compress" == body.stream)

        const response = req.res;
        if (!etl) {
            return req.res?.status(404).json({
                message: "ETL is not enabled",
            });
        }
        if (response) {
            response.write(("").padStart(16, "0"));
            const keepAlive = setInterval(() => {
                response.write("".padStart(16, "0"));
            }, 15000);

            const x = await mgr.runUserScript(ctx, body);
            clearInterval(keepAlive);
            if (Array.isArray(x)) {
                for (const doc of x) {
                    const data1 = JSON.stringify(doc);
                    const data = doCompression ? compress(data1) : data1;
                    origChars += data1.length + 16;
                    sentChars += data.length + 16;
                    response.write(("" + data.length).padStart(16, "0"))
                    const r = response.write(data);

                    if (!r) {
                        waitingForDrain++;
                        pause = 10;
                        response.once("drain", () => {
                            pause = 0;
                        })
                    }
                    while (pause) {
                        pause = pause + 10;

                        if (pause > drainTimeout) {
                            log.debug("Error: Drain not received, so closing stream");
                            response.status(500);
                            return response.end();
                        }

                        await sleep(10);
                    }
                    count++;
                }
                response.write("".padStart(16, "-"));
                response.end();
                return count;
            }
            else {
                const type: string = typeof x;
                const _x = JSON.stringify({ type: type, value: x });
                const data = doCompression ? compress(_x) : _x;
                response.write("".padStart(16, "$"));
                response.write(data.length.toString().padStart(16, "0"));
                response.write(data)
                response.write("".padStart(16, "-"));
                response.end();
            }
        }
    }

    /**
     * Get all notebook variables for the notebook.
     * @param req
     * @param notebookId - The notebook id
     * 
     * @returns List of variable names.
     */
    @Get("notebook/getNotebookvars/{notebookId}")
    public async getNotebookvars(@Request() req: express.Request, @Path() notebookId: string): Promise<any> {
        const mgr = Ods.getInstance();
        const r = await mgr.getNotebookVars(notebookId);
        return r;
    }
    
    /**
     * Get the notebook variable.
     * @param req
     * @param notebookId - The notebook id
     * @param name 
     * 
     * @returns JSON object.
     */
    @Get("notebook/getNotebookvar/{notebookId}/{name}")
    public async getNotebookVar(@Request() req: express.Request, @Path() notebookId: string, @Path() name: string): Promise<any> {
        const mgr = Ods.getInstance();
        const r = await mgr.getNotebookVar(notebookId, name);
        return r;
    }

    /**
     * Get the notebook variable snapshot names for the notebook.
     * @param req
     * @param notebookId - The notebook id
     * 
     * @returns List of snapshot names.
     */
    @Get("notebook/getNotebookvarSnapshotNames/{notebookId}")
    public async processCommand2(@Request() req: express.Request, @Path() notebookId: string): Promise<any> {
        const mgr = Ods.getInstance();
        const r = await mgr.getNotebookVarsSnapshotNames(notebookId);
        return r;
    }

    /**
     * Restore the notebook variables to those values saved in snapshot.
     * @param req
     * @param notebookId - The notebook id
     * @param snapshotName - The snapshot name
     * 
     * @returns List of variable names restored.
     */
    @Get("notebook/restoreNotebookVarsSnapshot/{notebookId}/{snapshotName}")
    public async restoreNotebookVarsSnapshot(@Request() req: express.Request, @Path() notebookId: string, @Path() snapshotName: string): Promise<any> {
        const mgr = Ods.getInstance();
        const r = await mgr.restoreNotebookVarsSnapshot(notebookId, snapshotName);
        return r;
    }

    /**
     * Copy all notebook variables from one notebook to another.
     * @param req
     * @param fromNotebookId - The source notebook id
     * @param toNotebookId - The destination notebook name
     * 
     * @returns List of variable names copied.
     */
    @Get("notebook/copyNotebookvars/{fromNotebookId}/{toNotebookId}")
    public async copyNotebookvars(@Request() req: express.Request, @Path() fromNotebookId: string, @Path() toNotebookId: string): Promise<any> {
        const mgr = Ods.getInstance();
        const r = await mgr.copyNotebookVars(fromNotebookId, toNotebookId);
        return r;
    }

    /**
     * Set a notebook variable.
     * @param req
     * @param notebookId - The notebook id
     * @param name - The variable name
     * @body - Body containing variable value
     * 
     * @returns variable value.
     */
    @Post("notebook/setNotebookvar/{notebookId}/{name}")
    public async setNotebookvar(@Request() req: express.Request, @Path() notebookId: string, @Path() name: string, @Body() body: any): Promise<any> {
        const mgr = Ods.getInstance();
        const ctx = mgr.getCtx(req);
        const r = await mgr.setNotebookVar(notebookId, name, body);
        return r;
    }

    /**
     * Save a snapshot of the current notebook variables.
     * @param req
     * @param notebookId - The notebook id
     * @param snapshotName - The snapshot name
     * @body - Body containing { description }
     * 
     * @returns List of variable names saved.
     */
    @Post("notebook/saveNotebookVarsSnapshot/{notebookId}/{snapshotName}")
    public async saveNotebookVarsSnapshot(@Request() req: express.Request, @Path() notebookId: string, @Path() snapshotName: string, @Body() body: any): Promise<any> {
        const mgr = Ods.getInstance();
        const r = await mgr.saveNotebookVarsSnapshot(notebookId, snapshotName, body?.description || "");
        return r;
    }

    /**
     * Delete the notebook variable.
     * @param req
     * @param notebookId - The notebook id
     * @param name - The variable name
     */
    @Delete("notebook/deleteNotebookvar/{notebookId}/{name}")
    public async deleteNotebookVar(@Request() req: express.Request, @Path() notebookId: string, @Path() name: string): Promise<any> {
        const mgr = Ods.getInstance();
        const r = await mgr.deleteNotebookVar(notebookId, name);
        return r;
    }

    /**
     * Delete the notebook snapshot.
     * @param req
     * @param notebookId - The notebook id
     * @param snapshotName - The snapshot name
     */
    @Delete("notebook/deleteNotebookVarsSnapshot/{notebookId}/{snapshotName}")
    public async deleteNotebookVarsSnapshot(@Request() req: express.Request, @Path() notebookId: string, @Path() snapshotName: string): Promise<any> {
        const mgr = Ods.getInstance();
        const r = await mgr.deleteNotebookVarsSnapshot(notebookId, snapshotName);
        return r;
    }


} 