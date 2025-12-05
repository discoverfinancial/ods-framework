/** @jest-environment jsdom */
// import { UserContext } from "dlms-server";

import '@testing-library/jest-dom';
import { ETL } from './etl/etl';
import { EtlProfileService } from "./etl/EtlProfileService";
import { Ods } from './ods';
import { Role } from 'ods-common';

describe('adminSandboxFunctions', () => {

    let pm:Ods;
    let aCtx:any;
    jest.setTimeout(1000);

    beforeEach(async () => {
        pm = new Ods({
            appName: "TestApp",
            documents: {},
            userGroups: [{ id: "Admin", deletable: false }],
            adminGroups: ["Admin"],
            adminRole: "Admin",
            roles: [Role.Employee],
            email: "test@example.com",
            userProfileService: {} as EtlProfileService
        });

        pm.etl = ETL.getInstance(pm);
        aCtx = pm.getAdminContext();
    });

    afterAll(done => {
        done()
    })

    it("getDocs can be called from the sandbox", async () => {

        const code = `
            const result = getDocs();
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions getDocs", result);

        expect(result).not.toEqual({"error": "ReferenceError: getDocs is not defined"});
    });


    it("getDoc can be called from the sandbox", async () => {

        const code = `
            const result = getDoc();
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions getDoc", result);

        expect(result).not.toEqual({"error": "ReferenceError: getDoc is not defined"});
    });


    it("query can be called from the sandbox", async () => {

        const code = `
            const result = (typeof query === 'function');
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions query", result);

        expect(result).toEqual(true);
    });


    it("getAllLeanixDates can be called from the sandbox", async () => {

        const code = `
            const result = (typeof getAllLeanixDates === 'function');
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions getAllLeanixDates", result);

        expect(result).not.toEqual({"error": "ReferenceError: getAllLeanixDates is not defined"});
    });


    it("getRepositoriesFromSor can be called from the sandbox", async () => {

        const code = `
            const result = (typeof getRepositoriesFromSor === 'function');
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions getRepositoriesFromSor", result);

        expect(result).not.toEqual({"error": "ReferenceError: getRepositoriesFromSor is not defined"});
    });


    it("axiosGet can be called from the sandbox", async () => {

        const code = `
            const result = (typeof axiosGet === 'function');
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions axiosGet", result);

        expect(result).toEqual(true);
    });


    it("axiosPost can be called from the sandbox", async () => {

        const code = `
            const result = (typeof axiosPost === 'function');
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions axiosPost", result);

        expect(result).toEqual(true);
    });


    it("axiosPut can be called from the sandbox", async () => {

        const code = `
            const result = (typeof axiosPut === 'function');
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions axiosPut", result);

        expect(result).toEqual(true);
    });


    it("axiosPatch can be called from the sandbox", async () => {
        const code = `
            const result = (typeof axiosPatch === 'function');
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions axiosPatch", result);

        expect(result).toEqual(true);
    });


    it("axiosDelete can be called from the sandbox", async () => {

        const code = `
            const result = (typeof axiosDelete === 'function');
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions axiosDelete", result);

        expect(result).toEqual(true);
    });


    it("getProfile can be called from the sandbox", async () => {

        const code = `
            const result = getProfile();
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions getProfile", result);

        expect(result).not.toEqual({"error": "ReferenceError: getProfile is not defined"});
    });


    it("getManagementChain can be called from the sandbox", async () => {

        const code = `
            const result = getManagementChain();
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions getManagementChain", result);

        expect(result).not.toEqual({"error": "ReferenceError: getManagementChain is not defined"});
    });


    it("getLogs can be called from the sandbox", async () => {

        const code = `
            const result = getLogs();
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions getLogs", result);

        expect(result).not.toEqual({"error": "ReferenceError: getLogs is not defined"});
    });


    it("getStatus can be called from the sandbox", async () => {

        const code = `
            const result = getStatus();
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions getStatus", result);

        expect(result).not.toEqual({"error": "ReferenceError: getStatus is not defined"});
    });


    it("setNotebookId can be called from the sandbox", async () => {

        const code = `
            const result = setNotebookId();
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions setNotebookId", result);

        expect(result).not.toEqual({"error": "ReferenceError: setNotebookId is not defined"});
    });


    it("getNotebookId can be called from the sandbox", async () => {

        const code = `
            const result = getNotebookId();
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions getNotebookId", result);

        expect(result).not.toEqual({"error": "ReferenceError: getNotebookId is not defined"});
    });


    it("setNotebookVar can be called from the sandbox", async () => {

        const code = `
            const result = setNotebookVar();
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions setNotebookVar", result);

        expect(result).not.toEqual({"error": "ReferenceError: setNotebookVar is not defined"});
    });


    it("getNotebookVar can be called from the sandbox", async () => {

        const code = `
            const result = (typeof getNotebookVar === 'function');
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions getNotebookVar", result);

        expect(result).toEqual(true);
    });


    it("getNotebookVars can be called from the sandbox", async () => {

        const code = `
            const result = getNotebookVars();
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions getNotebookVars", result);

        expect(result).not.toEqual({"error": "ReferenceError: getNotebookVars is not defined"});
    });


    it("deleteNotebookVar can be called from the sandbox", async () => {

        const code = `
            const result = deleteNotebookVar();
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions deleteNotebookVar", result);

        expect(result).not.toEqual({"error": "ReferenceError: deleteNotebookVar is not defined"});
    });


    it("compareVersions can be called from the sandbox", async () => {

        const code = `
            const result = compareVersions();
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions compareVersions", result);

        expect(result).not.toEqual({"error": "ReferenceError: compareVersions is not defined"});
    });


    it("createStoreDoc can be called from the sandbox", async () => {

        const code = `
            const result = typeof createStoreDoc;
            setResult({
                value: result
            });
        `;
        
        //const result = await pm.runUserScript(aCtx, {item: item, script: code});

        const result = await pm.runUserScript(aCtx, {script: code});

        console.log("!!!! adminSandboxFunctions createStoreDoc", result);

        expect(result).not.toEqual({"error": "ReferenceError: createStoreDoc is not defined"});
    });


    it("createDoc can be called from the sandbox", async () => {

        const code = `
            const result = createDoc();
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions createDoc", result);

        expect(result).not.toEqual({"error": "ReferenceError: createDoc is not defined"});
    });


    it("updateDoc can be called from the sandbox", async () => {

        const code = `
            const result = updateDoc();
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions updateDoc", result);

        expect(result).not.toEqual({"error": "ReferenceError: updateDoc is not defined"});
    });


    it("writeLog can be called from the sandbox", async () => {

        const code = `
            const result = writeLog();
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions writeLog", result);

        expect(result).not.toEqual({"error": "ReferenceError: writeLog is not defined"});
    });


    it("deleteLog can be called from the sandbox", async () => {

        const code = `
            const result = deleteLog();
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions deleteLog", result);

        expect(result).not.toEqual({"error": "ReferenceError: deleteLog is not defined"});
    });


    it("setStatus can be called from the sandbox", async () => {

        const code = `
            const result = setStatus();
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions setStatus", result);

        expect(result).not.toEqual({"error": "ReferenceError: setStatus is not defined"});
    });


    it("setStatusComment can be called from the sandbox", async () => {

        const code = `
            const result = setStatusComment();
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions setStatusComment", result);

        expect(result).not.toEqual({"error": "ReferenceError: setStatusComment is not defined"});
    });


    it("stop can be called from the sandbox", async () => {

        const code = `
            const result = stop();
            setResult({
                value: result
            });
        `;
        
        const result = await pm.runUserScript(aCtx, {script: code});

        // console.log("adminSandboxFunctions stop", result);

        expect(result).not.toEqual({"error": "ReferenceError: stop is not defined"});
    });
});