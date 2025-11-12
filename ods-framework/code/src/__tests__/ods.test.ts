import {Ods} from "../ods";
import { Role, logType } from "ods-common"
import { EtlProfileService } from "../etl/EtlProfileService";
import axios from "axios";
var fs = require("fs");

const ods = new Ods({
    appName: "TestApp",
    documents: {},
    userGroups: [{ id: "Admin", deletable: false }],
    adminGroups: ["Admin"],
    adminRole: "Admin",
    roles: [Role.Employee],
    email: "test@example.com",
    userProfileService: {} as EtlProfileService
});


afterEach(() => {
  jest.restoreAllMocks();
});

// getRoles tests

it("getRoles returns Employee, Administrator, and Editor roles as appropriate", async () => {
    const ctx = {} as any;

    jest.spyOn(ods, "isAdmin").mockResolvedValueOnce(true);
    jest.spyOn(ods, "isInUserGroups").mockResolvedValueOnce(true);
    const result = await ods.getRoles(ctx);
    expect(result).toEqual([Role.Employee, Role.Administrator, Role.Editor]);
});

it("getRoles returns Employee and Editor roles as appropriate", async () => {
    const ctx = {} as any;

    jest.spyOn(ods, "isAdmin").mockResolvedValueOnce(false);
    jest.spyOn(ods, "isInUserGroups").mockResolvedValueOnce(true);
    const result = await ods.getRoles(ctx);
    expect(result).toEqual([Role.Employee, Role.Editor]);

});

it("getRoles returns Employee role as appropriate", async () => {
    const ctx = {} as any;

    jest.spyOn(ods, "isAdmin").mockResolvedValueOnce(false);
    jest.spyOn(ods, "isInUserGroups").mockResolvedValueOnce(false);
    const result = await ods.getRoles(ctx);
    expect(result).toEqual([Role.Employee]);
});

// getNotebookvarCollection tests

it("getNotebookvarCollection returns the correct collection when notebookVarCollection is null", async () => {
    const ctx = {} as any;
    ods.notebookvarCollection = null;
    ods.getCollection = jest.fn().mockResolvedValue("notebookvarCollection");
    const result = await ods.getNotebookvarCollection();
    expect(result).toBe("notebookvarCollection");
});

it("getNotebookvarCollection returns the correct collection when notebookVarCollection is not null", async () => {
    const ctx = {} as any;
    ods.notebookvarCollection = "x";
    const result = await ods.getNotebookvarCollection();
    expect(result).toBe("x");
});

// getNotebookVars tests

it("getNotebookVars returns undefined if there is no notebookId", async () => {
    const result = await ods.getNotebookVars("");
    expect(result).toBeUndefined();
});

it("getNotebookVars throws error if readdirSync fails", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "true";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });
    const mockDocs: any[] = [];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    jest.spyOn(fs, "readdirSync").mockImplementation(() => { throw new Error("Failed to read directory"); });
    await expect(ods.getNotebookVars("notebook1")).rejects.toThrow("Error reading notebook variables for notebook");
    jest.restoreAllMocks();
});

it("getNotebookVars returns proper variables if useNotebookVarsInFile is true", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "true";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });
    const mockDocs: any[] = [];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    jest.spyOn(fs, "readdirSync").mockReturnValue(["x.json", "abc.json", "file"])
    const result = await ods.getNotebookVars("x");
    expect(result).toEqual(["x", "abc"]);
    jest.restoreAllMocks();
});

it("getNotebookVars returns proper variables if useNotebookVarsInFile is false", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "false";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });

    const mockDocs = [{name: "A"}, {name: "B"}, {name: "file"}];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    const result = await ods.getNotebookVars("x");
    expect(result).toEqual(["A", "B", "file"]);
    jest.restoreAllMocks();
});

// getNotebookVar tests

it("getNotebookVar returns null if there is no notebookId", async () => {
    let result = await ods.getNotebookVar("", "var1");
    expect(result).toBeNull();
});

it("getNotebookVar returns null if there is no name", async () => {
    let result = await ods.getNotebookVar("1", "");
    expect(result).toBeNull();
});

it("getNotebookVar throws error if looking for notebook variables in file system rejects", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "true";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });
    const mockDocs: any[] = [];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    jest.spyOn(fs, "existsSync").mockImplementation(() => { throw new Error("Failed to check file existence"); });
    await expect(ods.getNotebookVar("1", "x")).rejects.toThrow();
});

