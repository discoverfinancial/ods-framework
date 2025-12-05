import { Ods } from "../ods";
import { EtlLogController, BackupController, OdsController } from "../controllers/odsController";
import express from "express";

describe("EtlLogController", () => {
  let req: any;
  let etl: any;
  let mgr: any;

  beforeEach(() => {
    etl = { deleteLog: jest.fn(), deleteLogs: jest.fn() };
    mgr = {
      getCtx: jest.fn().mockReturnValue({}),
      etl,
    };
    req = { res: { status: jest.fn().mockReturnThis(), json: jest.fn() } };
    jest.spyOn(Ods, "getInstance").mockReturnValue(mgr);
  });

  // deleteLog tests

  it("deletes a specific log when ETL is enabled", async () => {
    etl.deleteLog = jest.fn().mockResolvedValue({ success: true });
    const controller = new EtlLogController();
    const result = await controller.deleteLog(req, "logid");
    expect(etl.deleteLog).toHaveBeenCalledWith({}, "logid");
    expect(result).toEqual({ success: true });
  });

  it("returns 404 when ETL is not enabled for deleteLog", async () => {
    mgr.etl = undefined;
    const controller = new EtlLogController();
    await controller.deleteLog(req, "logid");
    expect(req.res.status).toHaveBeenCalledWith(404);
    expect(req.res.json).toHaveBeenCalledWith({ message: "ETL is not enabled" });
  });

  // deleteLogs tests

  it("deletes logs older than a date when ETL is enabled", async () => {
    etl.deleteLogs = jest.fn().mockResolvedValue({ deleted: 5 });
    const controller = new EtlLogController();
    const result = await controller.deleteLogs(req, "1234567890");
    expect(etl.deleteLogs).toHaveBeenCalledWith({}, "1234567890");
    expect(result).toEqual({ deleted: 5 });
  });

  it("returns 404 when ETL is not enabled for deleteLogs", async () => {
    mgr.etl = undefined;
    const controller = new EtlLogController();
    await controller.deleteLogs(req, "1234567890");
    expect(req.res.status).toHaveBeenCalledWith(404);
    expect(req.res.json).toHaveBeenCalledWith({ message: "ETL is not enabled" });
  });
});



describe("BackupController", () => {
  let req: any;
  let mgr: any;

  beforeEach(() => {
    mgr = {
      getCtx: jest.fn().mockReturnValue({}),
      getCollectionNames: jest.fn(),
      getRemoteCollectionNames: jest.fn(),
      getCollectionData: jest.fn(),
      importCollections: jest.fn(),
    };
    req = { res: {} };
    jest.spyOn(Ods, "getInstance").mockReturnValue(mgr);
  });

  // getCollectionNames tests

  it("returns local collection names", async () => {
    mgr.getCollectionNames = jest.fn().mockResolvedValue(["col1", "col2"]);
    const controller = new BackupController();
    const result = await controller.getCollectionNames(req);
    expect(mgr.getCollectionNames).toHaveBeenCalledWith({});
    expect(result).toEqual(["col1", "col2"]);
  });

  // getRemoteCollectionNames tests

  it("returns remote collection names", async () => {
    mgr.getRemoteCollectionNames = jest.fn().mockResolvedValue(["remote1"]);
    const controller = new BackupController();
    const body = { odsUrl: "url", user: "u", pass: "p" };
    const result = await controller.getRemoteCollectionNames(req, body);
    expect(mgr.getRemoteCollectionNames).toHaveBeenCalledWith({}, "url", "u", "p");
    expect(result).toEqual(["remote1"]);
  });

  // getCollectionData tests

  it("returns collection data with default encoding", async () => {
    mgr.getCollectionData = jest.fn().mockResolvedValue({ data: "abc" });
    const controller = new BackupController();
    const names = JSON.stringify(["colA"]);
    const result = await controller.getCollectionData(req, names);
    expect(mgr.getCollectionData).toHaveBeenCalledWith({}, ["colA"], "base64", req.res);
    expect(result).toEqual({ data: "abc" });
  });

  // importCollections tests

  it("imports collections with all options", async () => {
    mgr.importCollections = jest.fn().mockResolvedValue({ imported: true });
    const controller = new BackupController();
    const body = {
      names: [{"name": "colB"}],
      odsUrl: "url",
      user: "u",
      pass: "p",
      encoding: "utf8",
      alwaysUpdate: true,
      deleteCollection: true,
    };
    const result = await controller.importCollections(req, body);
    expect(mgr.importCollections).toHaveBeenCalledWith({}, [{"name": "colB"}], "url", "u", "p", "utf8", true, true);
    expect(result).toEqual({ imported: true });
  });
});

