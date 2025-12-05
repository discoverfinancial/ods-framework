/**
 * Copyright (c) 2025 Capital One
*/

import { 
    DocMgr, 
    UserContext, 
    Logger, 
    throwErr, 
    StateCallbackContext, 
    PersonWithId, 
    EmailAttachment, 
    Documents, 
    DocType, 
    sleep, 
    Config,
    User,
    formatDateTime,
    DocMgrCreateArgs
} from "dlms-server";
import {
    sbomType,
    storeType,
    queryType,
    logType,
    summaryProjection,
    apitokenType,
    apikeyType,
    scriptType,
    notebookvarType, 
    guidanceType,
    attestationType,
    attestationDefinitionType,
    GuidanceUpdated,
    AttestationDefinitionInfo,
    notebookvarStates,
    notebookvarRoles,
} from "ods-common";
import {
    sbomStates, Role, 
    storeStates, storeRoles,
    queryStates, queryRoles,
    scriptStates,
    scriptRoles,
    guidanceStates,
    attestationStates, attestationRoles,
    attestationDefinitionStates, attestationDefinitionRoles,
} from "ods-common";
import axios from "axios";
import { createBomRef } from "ods-common";
import { ObjectId } from 'mongodb';
import { ETL } from "./etl/etl";
import express from 'express';
import {
    validateApitoken,
    validateApikey,
    validateLog,
    validateQuery,
    validateSbom,
    validateScript,
    validateStore,
    validateGuidance,
    validateAttestation,
    validateAttestationDefinition,
} from "./validate";
import * as crypto from "node:crypto";

const http = require("http");
const https = require("https");
var fs = require("fs");
var os = require("os");
var path = require("path");
import { jsonrepair } from 'jsonrepair';
import Sandbox from 'v8-sandbox';
import Cluster from 'v8-sandbox';
import { EtlProfileService } from "./etl/EtlProfileService";

const log = new Logger("ods");
const config = new Config();

const GROUP_ADMIN = "Admin";
const GROUP_EDITOR = "Editor";
const GROUP_TESTER = "Tester";

const emailEnabled = process.env.EMAIL_ENABLED === 'true';
const emailDebug = process.env.EMAIL_DEBUG;
const adminEmail = process.env["ADMIN_EMAIL"] || "";
const dbApp = process.env["DB_APP"] || "ods";
const etlEnabled = process.env.ETL_ENABLED === 'true';

const port = parseInt(process.env["PORT"] || "3000");
const baseUrl = process.env["BASE_URL"] || "http://localhost:" + port;
const useNotebookVarsInFile = process.env["USE_NOTEBOOKVARS_IN_FILE"] === "true" || false; // Use notebook variables in file system instead of MongoDB
const DATA_DIR = process.env["DATA_DIR"] || "data"; // Default data directory

export const defaultUser: User = {
    id: "employee",
    roles: [
        Role.Employee,
    ],
    name: "User",
    department: "",
    email: "",
    title: "User",
    employeeNumber: "",
};

export interface CollectionDataQuery {
    name: string;
    match?: any;
    options?: any;
}

export type CollectionNamesArray = CollectionDataQuery[];

export type DocumentProcessor = (self: Ods, ctx: UserContext, collectionName: string, doc: any, alwaysUpdate: boolean) => Promise<boolean>;

export interface EtlConfig {
    cronJob0Start?(ctx: UserContext, etl: ETL, cronJob: string, runAt: string): Promise<any>;
    cronJob0End?(ctx: UserContext, etl: ETL, cronJob: string, runAt: string): Promise<any>;
    cronJob1Start?(ctx: UserContext, etl: ETL, cronJob: string, runAt: string): Promise<any>;
    cronJob1End?(ctx: UserContext, etl: ETL, cronJob: string, runAt: string): Promise<any>;
    cronJob2Start?(ctx: UserContext, etl: ETL, cronJob: string, runAt: string): Promise<any>;
    cronJob2End?(ctx: UserContext, etl: ETL, cronJob: string, runAt: string): Promise<any>;
    cronJob3Start?(ctx: UserContext, etl: ETL, cronJob: string, runAt: string): Promise<any>;
    cronJob3End?(ctx: UserContext, etl: ETL, cronJob: string, runAt: string): Promise<any>;
}
export interface OdsCreateArgs extends DocMgrCreateArgs {
    userProfileService: EtlProfileService;
    etlConfig?: EtlConfig;
    sandboxFunctions?: string;
}

type DocTypeOptional = Partial<DocType>

export const historyCommentsOwner: DocTypeOptional = {
    createdState: "created",
    includeDateCreated: true,
    includeDateUpdated: true,
    includeStateHistory: true,
    includeComments: true,
    includeOwner: true,
    extraCreateArgs: {schemaVersion: "1"},
}

export const historyComments: DocTypeOptional = {
    createdState: "created",
    includeDateCreated: true,
    includeDateUpdated: true,
    includeStateHistory: true,
    includeComments: true,
    extraCreateArgs: {schemaVersion: "1"},
}