it("getNotebookVar returns proper variables when useNotebookVarsInFile is true", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "true";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });
    const mockDocs: any[] = [];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    const notebookId = "notebook1";
    const varName = "myVar";
    const expectedValue = { foo: "bar" };

    // Mock fs.existsSync and fs.readFileSync
    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    jest.spyOn(fs, "readFileSync").mockReturnValue(Buffer.from(JSON.stringify(expectedValue)));

    const result = await ods.getNotebookVar(notebookId, varName);

    expect(result).toEqual(expectedValue);

    // Restore mocks
    jest.restoreAllMocks();
});

it("getNotebookVar returns proper variable if notebookVarsInFile is false and variable is not an array", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "false";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });

    const mockDocs = [{name: "A", value: "x"}, {name: "B"}, {name: "file"}];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);


    const result = await ods.getNotebookVar("x", "x");
    expect(result).toEqual("x");
    jest.restoreAllMocks();
});

it("getNotebookVar returns proper variable if notebookVarsInFile is false and variable is an array", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "false";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });

    const mockDocs = [{name: "A", value: ["x"], type: "array"}, {name:"y", value: ["1", "2"]}];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    const result = await ods.getNotebookVar("x", "x");
    expect(result).toEqual(["x", "1", "2"]);
    jest.restoreAllMocks();
});

// setNotebookVar tests

it("setNotebookVar returns null if there is no notebookId", async () => {
    let result = await ods.setNotebookVar("", "var1", "x");
    expect(result).toBeNull();
});

it("setNotebookVar returns null if there is no name", async () => {
    let result = await ods.setNotebookVar("1", "", "x");
    expect(result).toBeNull();
});

it("setNotebookVar throws error if writeFileSync errors", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "true";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });
    const mockDocs: any[] = [];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    jest.spyOn(fs, "writeFileSync").mockImplementation(() => { throw new Error("Failed to writefile"); });
    jest.spyOn(fs, "existsSync").mockReturnValue(false);
    await expect(ods.setNotebookVar("1", "x", 1)).rejects.toThrow();
})

it("setNotebookVar returns value if successfully uses writeFileSync if using file system for notebook variables", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "true";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });
    const mockDocs: any[] = [];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    jest.spyOn(fs, "writeFileSync").mockReturnValue(undefined);
    jest.spyOn(fs, "existsSync").mockReturnValue(false);
    let result = await ods.setNotebookVar("1", "x", 1);
    expect(result).toEqual(1);

});

it("setNotebookVar returns proper value and calls pc.deleteMany if useNotebookVarsInFile is false, pc.find returns a non-empty array, and value is not an array", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "false";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });

    const mockDocs = [{name: "A"}, {name: "B"}, {name: "file"}];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
      deleteMany: jest.fn().mockResolvedValue({} as any),
      insertOne: jest.fn().mockResolvedValue("x")
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    const result = await ods.setNotebookVar("id", "name", "value");
    expect(mockCollection.deleteMany).toHaveBeenCalled();
    expect(result).toEqual("x");
    jest.restoreAllMocks();
});

it("setNotebookVar returns proper value and doesn't call pc.deleteMany if useNotebookVarsInFile is false, pc.find returns an empty array, and value is an array", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "false";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });

    const mockDocs: any[] = [];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
      deleteMany: jest.fn().mockResolvedValue({} as any),
      insertOne: jest.fn().mockResolvedValue("x")
    };

    const sampleValue = Array.from({ length: 1001 }, (_, i) => i);

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    const result = await ods.setNotebookVar("id", "name", sampleValue);
    expect(result).toEqual(sampleValue);
    expect(mockCollection.insertOne).toHaveBeenCalledTimes(3);
    expect(mockCollection.deleteMany).not.toHaveBeenCalled();
    jest.restoreAllMocks();
});

// deleteNotebookVar tests

it("deleteNotebookVar returns null if useNotebookVarsInFile is true", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "true";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });
    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    jest.spyOn(fs, "unlinkSync").mockReturnValue(undefined);

    const result = await ods.deleteNotebookVar("1", "var1");
    expect(result).toBeNull();
    expect(fs.unlinkSync).toHaveBeenCalled();
});