describe("OdsController", () => {
  let req: any;
  let mgr: any;

  beforeEach(() => {
    mgr = {
      getStatus: jest.fn(),
      getCtx: jest.fn().mockReturnValue({}),
      getRoles: jest.fn(),
      etl: { runUserScriptId: jest.fn(), runUserScript: jest.fn() },
      getNotebookVars: jest.fn(),
      getNotebookVar: jest.fn(),
      getNotebookVarsSnapshotNames: jest.fn(),
      restoreNotebookVarsSnapshot: jest.fn(),
      copyNotebookVars: jest.fn(),
      setNotebookVar: jest.fn(),
      saveNotebookVarsSnapshot: jest.fn(),
      deleteNotebookVar: jest.fn(),
      deleteNotebookVarsSnapshot: jest.fn(),
    };
    req = { res: { status: jest.fn().mockReturnThis(), json: jest.fn(), write: jest.fn(), end: jest.fn() } };
    jest.spyOn(Ods, "getInstance").mockImplementation(() => mgr as any);

  });

  // odsStatus tests

  it("returns ODS status", async () => {
    mgr.getStatus = jest.fn().mockResolvedValue({ healthy: true });
    const controller = new OdsController();
    const result = await controller.odsStatus(req);
    expect(result).toEqual({ healthy: true });
  });

  // roles tests

  it("returns user roles", async () => {
    mgr.getRoles = jest.fn().mockResolvedValue(["admin"]);
    const controller = new OdsController();
    const result = await controller.roles(req);
    expect(result).toEqual(["admin"]);
  });

  // runScriptId tests

  it("runs script by id when ETL is enabled", async () => {
    mgr.runUserScriptId = jest.fn().mockResolvedValue({ ok: true });
    const controller = new OdsController();
    const result = await controller.runScriptId(req, "scriptid", { param: 1 });
    expect(result).toEqual({ ok: true });
  });

  it("returns 404 for runScriptId when ETL is not enabled", async () => {
    mgr.etl = undefined;
    const controller = new OdsController();
    await controller.runScriptId(req, "scriptid", {});
    expect(req.res.status).toHaveBeenCalledWith(404);
    expect(req.res.json).toHaveBeenCalledWith({ message: "ETL is not enabled" });
  });

  // runScript tests

  // getNotebookvars tests

  it("gets notebook variables", async () => {
    mgr.getNotebookVars = jest.fn().mockResolvedValue(["var1"]);
    const controller = new OdsController();
    const result = await controller.getNotebookvars(req, "nbid");
    expect(result).toEqual(["var1"]);
  });

  // getNotebookvar tests

  it("gets notebook variable", async () => {
    mgr.getNotebookVar = jest.fn().mockResolvedValue({ value: 42 });
    const controller = new OdsController();
    const result = await controller.getNotebookVar(req, "nbid", "name");
    expect(result).toEqual({ value: 42 });
  });

  // processCommand2 tests

  it("gets notebook variable snapshot names", async () => {
    mgr.getNotebookVarsSnapshotNames = jest.fn().mockResolvedValue(["snap1"]);
    const controller = new OdsController();
    const result = await controller.processCommand2(req, "nbid");
    expect(result).toEqual(["snap1"]);
  });

  // restoreNotebookVarsSnapshot tests

  it("restores notebook variables from snapshot", async () => {
    mgr.restoreNotebookVarsSnapshot = jest.fn().mockResolvedValue(["varA"]);
    const controller = new OdsController();
    const result = await controller.restoreNotebookVarsSnapshot(req, "nbid", "snapA");
    expect(result).toEqual(["varA"]);
  });

  // copyNotebookvars tests

  it("copies notebook variables between notebooks", async () => {
    mgr.copyNotebookVars = jest.fn().mockResolvedValue(["varB"]);
    const controller = new OdsController();
    const result = await controller.copyNotebookvars(req, "from", "to");
    expect(result).toEqual(["varB"]);
  });

  // setNotebookvar tests

  it("sets a notebook variable", async () => {
    mgr.setNotebookVar = jest.fn().mockResolvedValue({ value: "set" });
    const controller = new OdsController();
    const result = await controller.setNotebookvar(req, "nbid", "name", { v: 1 });
    expect(result).toEqual({ value: "set" });
  });

  // saveNotebookVarsSnapshot tests

  it("saves notebook variables snapshot", async () => {
    mgr.saveNotebookVarsSnapshot = jest.fn().mockResolvedValue(["saved"]);
    const controller = new OdsController();
    const result = await controller.saveNotebookVarsSnapshot(req, "nbid", "snap", { description: "desc" });
    expect(result).toEqual(["saved"]);
  });

  // deleteNotebookVar tests

  it("deletes a notebook variable", async () => {
    mgr.deleteNotebookVar = jest.fn().mockResolvedValue({ deleted: true });
    const controller = new OdsController();
    const result = await controller.deleteNotebookVar(req, "nbid", "name");
    expect(result).toEqual({ deleted: true });
  });

  // deleteNotebookVarsSnapshot tests

  it("deletes a notebook variables snapshot", async () => {
    mgr.deleteNotebookVarsSnapshot = jest.fn().mockResolvedValue({ deleted: true });
    const controller = new OdsController();
    const result = await controller.deleteNotebookVarsSnapshot(req, "nbid", "snap");
    expect(result).toEqual({ deleted: true });
  });
});