const appDocuments: Documents = {
    [sbomType]: { 
        states: sbomStates,
        ...historyComments,
        extraCreateArgs: {
            bomFormat: "CycloneDX",
            specVersion: "1.6",
        },
        defaultProjection: {
            ...summaryProjection
        },
        modifyProjection(type, queryProjection) {
            // Add projection fields needed for to calculate _vulnerabilities and _compositions fields 
            // that return count of vulnerabilities & compositions in toSummary()
            if (queryProjection) {
                if ((!queryProjection.vulnerabilities) && (queryProjection._vulnerabilities)) {
                    queryProjection['vulnerabilities'] = 1
                }
                if ((!queryProjection.compositions) && (queryProjection._compositions)) {
                    queryProjection['compositions'] = 1
                }
            }
            return queryProjection;
        },
        globalReadAccess: true,
        toSummary(type, doc, originalProjection, copy) {
            if (copy) {
                doc = JSON.parse(JSON.stringify(doc));
            }
    
            // Add _compositions if in original projection & delete compositions if not in original projection
            if (originalProjection._compositions && doc.compositions) {
                doc._compositions = doc.compositions[0]?.assemblies.length;
                if (!originalProjection.compositions) {
                    delete doc.compositions;
                }
            }
    
            // Add _vulnerabilities if in original projection & delete vulnerabilities if not in original projection
            if (originalProjection._vulnerabilities && doc.vulnerabilities) {
                doc._vulnerabilities = doc.vulnerabilities.length;
                if (!originalProjection.vulnerabilities) {
                    delete doc.vulnerabilities;
                }
            }
    
            return doc;
            },
        async onPostCreate(mgr, ctx, type, doc) {
            // If metadata.component.bom-ref missing id, then add it
            if (!doc.metadata) {
                doc.metadata = {};
            }
            if (!doc.metadata.component) {
                doc.metadata.component = {};
            }
            if (!doc.metadata.component["bom-ref"] || (typeof doc.metadata.component["bom-ref"] == "string")) {
                doc.metadata.component["bom-ref"] = createBomRef(doc.metadata.component);
            }
            if (!doc.metadata.component["bom-ref"].id) {
                const id = doc.id.toString();
                doc.metadata.component["bom-ref"].id = id;
                const pc = await mgr.getDocCollection(sbomType);
                await pc.updateOne(mgr.idFilter(doc.id), mgr.toMongoUpdate({ "metadata.component.bom-ref": doc.metadata.component["bom-ref"] }));
                const _rtn = await pc.findOne(mgr.idFilter(doc.id));
                if (!doc) {
                    return throwErr(400, `error creating document`);
                }
                doc = mgr.toInfo(_rtn, false);
            }
            log.debug(`SBOM created: ${JSON.stringify(doc, null, 4)}`);
            return doc;
        },
        onUpdate(mgr, ctx, ds, args) {
            // If metadata.component changed, then update bom-ref
            const c = args.metadata?.component;
            if (c) {
                args.metadata.component["bom-ref"] = createBomRef(c, ds.id);
            }
            return args;
        },
        validate: validateSbom,
    },
    [queryType]: { 
        states: queryStates, 
        docRoles: queryRoles,
        ...historyCommentsOwner,
        validate: validateQuery,
    },
    [scriptType]: { 
        states: scriptStates, 
        docRoles: scriptRoles,
        ...historyCommentsOwner,
        validate: validateScript,
        onCreate(mgr, ctx, type, doc) {
            if (doc.type == "admin") {
                if (!ctx.isAdmin) {
                    doc.type = "user";
                }
            }
            return doc;
        },
    },
    [storeType]: { 
        states: storeStates, 
        docRoles: storeRoles,
        ...historyCommentsOwner,
        validate: validateStore,
    },
    [logType]: { 
        states: storeStates, 
        docRoles: storeRoles,
        ...historyCommentsOwner,
        globalReadAccess: true,
        validate: validateLog,
    },
    [notebookvarType]: { 
        states: notebookvarStates, 
        docRoles: notebookvarRoles,
    },
    [apitokenType]: {
        states: storeStates,
        docRoles: storeRoles,
        ...historyCommentsOwner,
        validate: validateApitoken,
        onCreate: async function (mgr, ctx, type, doc) {
            return {value: crypto.randomBytes(16).toString('hex'), public: false, ...doc}
        },
    },
    [apikeyType]: {
        states: storeStates,
        docRoles: storeRoles,
        createdState: "created",
        includeDateCreated: true,
        includeDateUpdated: true,
        includeStateHistory: true,
        extraCreateArgs: {schemaVersion: "1"},
        validate: validateApikey,
        onPostCreate: async function (mgr, ctx, type, doc) {
            await (mgr as Ods).updateApikeyEnv();
        },
        onPostDelete: async function (mgr, ctx, type, doc) {
            await (mgr as Ods).updateApikeyEnv();
        },
        onPostUpdate: async function (mgr, ctx, type, doc) {
            await (mgr as Ods).updateApikeyEnv();
        },
    },
    [guidanceType]: { 
        states: guidanceStates,
        ...historyComments,
        globalReadAccess: true,
        onCreate(mgr, ctx, type, doc) {
            doc.updatedBy = [{
                date: Date.now(),
                user: ctx.user,
            }];
            return doc;
        },
        onUpdate(mgr, ctx, ds, args) {
            const updatedBy: GuidanceUpdated = {
                date: Date.now(),
                user: ctx.user,
            }
            args["$push"].updatedBy = updatedBy;
            return args;
        },
        validate: validateGuidance,
    },
    [attestationType]: { 
        states: attestationStates, 
        docRoles: attestationRoles,
        ...historyComments,
        globalReadAccess: true,
        validate: validateAttestation,
    },
    [attestationDefinitionType]: { 
        states: attestationDefinitionStates, 
        docRoles: attestationDefinitionRoles,
        ...historyCommentsOwner,
        createdState: "inactive",
        validate: validateAttestationDefinition,
    },



}

export class Ods extends DocMgr {
    public etl: ETL | undefined;
    public serverDocCollection: any;
    public notebookvarCollection: any;
    public apikeyCollection: any;
    // public sandbox: Cluster;
    public sandboxFunctions: string | undefined;
    public etlConfig: any;

    /**
     * Initialize the Ods instance and set up indexes.
     * @param simpleInit Optional flag for simple initialization.
     * @returns {Promise<Ods>} The initialized Ods instance.
     */
    //@NOTE: This is used by cli.ts
    public static async init(simpleInit?: boolean): Promise<Ods> {
        log.debug(`Initializing ods manager`);
        const pm = Ods.getInstance();
        if (etlEnabled) {
            log.debug(`ETL Enabled`)
            pm.etl = ETL.getInstance(pm as any);
        }
        else {
            log.debug(`ETL Disabled`)
        }
        DocMgr.setInstance(pm);
        await pm.init(simpleInit);
        log.debug(`Finished initializing ods manager`);

        return pm;
    }

    /**
     * Get the singleton instance of Ods.
     * @returns {Ods} The Ods instance.
     */
    public static getInstance(): Ods {
        return DocMgr.getInstance() as Ods;
    }

    constructor(args: OdsCreateArgs) {
        console.log("Ods constructor() args=", args.userProfileService);
        super({
            appName: args.appName || dbApp,
            documents: {...appDocuments, ...args.documents},
            adminGroups: args.adminGroups || [GROUP_ADMIN],
            email: args.email || adminEmail,
            userGroups: args.userGroups || [
                { id: GROUP_ADMIN, deletable: false },
                { id: GROUP_EDITOR, deletable: false },
                { id: GROUP_TESTER, deletable: false },
            ],
            adminRole: args.adminRole || GROUP_ADMIN,
            roles: args.roles || [],
            userProfileService: args.userProfileService,
        });
        this.etlConfig = args.etlConfig || {};
        this.sandboxFunctions = args.sandboxFunctions;
    }

    /**
     * Get the user profile service.
     * 
     * @returns {EtlProfileService} The user profile service.
     */
    public getUserProfileService(): EtlProfileService {
        return this.userProfileService as EtlProfileService;
    }

    /**
     * Log out the current user context.
     * @param ctx The user context.
     */
    public logout(ctx: UserContext) {
        this.getUserProfileService().logout(ctx);
    }

    /**
     * Called when initialization is completed.
     * Performs migration and cleanup tasks.
     */
    public async onInit() {
        log.debug("Ods onInit() called");
        log.debug(`Mongo URL = ${this.getMongoUrl()}`)
        await this.updateApikeyEnv();
        await this.writeLog(this.getAdminContext(), "Ods has been started");
    }