it("deleteNotebookVar returns null if useNotebookVarsInFile is false", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "false";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });

    const mockCollection = {
      deleteMany: jest.fn().mockResolvedValue({} as any),
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    const result = await ods.deleteNotebookVar("1", "var1");
    expect(result).toBeNull();
    expect(mockCollection.deleteMany).toHaveBeenCalled();
});

// copyRecursive tests



// copyNotebookVars tests

it("copyNotebookVars returns null if there is no source NotebookId", async () => {
    let result = await ods.copyNotebookVars("", "destId");
    expect(result).toBeNull();
});

it("copyNotebookVars returns null if there is no destination NotebookId", async () => {
    let result = await ods.copyNotebookVars("sourceId", "");
    expect(result).toBeNull();
});

it("copyNotebookVars returns null if copyRecursive fails", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "true";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });
    const mockDocs: any[] = [];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    ods.copyRecursive  = jest.fn().mockRejectedValue(new Error("fail"));
    let result = await ods.copyNotebookVars("sourceId", "destId");
    expect(result).toBeNull();
});

// getNotebookVarsSnapshotNames tests

it("getNotebookVarsSnapshotNames returns null if there is no notebookId", async () => {
    let result = await ods.getNotebookVarsSnapshotNames("");
    expect(result).toBeNull();
});

it("getNotebookVarsSnapshotNames returns variable array when useNotebookVarsInFile is true", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "true";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });
    const mockDocs: any[] = [];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    jest.spyOn(fs, "readdirSync").mockReturnValue(["snap1.json", "snap2.json", "file"]);
    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    jest.spyOn(fs, "readFileSync").mockReturnValue("x content");
    jest.spyOn(fs, "lstatSync").mockReturnValue({
        isDirectory: () => true
    });
    let result = await ods.getNotebookVarsSnapshotNames("notebook1");
    expect(result).toEqual([{name: "snap1.json", description: "x content"}, {name: "snap2.json", description: "x content"}, {name: "file", description: "x content"}]);
});

it("getNotebookVarsSnapshotNames returns empty array if useNotebookVarsInFile is true and fs operations fail.", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "true";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });
    const mockDocs: any[] = [];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    jest.spyOn(fs, 'readdirSync').mockReturnValue(["snap1.json", "snap2.json", "file"])
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('fail2');
    });
    let result = await ods.getNotebookVarsSnapshotNames("notebook1");
    expect(result).toEqual([]);
});

it("getNotebookVarsSnapshotNames returns empty array if useNotebookVarsInFile is true and fs.existsSync is false.", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "true";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });
    const mockDocs: any[] = [];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    jest.spyOn(fs, "existsSync").mockReturnValue(false);
    let result = await ods.getNotebookVarsSnapshotNames("notebook1");
    expect(result).toEqual([]);
});

it("getNotebookVarsSnapshotNames returns correct value if useNotebookVarsInFile is false", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "false";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });

    const mockDocs = [{snapshotName: "snap1", snapshotDescription: "desc1"}, {snapshotName: "snap2", snapshotDescription: "desc2"}];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      })
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    const result = await ods.getNotebookVarsSnapshotNames("id");
    expect(result).toEqual([{name: "snap1", description: "desc1"}, {name: "snap2", description: "desc2"}]);

    jest.restoreAllMocks();
});



// saveNotebookVarsSnapshot tests

it("saveNotebookVarsSnapshot returns null if there is no notebookId", async () => {
    let result = await ods.saveNotebookVarsSnapshot("", "x", "");
    expect(result).toBeNull();
});

it("saveNotebookVarsSnapshot returns null if there is no snapshotName", async () => {
    let result = await ods.saveNotebookVarsSnapshot("x", "", "");
    expect(result).toBeNull();
});

it("saveNotebookVarsSnapshot returns files if useNotebookVarsInFile is true and writeFileSync succeeds", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "true";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });
    const mockDocs: any[] = [];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    jest.spyOn(fs, "writeFileSync").mockReturnValue(undefined);
    jest.spyOn(fs, "existsSync").mockReturnValue(false);
    jest.spyOn(fs, "readdirSync").mockReturnValue(["file1.json", "file2.json", "file3"]);
    jest.spyOn(fs, "readFileSync").mockReturnValue(true);
    let result = await ods.saveNotebookVarsSnapshot("notebook1", "snapshot1", "value1" );
    expect(result).toEqual(["file1.json", "file2.json"]);
});

