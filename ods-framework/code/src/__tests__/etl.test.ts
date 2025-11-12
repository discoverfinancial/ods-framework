import { ETL } from "../etl/etl";

describe("ETL", () => {
    let mgr: any;
    let etl: ETL;
    let ctx: any;

    beforeEach(() => {
        mgr = {
            createDoc: jest.fn(),
            getDocs: jest.fn(),
            deleteDoc: jest.fn(),
            getStatus: jest.fn(),
            setStatus: jest.fn(),
            setStatusComment: jest.fn(),
            stop: jest.fn(),
            isAdmin: jest.fn(),
            isInUserGroups: jest.fn(),
            getLock: jest.fn(),
            clearLock: jest.fn(),
            runUserScriptId: jest.fn(),
            etlConfig: {}
        };
        ctx = {};
        etl = new ETL(mgr);
    });

    // writeLog tests

    it("writes a log entry using writeLog", async () => {
        mgr.createDoc = jest.fn().mockResolvedValue("logEntry");
        const result = await etl.writeLog(ctx, "message");
        expect(mgr.createDoc).toHaveBeenCalledWith(ctx, expect.anything(), { key: "etl-log", value: "message" });
        expect(result).toBe("logEntry");
    });

    // getLogs tests

    it("retrieves log entries using getLogs", async () => {
        mgr.getDocs = jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]);
        const result = await etl.getLogs(ctx);
        expect(mgr.getDocs).toHaveBeenCalledWith(ctx, expect.anything(), { match: { key: "etl-log" } });
        expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    // deleteLog tests

    it("deletes a log entry if user is admin", async () => {
        etl.assertIsAdminOrEditor = jest.fn().mockResolvedValue(true);
        mgr.deleteDoc = jest.fn().mockResolvedValue("deleted");
        const result = await etl.deleteLog(ctx, "logId");
        expect(mgr.deleteDoc).toHaveBeenCalledWith(ctx, { type: expect.anything(), id: "logId" });
        expect(result).toBe("deleted");
    });

    // deleteLogs tests

    it("deletes logs before a given date", async () => {
        etl.assertIsAdminOrEditor = jest.fn().mockResolvedValue(true);
        mgr.getDocs = jest.fn().mockResolvedValue([
            { id: "1", dateCreated: "2023-01-01" },
            { id: "2", dateCreated: "2024-01-01" }
        ]);
        mgr.deleteDoc = jest.fn().mockResolvedValue("deleted");
        await etl.deleteLogs(ctx, "2023-12-31");
        expect(mgr.deleteDoc).toHaveBeenCalledWith(ctx, { type: expect.anything(), id: "1" });
        expect(mgr.deleteDoc).not.toHaveBeenCalledWith(ctx, { type: expect.anything(), id: "2" });
    });

    // getStatus tests

    it("gets status from mgr", async () => {
        mgr.getStatus = jest.fn().mockResolvedValue({ status: "IDLE" });
        const result = await etl.getStatus();
        expect(result).toEqual({ status: "IDLE" });
    });

    // getServerStatus tests

    it("gets server status from mgr", async () => {
        mgr.getStatus = jest.fn().mockResolvedValue({ status: "RUNNING" });
        const result = await etl.getServerStatus();
        expect(result).toBe("RUNNING");
    });

    // setStatus tests

    it("sets status using mgr", async () => {
        mgr.setStatus = jest.fn().mockResolvedValue("set");
        const result = await etl.setStatus("IDLE", "cmd", "comment");
        expect(mgr.setStatus).toHaveBeenCalledWith("IDLE", "cmd", "comment", ETL.lockName);
        expect(result).toBe("set");
    });

    // setStatusComment tests

    it("sets status comment using mgr", async () => {
        mgr.setStatusComment = jest.fn().mockResolvedValue("commented");
        const result = await etl.setStatusComment("comment");
        expect(mgr.setStatusComment).toHaveBeenCalledWith("comment", ETL.lockName);
        expect(result).toBe("commented");
    });

    // stop tests

    it("calls stop on mgr", async () => {
        await etl.stop();
        expect(mgr.stop).toHaveBeenCalledWith(ETL.lockName);
    });

    // runScriptsFromCron tests

    it("runs scripts from cron when scripts exist", async () => {
        mgr.getDocs = jest.fn().mockResolvedValue([{ id: "script1", name: "Script One" }]);
        mgr.runUserScriptId = jest.fn().mockResolvedValue("done");
        mgr.createDoc = jest.fn().mockResolvedValue("log");
        await etl.runScriptsFromCron(ctx, "0", "start");
        expect(mgr.runUserScriptId).toHaveBeenCalledWith(ctx, "script1", {});
    });

    it("doesn't call runUserScriptId when getDocs returns no scripts", async () => {
        mgr.getDocs = jest.fn().mockResolvedValue([]);
        await etl.runScriptsFromCron(ctx, "0", "start");
        expect(mgr.runUserScriptId).not.toHaveBeenCalledWith(ctx, "script1", {});
    });

    it("handles error when running user script in runScriptsFromCron", async () => {
        mgr.getDocs = jest.fn().mockResolvedValue([{ id: "script1", name: "Script One" }]);
        mgr.runUserScriptId = jest.fn().mockRejectedValue(new Error("fail"));
        etl.writeLog = jest.fn().mockResolvedValue("log");
        await etl.runScriptsFromCron(ctx, "0", "start");
        expect(etl.writeLog).toHaveBeenCalled();
    });

    it("handles error when getting scripts in runScriptsFromCron", async () => {
        mgr.getDocs = jest.fn().mockRejectedValue(new Error("fail"));
        etl.writeLog = jest.fn().mockResolvedValue("log");
        await etl.runScriptsFromCron(ctx, "0", "start");
        expect(etl.writeLog).toHaveBeenCalled();
    });

    // assertIsAdminOrEditor tests

    it("asserts admin or editor returns if user is admin", async () => {
        mgr.isAdmin = jest.fn().mockResolvedValue(true);
        await expect(etl.assertIsAdminOrEditor(ctx)).resolves.toBeUndefined();
    });

    it("asserts admin or editor returns if user is editor", async () => {
        mgr.isAdmin = jest.fn().mockResolvedValue(false);
        mgr.isInUserGroups = jest.fn().mockResolvedValue(true);
        await expect(etl.assertIsAdminOrEditor(ctx)).resolves.toBeUndefined();
    });

    it("asserts admin or editor throws if user is neither", async () => {
        mgr.isAdmin = jest.fn().mockResolvedValue(false);
        mgr.isInUserGroups = jest.fn().mockResolvedValue(false);
        await expect(etl.assertIsAdminOrEditor(ctx)).rejects.toThrow("Caller is not Admin or Editor");
    });
});