    /**
     * Express middleware to allow cross-domain requests (CORS).
     * @param _req Express request object.
     * @param res Express response object.
     * @param next Next middleware function.
     */
    public allowCrossDomain(_req: express.Request, res: express.Response, next: express.NextFunction) {
        console.log("ODS allowCrossDomain()")
        let authRequest = false;
        if (_req.headers?.['access-control-request-headers']?.includes('authorization') || _req.headers?.authorization) {
            authRequest = true;
        }

        const originHeader = _req.headers?.origin || config.corsOrigin;
        res.header('Access-Control-Allow-Origin', originHeader);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
        res.header('Access-Control-Request-Headers', '*');
        if (authRequest) {
            res.header('Access-Control-Allow-Headers', 'authorization,content-type,ctx,no-auth-user');
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Expose-Headers', 'content-type,ctx,no-auth-user');
        }
        else {
            res.header('Access-Control-Allow-Headers', '*');
            res.header('Access-Control-Expose-Headers', '*');
        }

        next();
    }

    /**
     * Get roles for the current user context.
     * @param ctx The user context.
     * @returns {Promise<string[]>} Array of role names.
     */
    public async getRoles(ctx: UserContext): Promise<string[]> {
        const result = [Role.Employee];
        if (await this.isAdmin(ctx)) {
            result.push(Role.Administrator)
        }
        if (await this.isInUserGroups(ctx, [GROUP_EDITOR])) {
            result.push(Role.Editor)
        }
        return result;
    }

    public async getNotebookvarCollection() {
        if (!this.notebookvarCollection) {
            this.notebookvarCollection = await this.getCollection(dbApp + "." + notebookvarType + ".doc");
        }
        return this.notebookvarCollection;
    }

    /**
     * Run arbitrary JavaScript inside sandbox
     * 
     * @param ctx
     * @param script 
     */
    public async runUserScriptId(ctx: UserContext, id: string, data: any) {
        log.debug(`runUserScriptId(${id})`);
        const r = await this.getDoc(ctx, {type: scriptType, id: id})
        let p = {};
        if (data.parameters) {
            p = data.parameters;
        }
        else if (r.parameters) {
            try {
                const _p = jsonrepair(r.parameters);
                p = JSON.parse(_p);
            } catch (e) {
                log.warn(`runUserScriptId: Error parsing default parameters =${r.parameters} =`, e);
                p = {};
            }            
        }
        if (r) {
            const res = await this.runUserScript(ctx, {script: r.script, parameters: p});
            return res;
        }
    }

    /**
     * Run arbitrary JavaScript inside sandbox that is safe for any user to run
     * 
     * @param ctx
     * @param script 
     */
    public async runUserScript(ctx: UserContext, data: any) {
        log.debug("runUserScript()")
        const REQUIRE = this.sandboxFunctions || path.join(__dirname, 'adminSandboxFunctions.js');
        console.log("userScript REQUIRE=", REQUIRE);
        const sandbox = new Sandbox({ 
            require: REQUIRE,
        });
        // const sandbox = new Cluster({ 
        //     require: REQUIRE,
        // });


        // Remove awaits from script
        const _script = data.script;
        console.log("_script=", _script);
        console.log("Setting global.ctx =", ctx);
        (global as any).ctx = ctx;
        (global as any).etl = this.etl;
        (global as any).mgr = this;
        (global as any).notebook = "my notebook";
        (global as any).cell = {};

        const code = `
            async function start() {
                log("Running user script in sandbox - Start")
                try {
                    ${_script}
                    log("Running user script in sandbox - Done")
                } catch (e) {
                    log("Running user script in sandbox - Error")
                    log(""+e);
                    setResult({error: ""+e});
                }
            }
            start();
        `;

        const { error, value } = await sandbox.execute({ 
            code, 
            timeout: 300000, 
            globals: { 
                ctx: ctx,
                parameters: data.parameters || {},
            } 
        });
        
        await sandbox.shutdown();
        
        log.debug("runUserScript() returned =", Array.isArray(value) ? value[0] : value);
        log.debug("runUserScript() returned error =", error);
        return error ? {error: error} : value;
    }