it("saveNotebookVarsSnapshot returns null if useNotebookVarsInFile is true and writeFileSync fails", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "true";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });
    const mockDocs: any[] = [];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
            throw new Error('fail');
        });
    jest.spyOn(fs, "existsSync").mockReturnValue(false);
    jest.spyOn(fs, "readdirSync").mockReturnValue(["file1.json", "file2.json", "file3"]);
    jest.spyOn(fs, "readFileSync").mockReturnValue(true);
    let result = await ods.saveNotebookVarsSnapshot("notebook1", "snapshot1", "value1" );
    expect(result).toBeNull();
});

it("saveNotebookVarsSnapshot returns correct value if useNotebookVarsInFile is false", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "false";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });

    jest.spyOn(ods, "getNotebookVars").mockReturnValue(["var1", "var2"]);

    const mockDocs = [{notebook: "note1", name: "var1", type: "x", value: "x", snapshotName: "snap1", snapshotDescription: "desc1"}, {notebook: "note2", name: "var2", type: "x", value: "x", snapshotName: "snap2", snapshotDescription: "desc2"}];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
      insertOne: jest.fn().mockResolvedValue("x")
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    const result = await ods.saveNotebookVarsSnapshot("id", "name", "description");

    expect(result).toEqual(["var1", "var2"]);
    expect(mockCollection.insertOne).toHaveBeenCalledTimes(4);
    jest.restoreAllMocks();
});

it("saveNotebookVarsSnapshot returns null if useNotebookVarsInFile is false and getNotebookVars returns empty list", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "false";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });

    jest.spyOn(ods, "getNotebookVars").mockReturnValue([]);

    const mockDocs: any[] = [];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      })
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    const result = await ods.saveNotebookVarsSnapshot("id", "name", "description");
    expect(result).toBeNull();
    jest.restoreAllMocks();
});

it("saveNotebookVarsSnapshot returns empty list if useNotebookVarsInFile is false and pc.find returns empty list", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "false";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });

    const mockDocs: any[] = [];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      })
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    ods.getNotebookVars = jest.fn().mockReturnValue(["var1", "var2"]);

    const result = await ods.getNotebookVarsSnapshotNames("id");
    expect(result).toEqual([]);
    jest.restoreAllMocks();
});

// restoreNotebookVarsSnapshot tests

it("restoreNotebookVarsSnapshot returns null if there is no notebookId", async () => {
    let result = await ods.restoreNotebookVarsSnapshot("", "x");
    expect(result).toBeNull();
});

it("restoreNotebookVarsSnapshot returns null if there is no snapshotName", async () => {
    let result = await ods.restoreNotebookVarsSnapshot("x", "");
    expect(result).toBeNull();
});

it("restoreNotebookVarsSnapshot returns files if useNotebookVarsInFile is true and fs functions succeed", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "true";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });
    const mockDocs: any[] = [];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    jest.spyOn(fs, "readdirSync").mockReturnValue(["x.json", "file1.json", "file2"]);
    jest.spyOn(fs, "readFileSync").mockReturnValue(true);
    jest.spyOn(fs, "writeFileSync").mockReturnValue(true);
    let result = await ods.restoreNotebookVarsSnapshot("x", "x");
    expect(result).toEqual(["x.json", "file1.json"]);
});

it("restoreNotebookVarsSnapshot returns null if useNotebookVarsInFile is true and fs functions fail", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "true";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });
    const mockDocs: any[] = [];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    jest.spyOn(fs, "readdirSync").mockReturnValue(["x.json", "file1.json", "file2"]);
    jest.spyOn(fs, "readFileSync").mockReturnValue(true);
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('fail');
    });
    let result = await ods.restoreNotebookVarsSnapshot("x", "x");
    expect(result).toEqual(null);
});

it("restoreNotebookVarsSnapshot returns null if useNotebookVarsInFile is true and snapshot does not exist", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "true";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });
    const mockDocs: any[] = [];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);
    jest.spyOn(fs, "existsSync").mockReturnValue(false);
    let result = await ods.restoreNotebookVarsSnapshot("x", "x");
    expect(result).toBeNull();
});

