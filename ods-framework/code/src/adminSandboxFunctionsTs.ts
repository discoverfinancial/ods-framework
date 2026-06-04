/**
 * Copyright (c) 2025 Capital One
*/

/*
This file is used only for typescript validation of the JS file to make development easier
*/
import { Ods } from "./ods";
import axios from "axios";
import { Logger } from "dlms-server";

import {compareVersions, Role, sbomType} from "ods-common";

import { ETL } from "./etl/etl";
import { UserContext } from "dlms-server";

const log = new Logger("etl-sandbox");

const global = {
    mgr: Ods.getInstance(),
    etl: ETL.getInstance(Ods.getInstance()),
    ctx: {} as UserContext,
    notebook: {} as any,
}

//-------------------------------------------------------------------------------------------------
// EMPLOYEE FUNCTIONS
//-------------------------------------------------------------------------------------------------

define("log", async (args, { respond }) => {
    log.debug(...args);
    respond();
})



define("getDocs", async ([type, match, options], { respond, fail }) => {
    try {
        const r = await global.mgr.getDocs(global.ctx, type, match, options);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("getDoc", async ([type, id, projection], { respond, fail }) => {
    try {
        const r = await global.mgr.getDoc(global.ctx, { type: type, id: id }, projection);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

// Add for compatibility with old Queries
define("query", async ([match, projection, limit, sort, database], { respond, fail }) => {
    try {
        const type = database ? database : sbomType;
        const options:any = {};
        if (limit) { options["limit"] = limit; }
        if (sort) { options["sort"] = sort; }
        const r = await global.mgr.getDocs(global.ctx, type, match, options);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

// OTHER

define("axiosGet", async ([url, config], { respond, fail }) => {
    try {
        const r = await axios.get(url, config);
        respond(r.data);
    } catch (e: any) {
        const err = e.message ? JSON.parse(e.message) : "" + e;
        fail(err);
    }
})

define("axiosPost", async ([url, data, config], { respond, fail }) => {
    try {
        const r = await axios.post(url, data, config);
        respond(r.data);
    } catch (e: any) {
        const err = e.message ? JSON.parse(e.message) : "" + e;
        fail(err);
    }
})

define("axiosPut", async ([url, data, config], { respond, fail }) => {
    try {
        const r = await axios.put(url, data, config);
        respond(r.data);
    } catch (e: any) {
        const err = e.message ? JSON.parse(e.message) : "" + e;
        fail(err);
    }
})

define("axiosPatch", async ([url, data, config], { respond, fail }) => {
    try {
        const r = await axios.patch(url, data, config);
        respond(r.data);
    } catch (e: any) {
        const err = e.message ? JSON.parse(e.message) : "" + e;
        fail(err);
    }
})

define("axiosDelete", async ([url, config], { respond, fail }) => {
    try {
        const r = await axios.delete(url, config);
        respond(r.data);
    } catch (e: any) {
        const err = e.message ? JSON.parse(e.message) : "" + e;
        fail(err);
    }
})


// ETL

define("getProfile", async ([idOrEmail, details], { respond, fail }) => {
    try {
        const userProfileService = global.mgr.getUserProfileService();
        const r = await userProfileService.getProfile(idOrEmail, details)
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("getManagementChain", async ([users], { respond, fail }) => {
    try {
        const userProfileService = global.mgr.getUserProfileService();
        const r = await userProfileService.getManagementChain(users);
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("getLogs", async ([], { respond, fail }) => {
    try {
        const r = await global.etl.getLogs(global.ctx);
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("getStatus", async ([name], { respond, fail }) => {
    try {
        const r = await global.mgr.getStatus(name);
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("setNotebookId", async ([id], { respond, fail }) => {
    try {
        global.notebook = id;
        respond(id);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("getNotebookId", async ([], { respond, fail }) => {
    try {
        respond(global.notebook);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("setNotebookVar", async ([notebookId, name, value], { respond, fail }) => {
    try {
        await global.mgr.setNotebookVar(notebookId, name, value)
        respond();
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("getNotebookVar", async ([notebookId, name], { respond, fail }) => {
    // console.log("getNotebookVar name=", name)
    try {
        const r = await global.mgr.getNotebookVar(notebookId, name);
        // console.log(" -- found var r=", r);
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("getNotebookVars", async ([notebookId], { respond, fail }) => {
    console.log("getNotebookVars")
    try {
        const r = await global.mgr.getNotebookVars(notebookId);
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("deleteNotebookVar", async ([notebookId, name], { respond, fail }) => {
    try {
        await global.mgr.deleteNotebookVar(notebookId, name);
        respond();
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("getNotebookVarsSnapshotNames", async ([notebookId], { respond, fail }) => {
    // console.log("getNotebookVarsSnapshotNames name=", name)
    try {
        const r = await global.mgr.getNotebookVarsSnapshotNames(notebookId);
        // console.log(" -- found var r=", r);
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("getNotebookVarsSnapshotVar", async ([notebookId, snapshotName, name], { respond, fail }) => {
    // console.log("getNotebookVarsSnapshotVar name=", name)
    try {
        const r = await global.mgr.getNotebookVarsSnapshotVar(notebookId, snapshotName, name);
        // console.log(" -- found var r=", r);
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("getNotebookVarsSnapshotVars", async ([notebookId, snapshotName], { respond, fail }) => {
    // console.log("getNotebookVarsSnapshotVars")
    try {
        const r = await global.mgr.getNotebookVarsSnapshotVars(notebookId, snapshotName);
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});


/**
 * Compare version strings
 */
define("compareVersions", async ([v1, v2], { respond, fail }) => {
    try {
        const r = compareVersions(v1, v2);
        respond(r);
    } catch (e) {
        fail(e);
    }
})



//-------------------------------------------------------------------------------------------------
// ADMIN FUNCTIONS
//-------------------------------------------------------------------------------------------------


// OTHER

define("createDoc", async ([type, doc], { respond, fail }) => {
    try {
        assertIsAdmin();
        const r = await global.mgr.createDoc(global.ctx, type, doc);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("updateDoc", async ([type, id, args], { respond, fail }) => {
    try {
        assertIsAdmin();
        const r = await global.mgr.updateDoc(global.ctx, { type: type, id: id }, args);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

// ETL

define("writeLog", async ([message], { respond, fail }) => {
    try {
        assertIsAdmin();
        const r = await global.etl.writeLog(global.ctx, message);
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("deleteLog", async ([id], { respond, fail }) => {
    try {
        assertIsAdmin();
        const r = await global.etl.deleteLog(global.ctx, id);
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("setStatus", async ([name, status, command, comment], { respond, fail }) => {
    try {
        assertIsAdmin();
        const r = await global.mgr.setStatus(name, status, command, comment);
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});
define("setStatusComment", async ([name, comment], { respond, fail }) => {
    try {
        assertIsAdmin();
        const r = await global.mgr.setStatusComment(name, comment);
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("stop", async ([name], { respond, fail }) => {
    try {
        assertIsAdmin();
        const r = await global.mgr.stop(name);
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

function assertIsAdmin() {
    if (!global.ctx.isAdmin) {
        throw new Error("Must be administrator")
    }
}

function define(arg0: string, arg1: (args: any, { respond }: { respond: any, fail: any }) => Promise<void>) {
    throw new Error("Function not implemented.");
}