    /**
     * Run attestation definition JavaScript for generating attestations inside sandbox
     * 
     * @param ctx
     * @param script 
     */
    public async runAttestationScript(ctx: UserContext, def:AttestationDefinitionInfo, params?: any) {
        log.debug("runAttestationScript()");
        (global as any).ctx = ctx;
        (global as any).etl = this;
        (global as any).parameters = params;

        const REQUIRE = path.join(__dirname, 'adminSandboxFunctions.js');
        console.log("userScript REQUIRE=", REQUIRE);
        const sandbox = new Sandbox({ require: REQUIRE });

        // Remove awaits from script
        const _script = def.script.replace(/await /g, "");
        console.log("_script=", _script);

        const code = `
            log("Running script in sandbox - Start")
            try {
                
                ${_script}

                log("Running script in sandbox - Done")
                setResult({value: "ok"})
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
                definition: def,
                params: params,
            } 
        });
        
        // await sandbox.shutdown();
        
        log.debug("runAttestationScript() returned =", Array.isArray(value) ? value[0] : value);
        log.debug("runAttestationScript() returned error =", error);
        return value;
    }

    /**
     * Get names all notebook vars from database
     * 
     * @param notebookId 
     * @returns {key: value} Object of all notebook vars with key = variable name
     */
    async getNotebookVars(notebookId: string) {
        console.log(`getNotebookVars(${notebookId})`);
        if (!notebookId) {
            return;
        }

        // If using file system for notebook variables
        if (useNotebookVarsInFile) {
            try {
                const dir = `${DATA_DIR}/notebook/${notebookId}`;
                const names = fs.readdirSync(dir);
                const r:string[] = [];
                for (const name of names) {
                    if (name.endsWith(".json")) {
                        r.push(name.substring(0, name.length-5));
                    }
                }
                return r;
            } catch (err) {
                console.error("Error reading notebook variables:", err);
                throw new Error(`Error reading notebook variables for notebook ${notebookId}: ${err}`);
            }
        }

        // If using database for notebook variables
        const pc = await this.getNotebookvarCollection();
        const docs = await pc.find({notebook: notebookId}, {projection: {name:1}}).toArray();
        if (docs && docs.length>0) {
            const r:any = {};
            for (const doc of docs) {
                r[doc.name] = true;
            }
            const names = Object.keys(r);
            return names;
        }
    }

    /**
     * Get notebook variable
     * 
     * @param notebookId 
     * @param name 
     * @returns 
     */
    async getNotebookVar(notebookId: string, name: string) {
        log.debug(`getNotebookVar(${notebookId}, ${name})`);
        if (!notebookId || !name) {
            return null;
        }

        // If using file system for notebook variables
        if (useNotebookVarsInFile) {
            try {
                const dir = `${DATA_DIR}/notebook/${notebookId}`;
                if (fs.existsSync(`${dir}/${name}.json`)) {
                    const r = fs.readFileSync(`${dir}/${name}.json`);
                    if (r && r.length > 0) {
                        return JSON.parse(r.toString());
                    }
                }
            } catch (err) {
                log.err("Error reading notebook variable:", err);
                throw new Error(`Error reading notebook variable ${name} for notebook ${notebookId}: ${err}`);
            }
            return null;
        }

        // If using database for notebook variables
        const pc = await this.getNotebookvarCollection();
        const docs = await pc.find({notebook: notebookId, name: name, snapshotName: {$exists:false}}).toArray();

        if (docs && docs.length>0) {
            if (docs[0].type == "array") {
                const r:any[] = [];
                for (const doc of docs) {
                    for (const item of doc.value) {
                        r.push(item);
                    }
                }
                return r;
            }
            return docs[0].value;
        }
        return null;
    }


    /**
     * Save notebook variable
     * 
     * @param notebookId 
     * @param name 
     * @param value 
     */
    async setNotebookVar(notebookId: string, name: string, value: any) {
        log.debug(`setNotebookVar(${notebookId}, ${name})`);
        if (!notebookId || !name) {
            return null;
        }

        const start = Date.now();

        // If using file system for notebook variables
        if (useNotebookVarsInFile) {
            try {
                const dir = `${DATA_DIR}/notebook/${notebookId}`;
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.writeFileSync(`${dir}/${name}.json`, value ? JSON.stringify(value, null, 0) : "");
                const done = Date.now();
                console.log(` -- setNotebookVar wrote file ${name}.json in ${done - start} ms`);
                return value;
            } catch (err) {
                log.err("Error writing notebook variable to file:", err);
                throw new Error(`Error writing notebook variable ${name} for notebook ${notebookId}: ${err}`);
            }
        }

        // If using database for notebook variables
        const pc = await this.getNotebookvarCollection();
        const docs = await pc.find({notebook: notebookId, name: name}, {projection:{id:1}}).toArray();
        if (docs && docs.length>0) {
            // Delete all records
            const r = await pc.deleteMany({notebook: notebookId, name: name, snapshotName: {$exists:false}});
        }
        if (Array.isArray(value)) {
            const chunk = 500;
            for (var i=0; i<value.length; i=i+chunk) {

                // Save at most "chunk" items in a variable document
                const d:any[] = [];
                for (var j=0; j<chunk; j++) {
                    if ((i+j) >= value.length) {
                        break;
                    }
                    d.push(value[i+j]);
                }
                if (d.length > 0) {
                    const doc = await pc.insertOne({
                        notebook: notebookId,
                        name: name, 
                        value: d,
                        type: "array",
                    })
                }
            }
            const done = Date.now();
            console.log(` -- setNotebookVar wrote ${name} to database in ${done - start} ms`);
            return value;
        }
        else {
            const doc = await pc.insertOne({
                notebook: notebookId,
                name: name, 
                type: "var",
                value: value,
            })
            const done = Date.now();
            console.log(` -- setNotebookVar wrote ${name} to database in ${done - start} ms`);
            return doc;
        }
    }

    /**
     * Delete notebook variable
     * 
     * @param notebookId 
     * @param name 
     */
    async deleteNotebookVar(notebookId: string, name: string) {
        log.debug(`deleteNotebookVar(${notebookId}, ${name})`);

        // If using file system for notebook variables
        if (useNotebookVarsInFile) {
            try {
                const dir = `${DATA_DIR}/notebook/${notebookId}`;
                if (fs.existsSync(`${dir}/${name}.json`)) {
                    fs.unlinkSync(`${dir}/${name}.json`);
                }
            } catch (err) {
                log.err("Error deleting notebook variable:", err);
            }
            return null;
        }

        // If using database for notebook variables
        const pc = await this.getNotebookvarCollection();
        const r = await pc.deleteMany({notebook: notebookId, name: name});
        return null;
    }

    /**
     * Recursively copy files and directories from fromDir to toDir.
     * @param fromDir Source directory.
     * @param toDir Destination directory.
     */
    async copyRecursive(fromDir: string, toDir: string, files: string[]): Promise<void> {
        fs.mkdirSync(toDir, { recursive: true });
        const entries = fs.readdirSync(fromDir, { withFileTypes: true });
        for (const entry of entries) {
            const srcPath = path.join(fromDir, entry.name);
            const destPath = path.join(toDir, entry.name);
            if (entry.isDirectory()) {
                await this.copyRecursive(srcPath, destPath, files);
            } else if (entry.isFile()) {
                fs.copyFileSync(srcPath, destPath);
                files.push(destPath);
            }
        }
    }    

    /**
     * Copy all notebook variables from one notebook to another
     * 
     * @param fromNotebookId 
     * @param toNotebookId 
     * @returns 
     */
    async copyNotebookVars(fromNotebookId: string, toNotebookId: string) {
        log.debug(`copyNotebookVars(${fromNotebookId}, ${toNotebookId})`);
        if (!fromNotebookId || !toNotebookId) {
            return null;
        }
        // If using file system for notebook variables
        if (useNotebookVarsInFile) {
            try {
                const fromDir = `${DATA_DIR}/notebook/${fromNotebookId}`;
                const toDir = `${DATA_DIR}/notebook/${toNotebookId}`;
                const files:string[] = [];
                await this.copyRecursive(fromDir, toDir, files);
                log.debug("Copied files:", files);
                return files
            } catch (err) {
                log.err(`Error copying notebook variables from notebook ${fromNotebookId} to ${toNotebookId}`, err);
            }
            return null;
        }

        // If using database for notebook variables
        const pc = await this.getNotebookvarCollection();
        const cursor = await pc.find({
            notebook: fromNotebookId, 
            // snapshotName: {$exists:false}
        }); //.toArray();
        // Use cursor for better performance
        // if (docs && docs.length>0) {
        const r:any[] = [];
        while (await cursor.hasNext()) {
            const doc = await cursor.next();
            if (doc) {
                const d:any = {
                    notebook: toNotebookId,
                    name: doc.name,
                    type: doc.type,
                    value: doc.value,
                }
                if (doc.snapshotName) {
                    d.snapshotName = doc.snapshotName;
                    d.snapshotDescription = doc.snapshotDescription;
                }
                const doc2 = await pc.insertOne(d);
                r.push((doc.snapshotName ? doc.snapshotName+"/" : "") + doc.name);
            }
        }
        log.debug("Copied variables:", r);
        return r;
    }

    /**
     * Get names of all snapshots for notebook variables
     * 
     * @param notebookId 
     * @returns 
     */
    async getNotebookVarsSnapshotNames(notebookId: string) {
        log.debug(`getNotebookVarsSnapshotNames(${notebookId})`);
        if (!notebookId) {
            return null;
        }

        // If using file system for notebook variables
        if (useNotebookVarsInFile) {
            try {
                const dir = `${DATA_DIR}/notebook/${notebookId}/snapshots`;
                if (fs.existsSync(dir)) {
                    const names = fs.readdirSync(dir);
                    const r:any = [];
                    for (const name of names) {
                        if (fs.lstatSync(`${dir}/${name}`).isDirectory()) {
                            const snapshotDescription = fs.existsSync(`${dir}/${name}/_description.txt`) ? fs.readFileSync(`${dir}/${name}/_description.txt`).toString() : "";
                            r.push({name: name, description: snapshotDescription} );
                        }
                    }
                    return r;
                }
            } catch (err) {
                log.err(`Error reading notebook variable snapshots for notebook ${notebookId}: ${err}`);
            }
            return [];
        }

        // If using database for notebook variables
        const pc = await this.getNotebookvarCollection();
        const docs = await pc.find({notebook: notebookId, snapshotName: {$exists:true}}, {projection: {snapshotName:1, snapshotDescription:1}}).toArray();
        const r:any = {};
        if (docs && docs.length>0) {
            for (const doc of docs) {
                r[doc.snapshotName] = doc.snapshotDescription || "";
            }
        }
        const names = Object.keys(r);
        const docs2:any = [];
        for (const name of names) {
            docs2.push({name: name, description: r[name]});
        }
        log.debug("Snapshot names:", docs2);
        return docs2;
    }

    /**
     * Save a snapshot of all notebook variables
     * 
     * @param notebookId 
     * @param snapshotName 
     * @returns 
     */
    async saveNotebookVarsSnapshot(notebookId: string, snapshotName: string, snapshotDescription: string) {
        log.debug(`saveNotebookVarsSnapshot(${notebookId}, ${snapshotName}, ${snapshotDescription})`);
        if (!notebookId || !snapshotName) {
            return null;
        }

        // If using file system for notebook variables
        if (useNotebookVarsInFile) {
            try {
                const notebookDir = `${DATA_DIR}/notebook/${notebookId}`;
                const snapshotDir = `${DATA_DIR}/notebook/${notebookId}/snapshots/${snapshotName}`;
                if (!fs.existsSync(snapshotDir)) {
                    fs.mkdirSync(snapshotDir, { recursive: true });
                }
                const names = fs.readdirSync(notebookDir);
                const files:any = [];
                for (const name of names) {
                    if (name.endsWith(".json")) {
                        const r = fs.readFileSync(`${notebookDir}/${name}`);
                        if (r) {
                            fs.writeFileSync(`${snapshotDir}/${name}`, r);
                            files.push(name);
                        }
                    }
                }
                fs.writeFileSync(`${snapshotDir}/_description.txt`, snapshotDescription || "");
                return files
            } catch (err) {
                log.err(`Error saving snapshot ${snapshotName} for notebook ${notebookId}`, err);
            }
            return null;
        }

        // If using database for notebook variables
        const varNames = await this.getNotebookVars(notebookId);
        if (varNames && varNames.length > 0) {
            const pc = await this.getNotebookvarCollection();
            const r:any = [];
            for (const name of varNames) {
                const docs = await pc.find({notebook: notebookId, name: name, snapshotName: {$exists:false}}).toArray();
                if (docs && docs.length>0) {
                    for (const doc of docs) {
                        const d:any = {
                            notebook: doc.notebook,
                            name: doc.name,
                            snapshotName: snapshotName,
                            snapshotDescription: snapshotDescription,
                            type: doc.type,
                            value: doc.value,
                        }
                        const doc2 = await pc.insertOne(d);
                    }
                    r.push(name);
                }
            }
            return r;
        }
        return null;
    }

    /**
     * Restore a snapshot of all notebook variables
     * 
     * @param notebookId 
     * @param snapshotName 
     * @returns 
     */
    async restoreNotebookVarsSnapshot(notebookId: string, snapshotName: string) {
        log.debug(`restoreNotebookVarsSnapshot(${notebookId}, ${snapshotName})`);
        if (!notebookId || !snapshotName) {
            return null;
        }
        // If using file system for notebook variables
        if (useNotebookVarsInFile) {
            try {
                const notebookDir = `${DATA_DIR}/notebook/${notebookId}`;
                const snapshotDir = `${DATA_DIR}/notebook/${notebookId}/snapshots/${snapshotName}`;
                if (fs.existsSync(snapshotDir)) {
                    const names = fs.readdirSync(snapshotDir);
                    const files:any = [];
                    for (const name of names) {
                        if (name.endsWith(".json")) {
                            const r = fs.readFileSync(`${snapshotDir}/${name}`);
                            if (r) {
                                fs.writeFileSync(`${notebookDir}/${name}`, r);
                                files.push(name);
                            }
                        }
                    }
                    return files
                }
            } catch (err) {
                log.err(`Error restoring snapshot ${snapshotName} for notebook ${notebookId}`, err);
            }
            return null;
        }

        // If using database for notebook variables
        const pc = await this.getNotebookvarCollection();
        // Get all snapshot variables
        const docs = await pc.find({notebook: notebookId, snapshotName: snapshotName}).toArray();
        if (docs && docs.length>0) {
            const files:any = {};
            const varDeleted:any = {};
            for (const doc of docs) {
                // Delete only those vars that are in the snapshot
                if (!varDeleted[doc.name]) {
                    const r2 = await pc.deleteMany({notebook: notebookId, name: doc.name, snapshotName: {$exists:false}});
                    varDeleted[doc.name] = true;
                }
                const d:any = {
                    notebook: doc.notebook,
                    name: doc.name,
                    type: doc.type,
                    value: doc.value,
                }
                const doc2 = await pc.insertOne(d);
                files[doc.name] = true;
            }
            return Object.keys(files);
        }
        return null;
    }

    /**
     * Delete a snapshot of all notebook variables
     * 
     * @param notebookId 
     * @param snapshotName 
     * @returns 
     */
    async deleteNotebookVarsSnapshot(notebookId: string, snapshotName: string) {
        log.debug(`deleteNotebookVarsSnapshot(${notebookId}, ${snapshotName})`);
        if (!notebookId || !snapshotName) {
            return null;
        }

        // If using file system for notebook variables
        if (useNotebookVarsInFile) {
            try {
                const snapshotDir = `${DATA_DIR}/notebook/${notebookId}/snapshots/${snapshotName}`;
                if (fs.existsSync(snapshotDir)) {
                    fs.rmSync(snapshotDir, { recursive: true, force: true });
                }
            } catch (err) {
                log.err(`Error deleting snapshot ${snapshotName} for notebook ${notebookId}`, err);
            }
            return null;
        }

        // If using database for notebook variables
        const pc = await this.getNotebookvarCollection();
        const r = await pc.deleteMany({notebook: notebookId, snapshotName: snapshotName});
        return null;
    }


    /**
     * Write persistent log
     * 
     * @param message 
     * @returns 
     */
    public async writeLog(ctx: UserContext, message: string) {
        const r = await this.createDoc(ctx, logType, {
            key: "ods-log",
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
        const r = await this.getDocs(ctx, logType, { key: "ods-log" });
        return r;
    }

    /**
     * Delete a persistent log entry
     * 
     * @param id 
     * @returns 
     */
    public async deleteLog(ctx: UserContext, id: string) {
        const r = await this.deleteDoc(ctx, {type: logType, id: id});
        return r;
    }


    /**
     * Get the Api keys and set the API_KEYS environment variable that is used by the DLMS auth module.
     */
    public async updateApikeyEnv() {
        const gc = await this.getCollection(this.appName + "." + apikeyType + ".doc");
        const keys = await gc.find({}).toArray();
        log.debug("API Keys =", keys);
        const s = [];
        for (const key of keys) {
            s.push(`${key.key}:${key.role}:${key.app}:${key.expirationDate || ""}`);
        }
        process.env["API_KEYS"] = s.join(",");
        log.debug("Set API_KEYS env variable =", process.env["API_KEYS"]);
        return process.env["API_KEYS"];
    }

    /**
     * Override send emails if EMAIL_ENABLED=false to save locally for debugging if necessary
     * 
     * @param ctx 
     * @param toEmail 
     * @param subject 
     * @param message 
     * @param fromEmail 
     * @param attachments 
     * @param force 
     * @returns 
     */
    public async sendEmail(
        ctx: UserContext,
        toEmail: string,
        subject: string,
        message: string,
        fromEmail: string = '',
        attachments: EmailAttachment[] = [],
        force: boolean = false
    ) {
        const from = fromEmail || adminEmail;
        if (!emailEnabled && !force) {
            log.info(
                `Email notification is disabled.  Not sending notification email to ${toEmail}: subject=${subject}, message=${message}, from=${from}`
            );

            // Create tmp/email/groups[] directory
            var dir = "./tmp/email/" + toEmail;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, {recursive: true});
            }

            // Save email file as "timestamp.html"
            fs.writeFileSync(dir + "/" + Date.now() + "_" + Math.round(Math.random()*1000) + ".html", 
`
<div><b>Recipient:</b> ${toEmail}</div>
<div><b>From:</b> ${fromEmail}</div>
<div><b>Subject:</b> ${subject}</div>
<div>${message}</div>
`
            )

            return;
        }
        if (emailDebug) {
            log.info(`Email debug is set.  Sending emails to ${emailDebug}`)
            for (const emailAddr of emailDebug.split(",")) {
                const _toEmail = emailAddr.trim();
                if (_toEmail) {
                    super.sendEmail(ctx, _toEmail, subject, "<div><b>Email debug: Original recipient is " + toEmail+ "</b></div><br/> " + message, fromEmail, attachments, force);
                }
            }
        }
        else if (emailEnabled) {
            super.sendEmail(ctx, toEmail, subject, message, fromEmail, attachments, force);
        }
    }

    /**
     * Get mongodb collection names
     * 
     * @param {UserContext} ctx - The user context.
     * @returns {string[]}
     */
    public async getCollectionNames(ctx: UserContext): Promise<string[]> {
        log.debug(`getCollectionNames()`);
        await this.assertAdmin(ctx);

        let rtn: string[] = []
        for (const name of this.allCollectionNames) {
            const parts = name.split(".")
            parts.shift();
            rtn.push(parts.join("."));
        }
        log.debug(`getCollectionNames =`, rtn);
        return rtn;
    }

    /**
     * Get data from collections.
     * 
     * @param {UserContext} ctx - The user context.
     * @param {CollectionNamesArray} namesArray - The array of collection names and queries to retrieve.
     * @param {string} encoding - The encoding to use for streaming data (base64 or utf-8)
     * @param {Response} response - The express response object to write result to.
     */
    public async getCollectionData(ctx: UserContext, namesArray: CollectionNamesArray, encoding: string, response: any) {
        log.debug(`getCollectionData(${JSON.stringify(namesArray)})`);
        await this.assertAdmin(ctx);
        let count = 0;
        response.headers = {
            "Content-Type": "application/json",
        }
        const dashes = "".padStart(16, "-");

        let bytesSent = 0;
        for (const item of namesArray) {
            const name = item.name;
            const match = item.match || {};
            const options = item.options || {};

            const collectionName = dbApp + "." + name;
            const collection = await this.getCollection(collectionName);

            const cursor = await collection.find(match, { ...options, enableUtf8Validation: this.enableUtf8Validation, allowDiskUse: true });
            let pause = 0;
            let waitingForDrain = 0;
            while (await cursor.hasNext()) {
                let doc = await cursor.next();
                doc = this.toInfo(doc, false);

                const _data = Buffer.from(JSON.stringify({collection: name, doc: doc})).toString("utf-8");
                const data = (encoding == "base64") ? Buffer.from((_data)).toString("base64") : _data;

                const len = (""+data.length).padStart(16, "0");
                response.write(len);
                bytesSent += len.length;
                const r = response.write(data);
                bytesSent += data.length;
                if (!r) {
                    waitingForDrain++;
                    pause = 1;
                    response.once("drain", ()=> {
                        pause = 0;
                    })
                }
                while (pause) {
                    pause++;
                    if (pause > this.drainTimeout) {
                        log.debug("Error: Drain not received, so closing stream");
                        response.status(500);
                        return response.end();
                    }
                    await sleep(1);
                }
                count++;
            }
        }
        response.write(dashes);
        bytesSent += dashes.length;
        response.end();
        log.debug(`getCollectionData: Returned ${count} documents.  Bytes sent = ${bytesSent}`);
    }

    /**
     * Get collection names from remote Ods
     * 
     * @param ctx 
     * @param odsUrl 
     * @param user 
     * @param pass 
     * @returns 
     */
    public async getRemoteCollectionNames(ctx: UserContext, odsUrl: string, user: string, pass: string): Promise<string[]> {
        log.debug(`getRemoteCollectionNames(${odsUrl})`);

        if (!odsUrl || !user || !pass) {
            return [];
        }

        const config = () => {
            return {
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'Basic ' +  Buffer.from(user+":"+pass).toString("base64"), 
                }
            }
        }
        try {
            const r = await axios.get(`${odsUrl}/api/backup/getCollectionNames`, { ...config(), proxy: false });
            if (r) {
                const rtn = r.data;
                log.debug(`getCollectionNames =`, rtn); 
                return rtn;
            }
        }
        catch (e) {
        }
        log.debug(`getCollectionNames = []`);
        return [];
    }

    /**
     * Import array of collection names and queries.
     * 
     * @param {UserContext} ctx - The user context.
     * @param {CollectionNamesArray} namesArray - The array of collection names and queries to retrieve.
     * @param {string} odsUrl - The url of the remote Ods app to import from.
     * @param {string} user - The user for basic auth
     * @param {string} pass - The password for basic auth
     * @param {string} encoding - The encoding to use for streaming data (base64 or utf-8)
     * @param {boolean} alwaysUpdate - T=always update document, F=only update if dateUpdated of document being imported > dateUpdated of document in database 
     */
    public async importCollections(ctx: UserContext, namesArray: CollectionNamesArray, odsUrl: string, user: string, pass: string, encoding: string, alwaysUpdate=false, deleteCollection=false) : Promise<any> {
        log.debug(`importCollections(${namesArray}, ${odsUrl})`)
        if (!odsUrl) {
            odsUrl = "http://localhost:" + port;
        }
        for (const collectionNameQuery of namesArray) {
            console.log('collectionNameQuery =',collectionNameQuery);
            await this.setStatus("Importing Collection", `${collectionNameQuery.name} from ${odsUrl}`, "");
            const r = await this.importCollection(ctx, collectionNameQuery, odsUrl, user, pass, encoding, alwaysUpdate, deleteCollection);
            await this.setStatus("Done Importing Collection", `${collectionNameQuery.name} from ${odsUrl}`, `Number of documents imported = ${r}`);
            console.log("Result from importCollection =", r);
        }
    }

    /**
     * Read collection data stream from remote Ods and process each document with provided processor.
     * 
     * @param {UserContext} ctx - The user context.
     * @param {CollectionDataQuery} collectionNameQuery - The collection name and query.
     * @param {string} odsUrl - The url of the remote Ods app to import from.
     * @param {string} user - The user for basic auth
     * @param {string} pass - The password for basic auth
     * @param {string} encoding - The encoding to use for streaming data (base64 or utf-8)
     * @param {boolean} alwaysUpdate - T=always update document, F=only update if dateUpdated of document being imported > dateUpdated of document in database 
     * @returns {number} The number of documents imported or -1 if there was an error processing a document.
     * @throws Error if parsing JSON or processing buffer.
     */
    public async processRemoteCollectionData(ctx: any, collectionNameQuery: CollectionDataQuery, odsUrl: string, user: string, pass: string, encoding: string, alwaysUpdate: boolean, processor: DocumentProcessor) : Promise<any> {
        log.debug(`processRemoteCollectionData(${collectionNameQuery}, ${odsUrl})`);
        const self = this;
        const req = odsUrl.startsWith("http:") ? http : https;
        const base64 = (encoding == "base64");
        return new Promise( async function(success:any, fail:any) {
            let buffer = "";
            let len = 0;
            let count = 0;
            let bytesRead = 0;
            let endFound = false;
            let totalCount = -1;
            let processedCount = 0;

            console.log('name=',collectionNameQuery);
            const url = `${odsUrl}/api/backup/getCollectionData?names=${encodeURIComponent(JSON.stringify([collectionNameQuery]))}`;
            console.log("url=", url);
            await req.get(url, {
                    headers: {
                        'Authorization': 'Basic ' + Buffer.from(user+":"+pass).toString("base64"), 
                        'Connection': 'keep-alive',
                        'Accept': "application/json, text/plain, */*",
                    },
                    timeout: 30000,
                    proxy: false,
                }, 
                (response:any) => {
                    // console.log("Response = ", response);

                    response.on('readable', () => {
                        // console.log("response =", response);
                        let chunk;
                        while (((chunk = response.read()) != null)) {
                            // console.log("chunk=", chunk.toString());
                            buffer += chunk.toString();
                            bytesRead += chunk.length;
                            self.setStatusComment(`Reading chunk ${chunk.length} - bytes read = ${bytesRead.toLocaleString()}`);
                            processBuffer();
                        }
                    })

                    response.on('end', async() => {
                        console.log(">> Received END of stream")

                        // If buffer length reaches 0 but ----- not read, then return error
                        while (true) {
                            await sleep(1000);
                            if (buffer.length == 0) {
                                if (!endFound) {
                                    console.log("RETURNING ERROR: END OF STREAM")
                                    return success(`Error: End of stream before reading all documents - only ${count} documents read`);
                                }
                                else {
                                    return;
                                }
                            }
                        }
                    });

                    response.on('error', (e: any) => {
                        console.log(">> Error with request: ", e);
                        self.setStatusComment(`Error with request: ${e.message}`);
                        return success("Error with request: " + e);
                    })   
                }
            );    

            function processBuffer() {

                try {
                    // Process buffer
                    while (buffer.length > 0) {
                        console.log(`count=${count}  buffer length=${buffer.length}`);

                        // Read length of JSON string
                        if (len == 0 && buffer.length >= 16) {
                            const slen = buffer.substring(0, 16);
                            console.log("\n>> JSON string length =", slen);
                            if (slen.startsWith("-")) {
                                console.log("\n>> Found END")
                                totalCount = count;
                                // return success(""+count);
                                return;
                            }
                            len = parseInt(slen);

                            // Remove length from buffer
                            buffer = buffer.substring(16);
                            count++;
                        } 

                        // Read in JSON string
                        else if (len > 0 && buffer.length >= len) {
                            const _str = buffer.substring(0, len);

                            // Remove length from buffer
                            buffer = buffer.substring(len);
                            len = 0;

                            const _str2 = base64 ? Buffer.from(_str, "base64").toString("utf-8") : _str;
                            // console.log("\n>> JSON string =", str);

                            // Replace any strings for remote url with local url
                            const re = new RegExp(odsUrl, "g")
                            const str = _str2.replace(re, baseUrl);
                            let json;
                            try {
                                json = JSON.parse(str);
                            } catch (e) {
                                console.log(e);
                                throw( new Error("Error parsing JSON string: " + str));
                            }
                            try {
                                const run = async () => {
                                    const r = await processor(self, ctx, json.collection, json.doc, alwaysUpdate);
                                    console.log(`Result of processor ${processedCount} (behind by ${count-processedCount}) = ${r}`);
                                    self.setStatusComment(`Processed document ${processedCount} of ${count}: Bytes read = ${bytesRead.toLocaleString()}`);
                                    processedCount++;
                                    if (totalCount > -1 && processedCount == totalCount) {
                                        return success(""+totalCount);
                                    }
                                }
                                run();
                            } catch (e) {
                                console.log(e);
                                throw( new Error("Error: " + e + " while processing document =" + str));
                            }
                        } 
                        else {
                            return;
                        }
                    }
                } catch (e) {
                    console.log("Error processing stream: ", e);
                    throw(e);
                }
            }
        });
    }

    /**
     * Import collection from remote Ods app.
     * 
     * @param {UserContext} ctx - The user context.
     * @param {CollectionDataQuery} collectionNameQuery - The collection name and query.
     * @param {string} odsUrl - The url of the remote Ods app to import from.
     * @param {string} user - The user for basic auth
     * @param {string} pass - The password for basic auth
     * @param {string} encoding - The encoding to use for streaming data (base64 or utf-8)
     * @param {boolean} alwaysUpdate - T=always update document, F=only update if dateUpdated of document being imported > dateUpdated of document in database 
     * @param {boolean} deleteCollection - T=delete collection before import
     * @returns {number} The number of documents imported or -1 if there was an error processing a document.
     * @throws Error if parsing JSON or processing buffer.
     */
    public async importCollection(ctx: UserContext, collectionNameQuery: CollectionDataQuery, odsUrl: string, user: string, pass: string, encoding: string, alwaysUpdate: boolean, deleteCollection: boolean) : Promise<any> {
        log.debug(`importCollection(${collectionNameQuery}, ${odsUrl})`)
        const collectionName = collectionNameQuery.name;
        let docType = collectionName;
        if (collectionName.endsWith(".doc")) {
            docType = collectionName.substring(0, collectionName.length-4);
        }
        let document_id_required = false;
        if (collectionName === "user") {
            document_id_required = true;
        }
        else {
            const dt = this.documents[docType];
            if (dt) {
                document_id_required = !!dt.document_id_required;
            }
        }
        
        if (deleteCollection) {
            try {
                const dc = await this.getCollection(dbApp + "." + collectionName);
                await dc.drop();
                log.info(`Deleted collection ${collectionName} before importing`);
            } catch (e: any) {
                log.info(`Failed to drop collection ${collectionName}: ${e.message}`);
            }
        }
        const c = await this.getCollection(dbApp + "." + collectionName);

        const r = await this.processRemoteCollectionData(ctx, collectionNameQuery, odsUrl, user, pass, encoding, alwaysUpdate,

            async function(appMgr: Ods, ctx: UserContext, collectionName: string, doc: any, alwaysUpdate: boolean){
                console.log(`importDoc(${collectionName}, ${doc.id})`);
                const id = doc._id || doc.id;
                const filter = document_id_required ? { _id: id } : { _id: new ObjectId(id) };
                if (collectionName == "attachment") {
                    doc.data = Buffer.from(doc.data, 'base64');
                }
                const result = await c.findOne(filter);
                if (result) {
                    //@TODO: What if it's been changed but no dateUpdated property?  Maybe add param "alwaysUpdate"?
                    if (alwaysUpdate || (doc.dateUpdated && (doc.dateUpdated > result.dateUpdated))) {
                        log.debug(`updating ${id} because it was older`);
                        await c.updateOne(filter, appMgr.toMongoUpdate(doc));           
                    }
                    else {
                        log.debug(`skipping ${id} because it is recent`);
                    }
                } else {
                    log.debug(`inserting ${id}`);
                    if (!doc._id) {
                        doc._id = document_id_required ? id : new ObjectId(id);
                    }
                    await c.insertOne(doc);
                }
                return true;
            }
        );

        return r;
    }

    /**
     * Get the MongoDB server collection.
     * @returns {Promise<any>} The server document collection.
     */
    public async getServerDocCollection() {
        if (!this.serverDocCollection) {
            this.serverDocCollection = await this.getCollection(dbApp + ".server.doc");
        }
        return this.serverDocCollection;
    }
    
    /**
     * Get the status of the extraction process.
     * @param id Status document ID (default: "appStatus").
     * @returns {Promise<any>} Status document.
     */
    public async getStatus(id="appStatus") {
        const pc = await this.getServerDocCollection();
        const serverStatus = await pc.findOne({_id: id});
        return serverStatus;
    }

    /**
     * Get the server status field.
     * @param id Status document ID (default: "appStatus").
     * @returns {Promise<any>} Status field.
     */
    public async getServerStatus(id="appStatus") {
        const serverStatus = await this.getStatus(id);
        return serverStatus?.status;
    }

    /**
     * Set the status of the extraction process.
     * @param status Status string.
     * @param command Optional command string.
     * @param comment Optional comment string.
     * @param id Status document ID (default: "appStatus").
     * @returns {Promise<any>} Update result.
     */
    public async setStatus(status: string | null, command?: string, comment?: string, id="appStatus") {
        const pc = await this.getServerDocCollection();
        const r = await pc.updateOne({_id: id}, {$set: {status: status, command: command || "", comment: comment || "", dateUpdated: Date.now()}}, {upsert: true})
        return r;
    }

    /**
     * Set the status comment.
     * @param comment Comment string.
     * @param id Status document ID (default: "appStatus").
     * @returns {Promise<any>} Update result.
     */
    public async setStatusComment(comment?: string, id="appStatus") {
        const pc = await this.getServerDocCollection();
        const r = await pc.updateOne({_id: id}, {$set: {comment: comment || "", dateUpdated: Date.now()}}, {upsert: true})
        return r;
    }

    /**
     * Set status to stop.
     * @param id Status document ID (default: "appStatus").
     * @returns {Promise<any>} Update result.
     */
    public async stop(id="appStatus") {
        log.debug(`stop(${id})`)
        return await this.setStatus(null,undefined,undefined,id);
    }

    /**
     * Acquire a lock for a given name.
     * @param name Lock name.
     * @returns {Promise<any>} Lock document or null.
     */
    public async getLock(name: string) {
        console.log(`getLock(${name})`)
        const pc = await this.getServerDocCollection();
        try {
            const r = await pc.findOneAndUpdate( {
                _id: `lock_${name}`,
                dateUpdated: 0,
            },
            {
                $set: {
                    _id: `lock_${name}`,
                    dateUpdated: Date.now(),
                }
            },
            {
                upsert:true, 
                returnNewDocument : true,
            }
            );
            return r;
        }
        catch (e) {
            return null;
        }
    }

    /**
     * Check if a lock exists for a given name.
     * @param name Lock name.
     * @returns {Promise<any>} Lock document.
     */
    public async checkLock(name: string) {
        console.log(`checkLock(${name})`)
        const pc = await this.getServerDocCollection();
        const r = await pc.findOne({_id: `lock_${name}`});
        return r;
    }

    /**
     * Clear a lock for a given name.
     * @param name Lock name.
     * @returns {Promise<any>} Update result.
     */
    public async clearLock(name: string) {
        console.log(`clearLock(${name})`)
        const pc = await this.getServerDocCollection();
        const r = await pc.updateOne({_id: `lock_${name}`}, {$set: {dateUpdated: 0}}, {upsert: true});
        return r;
    }
}

// Run timer to reset status if not changed after 20 min
setInterval(async function() {
    log.debug("Managing status")
    const now = Date.now();
    const resetTime = now - 20*60000;
    console.log(" -- ResetTime =", formatDateTime(resetTime) );
    const mgr = Ods.getInstance();
    const keys = ["appStatus", ETL.lockName];
    for (const key of keys) {
        console.log(" -- Looking at status for ", key);
        const status = await mgr.getStatus(key);
        if (status && status.status) {
            console.log(" -- Looking at status: ", status, formatDateTime(status.dateUpdated));
            if ((status.status.toLowerCase() == "idle")  || 
                (status.dateUpdated < resetTime)) {
                log.debug(" -- Clearing status: ", status);
                await mgr.stop(key);
                await mgr.etl?.writeLog(mgr.getAdminContext(), "Clearing status: " + JSON.stringify(status));

                // If server status was cleared, then clear lock too
                if (key == ETL.lockName) {
                    const lock = await mgr.checkLock(ETL.lockName);
                    await mgr.clearLock(ETL.lockName);
                    log.debug(" -- Clearing lock: ", lock);
                    await mgr.etl?.writeLog(mgr.getAdminContext(), "Clearing lock: " + JSON.stringify(lock));
                }
            }
        }
        // If no status for etl but lock is set, then clear it
        else if (key == ETL.lockName) {
            console.log(" -- Looking at lock for ", key)
            const lock = await mgr.checkLock(ETL.lockName);
            console.log(" -- lock =", lock); // lock = { _id: 'lock_etl', dateUpdated: 0 }
            if (lock && lock.dateUpdated > 0) {
                await mgr.clearLock(ETL.lockName);
                console.log(" -- Clearing lock: ", lock);
                await mgr.etl?.writeLog(mgr.getAdminContext(), "Clearing lock: " + JSON.stringify(lock));
            }
        }
    }
}, 60000)