it("restoreNotebookVarsSnapshot returns correct value if useNotebookVarsInFile is false", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "false";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });

    ods.getNotebookVars = jest.fn().mockReturnValue(["var1", "var2"]);

    const mockDocs = [{notebook: "note1", name: "var1", type: "x", value: "x"}, {notebook: "note2", name: "var2", type: "x", value: "x"}, {notebook: "note2", name: "var2", type: "x", value: "x"}];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
      deleteMany: jest.fn().mockResolvedValue({} as any),
      insertOne: jest.fn().mockResolvedValue("x")
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    const result = await ods.restoreNotebookVarsSnapshot("id", "name");
    expect(result).toEqual(["var1", "var2"]);
    expect(mockCollection.deleteMany).toHaveBeenCalledTimes(2);
    expect(mockCollection.insertOne).toHaveBeenCalledTimes(3);
    jest.restoreAllMocks();
});

it("restoreNotebookVarsSnapshot returns null if useNotebookVarsInFile is false and pc.find returns empty array", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "false";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });

    ods.getNotebookVars = jest.fn().mockReturnValue(["var1", "var2"]);

    const mockDocs: any[] = [];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      })
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);

    const result = await ods.restoreNotebookVarsSnapshot("id", "name");
    expect(result).toBeNull();
    jest.restoreAllMocks();
});

// deleteNotebookVarsSnapshot tests

it("deleteNotebookVarsSnapshot returns null if there is no notebookId", async () => {
    let result = await ods.deleteNotebookVarsSnapshot("", "x");
    expect(result).toBeNull();
});

it("deleteNotebookVarsSnapshot returns null if there is no snapshotName", async () => {
    let result = await ods.deleteNotebookVarsSnapshot("x", "");
    expect(result).toBeNull();
});

it("deleteNotebookVarsSnapshot returns null if useNotebookVarsInFile is true and fs functions fail", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "true";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });
    const mockDocs: any[] = [];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);
    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    jest.spyOn(fs, 'readdirSync').mockImplementation(() => {
        throw new Error('fail');
    });
    let result = await ods.deleteNotebookVarsSnapshot("x", "x");
    expect(result).toBeNull();
});

it("deleteNotebookVarsSnapshot returns null if useNotebookVarsInFile is true and fs functions succeed", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "true";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });
    const mockDocs: any[] = [];
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocs),
      }),
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);
    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    jest.spyOn(fs, "rmSync").mockReturnValue(["x.json", "file1.json", "file2"]);
    const result = await ods.deleteNotebookVarsSnapshot("x", "x");
    expect(result).toBeNull();
});

it("deleteNotebookVarsSnapshot returns null if useNotebookVarsInFile is false", async () => {
    process.env.USE_NOTEBOOKVARS_IN_FILE = "false";
    jest.resetModules();
    const { Ods } = require("../ods");
    const ods = new Ods({
        appName: "TestApp",
        documents: {},
        userGroups: [{ id: "Admin", deletable: false }],
        adminGroups: ["Admin"],
        adminRole: "Admin",
        roles: [Role.Employee],
        email: "test@example.com",
        userProfileService: {} as EtlProfileService
    });
    const mockDocs: any[] = [];
    const mockCollection = {
      deleteMany: jest.fn().mockReturnValue({}),
    };

    jest.spyOn(ods, "getNotebookvarCollection").mockResolvedValue(mockCollection);
    const result = await ods.deleteNotebookVarsSnapshot("x", "x");
    expect(result).toBeNull();
});

// writeLog tests

it("writeLog creates a log document with the correct message", async () => {
    const ctx = {} as any;
    const message = "Test log message";
    const createDocMock = jest.spyOn(Ods.prototype, "createDoc").mockResolvedValue({ key: "ods-log", value: message });
    const result = await ods.writeLog(ctx, message);
    expect(createDocMock).toHaveBeenCalledWith(ctx, logType, { key: "ods-log", value: message });
    expect(result).toEqual({ key: "ods-log", value: message });
    createDocMock.mockRestore();
});

// getLogs tests

it("getLogs retrieves all log documents", async () => {
    const ctx = {} as any;
    const logs = [{ key: "ods-log", value: "msg1" }, { key: "ods-log", value: "msg2" }];
    const getDocsMock = jest.spyOn(Ods.prototype, "getDocs").mockResolvedValue(logs);
    const result = await ods.getLogs(ctx);
    expect(getDocsMock).toHaveBeenCalledWith(ctx, logType, { key: "ods-log" });
    expect(result).toEqual(logs);
    getDocsMock.mockRestore();
});

// deleteLog tests

it("deleteLog removes a log document by id", async () => {
    const ctx = {} as any;
    const id = "logId";
    const deleteDocMock = jest.spyOn(Ods.prototype, "deleteDoc").mockResolvedValue({ deleted: true });
    const result = await ods.deleteLog(ctx, id);
    expect(deleteDocMock).toHaveBeenCalledWith(ctx, { type: logType, id });
    expect(result).toEqual({ deleted: true });
    deleteDocMock.mockRestore();
});

// getCollectionNames tests

it("getCollectionNames returns correct values given mocked allCollectionNames", async () => {
    // Arrange
    const ctx = {} as any;
    Object.defineProperty(ods, "allCollectionNames", {
      value: [
        "db.collectionOne",
        "db.collectionTwo",
        "db.collectionThree.sub"
      ],
      writable: true
    });
    // Mock assertAdmin to bypass admin check
    jest.spyOn(ods, "assertAdmin").mockResolvedValueOnce(undefined);

    // Act
    const result = await ods.getCollectionNames(ctx);

    // Assert
    expect(result).toEqual([
        "collectionOne",
        "collectionTwo",
        "collectionThree.sub"
    ]);
});

// getRemoteCollectionNames tests

it("getRemoteCollectionNames returns [] if there is no odsUrl", async () => {
    const ctx = {} as any;
    let result = await ods.getRemoteCollectionNames(ctx, "", "var1", "x");
    expect(result).toEqual([]);
});

it("getRemoteCollectionNames returns [] if there is no user", async () => {
    const ctx = {} as any;
    let result = await ods.getRemoteCollectionNames(ctx, "x", "", "x");
    expect(result).toEqual([]);
});

it("getRemoteCollectionNames returns [] if there is no pass", async () => {
    const ctx = {} as any;
    let result = await ods.getRemoteCollectionNames(ctx, "x", "x", "");
    expect(result).toEqual([]);
});

it("getRemoteCollectionNames returns [] if fetch fails", async () => {
    const ctx = {} as any;
    jest.spyOn(axios, 'get').mockImplementation(() => {
        throw new Error('fail');
    });
    let result = await ods.getRemoteCollectionNames(ctx, "http://example.com", "user", "pass");
    expect(result).toEqual([]);
});

it("getRemoteCollectionNames returns collection names on success", async () => {
    const ctx = {} as any;
    jest.spyOn(axios, "get").mockResolvedValue({data: ["a", "b", "c"]});
    let result = await ods.getRemoteCollectionNames(ctx, "http://example.com", "user","pass");
    expect(result).toEqual(["a", "b", "c"]);
});

it("getRemoteCollectionNames returns empty array if fetch fails", async () => {
    const ctx = {} as any;
    jest.spyOn(axios, "get").mockRejectedValue(new Error("Network error"));
    let result = await ods.getRemoteCollectionNames(ctx, "http://example.com", "user","pass");
    expect(result).toEqual([]);
});

// importCollections tests

// getServerDocCollection tests

it("getServerDocCollection returns the server document collection if serverDocCollection exists", async () => {
    ods.serverDocCollection = "existingCollection";
    const result = await ods.getServerDocCollection();
    expect(result).toBe("existingCollection");
});

it("getServerDocCollection retrieves the server document collection if serverDocCollection doesn't exist", async () => {
    ods.serverDocCollection = "";
    ods.getCollection  = jest.fn().mockResolvedValue("fetchedCollection");
    const result = await ods.getServerDocCollection();
    expect(result).toBe("fetchedCollection");
});

// getStatus tests

it("getStatus returns the server status document", async () => {
    const statusDoc = { status: "RUNNING" };
    const getServerDocCollectionMock = jest.spyOn(Ods.prototype, "getServerDocCollection").mockResolvedValue({
        findOne: jest.fn().mockResolvedValue(statusDoc)
    });
    const result = await ods.getStatus();
    expect(result).toEqual(statusDoc);
    getServerDocCollectionMock.mockRestore();
});

// getServerStatus tests

it("getServerStatus returns the status field from the server status document", async () => {
    const statusDoc = { status: "IDLE" };
    jest.spyOn(Ods.prototype, "getStatus").mockResolvedValue(statusDoc);
    const result = await ods.getServerStatus();
    expect(result).toBe("IDLE");
});

// setStatus tests

it("setStatus updates the server status document", async () => {
    const updateResult = { modifiedCount: 1 };
    const updateOneMock = jest.fn().mockResolvedValue(updateResult);
    jest.spyOn(Ods.prototype, "getServerDocCollection").mockResolvedValue({
        updateOne: updateOneMock
    });
    const result = await ods.setStatus("IDLE", "cmd", "comment");
    expect(updateOneMock).toHaveBeenCalledWith(
        { _id: "appStatus" },
        { $set: { status: "IDLE", command: "cmd", comment: "comment", dateUpdated: expect.any(Number) } },
        { upsert: true }
    );
    expect(result).toEqual(updateResult);
});

// setStatusComment tests

it("setStatusComment updates the comment field in the server status document", async () => {
    const updateResult = { modifiedCount: 1 };
    const updateOneMock = jest.fn().mockResolvedValue(updateResult);
    jest.spyOn(Ods.prototype, "getServerDocCollection").mockResolvedValue({
        updateOne: updateOneMock
    });

    const result = await ods.setStatusComment("new comment");
    expect(updateOneMock).toHaveBeenCalledWith(
        { _id: "appStatus" },
        { $set: { comment: "new comment", dateUpdated: expect.any(Number) } },
        { upsert: true }
    );
    expect(result).toEqual(updateResult);
});

// stop tests

it("stop sets the status to null", async () => {
    const setStatusMock = jest.spyOn(Ods.prototype, "setStatus").mockResolvedValue({ stopped: true });
    const result = await ods.stop();
    expect(setStatusMock).toHaveBeenCalledWith(null, undefined, undefined, "appStatus");
    expect(result).toEqual({ stopped: true });
    setStatusMock.mockRestore();
});

// getLock tests

it("getLock acquires a lock and returns the lock document", async () => {
    const lockDoc = { _id: "lock_test", dateUpdated: Date.now() };
    const findOneAndUpdateMock = jest.fn().mockResolvedValue(lockDoc);
    jest.spyOn(Ods.prototype, "getServerDocCollection").mockResolvedValue({
        findOneAndUpdate: findOneAndUpdateMock
    });
    const result = await ods.getLock("test");
    expect(findOneAndUpdateMock).toHaveBeenCalled();
    expect(result).toEqual(lockDoc);
});

it("getLock returns null if acquiring the lock fails", async () => {
    const findOneAndUpdateMock = jest.fn().mockRejectedValue(new Error("fail"));
    jest.spyOn(Ods.prototype, "getServerDocCollection").mockResolvedValue({
        findOneAndUpdate: findOneAndUpdateMock
    });
    const result = await ods.getLock("test");
    expect(findOneAndUpdateMock).toHaveBeenCalled();
    expect(result).toBeNull();
});

// checkLock tests

it("checkLock returns the lock document if it exists", async () => {
    const lockDoc = { _id: "lock_test", dateUpdated: Date.now() };
    const findOneMock = jest.fn().mockResolvedValue(lockDoc);
    jest.spyOn(Ods.prototype, "getServerDocCollection").mockResolvedValue({
        findOne: findOneMock
    });
    const result = await ods.checkLock("test");
    expect(findOneMock).toHaveBeenCalledWith({ _id: "lock_test" });
    expect(result).toEqual(lockDoc);
});

// clearLock tests

it("clearLock resets the lock document", async () => {
    const updateOneMock = jest.fn().mockResolvedValue({ modifiedCount: 1 });
    jest.spyOn(Ods.prototype, "getServerDocCollection").mockResolvedValue({
        updateOne: updateOneMock
    });
    const result = await ods.clearLock("test");
    expect(updateOneMock).toHaveBeenCalledWith(
        { _id: "lock_test" },
        { $set: { dateUpdated: 0 } },
        { upsert: true }
    );
    expect(result).toEqual({ modifiedCount: 1 });
});


