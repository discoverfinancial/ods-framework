/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { EtlLogController } from './controllers/odsController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { BackupController } from './controllers/odsController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { OdsController } from './controllers/odsController';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "GetRemoteCollectionNamesBody": {
        "dataType": "refObject",
        "properties": {
            "odsUrl": {"dataType":"string","required":true},
            "user": {"dataType":"string","required":true},
            "pass": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CollectionDataQuery": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "match": {"dataType":"any"},
            "options": {"dataType":"any"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CollectionNamesArray": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"CollectionDataQuery"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ImportCollectionsBody": {
        "dataType": "refObject",
        "properties": {
            "odsUrl": {"dataType":"string","required":true},
            "user": {"dataType":"string","required":true},
            "pass": {"dataType":"string","required":true},
            "names": {"ref":"CollectionNamesArray","required":true},
            "encoding": {"dataType":"string"},
            "alwaysUpdate": {"dataType":"boolean"},
            "deleteCollection": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsEtlLogController_deleteLog: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/api/service/process/deleteLog/:id',
            ...(fetchMiddlewares<RequestHandler>(EtlLogController)),
            ...(fetchMiddlewares<RequestHandler>(EtlLogController.prototype.deleteLog)),

            async function EtlLogController_deleteLog(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEtlLogController_deleteLog, request, response });

                const controller = new EtlLogController();

              await templateService.apiHandler({
                methodName: 'deleteLog',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEtlLogController_deleteLogs: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                date: {"in":"path","name":"date","required":true,"dataType":"string"},
        };
        app.get('/api/service/process/deleteLogs/:date',
            ...(fetchMiddlewares<RequestHandler>(EtlLogController)),
            ...(fetchMiddlewares<RequestHandler>(EtlLogController.prototype.deleteLogs)),

            async function EtlLogController_deleteLogs(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEtlLogController_deleteLogs, request, response });

                const controller = new EtlLogController();

              await templateService.apiHandler({
                methodName: 'deleteLogs',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBackupController_getCollectionNames: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/backup/getCollectionNames',
            ...(fetchMiddlewares<RequestHandler>(BackupController)),
            ...(fetchMiddlewares<RequestHandler>(BackupController.prototype.getCollectionNames)),

            async function BackupController_getCollectionNames(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBackupController_getCollectionNames, request, response });

                const controller = new BackupController();

              await templateService.apiHandler({
                methodName: 'getCollectionNames',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBackupController_getRemoteCollectionNames: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                body: {"in":"body","name":"body","required":true,"ref":"GetRemoteCollectionNamesBody"},
        };
        app.post('/api/backup/getRemoteCollectionNames',
            ...(fetchMiddlewares<RequestHandler>(BackupController)),
            ...(fetchMiddlewares<RequestHandler>(BackupController.prototype.getRemoteCollectionNames)),

            async function BackupController_getRemoteCollectionNames(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBackupController_getRemoteCollectionNames, request, response });

                const controller = new BackupController();

              await templateService.apiHandler({
                methodName: 'getRemoteCollectionNames',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBackupController_getCollectionData: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                names: {"in":"query","name":"names","required":true,"dataType":"string"},
                encoding: {"in":"query","name":"encoding","dataType":"string"},
        };
        app.get('/api/backup/getCollectionData',
            ...(fetchMiddlewares<RequestHandler>(BackupController)),
            ...(fetchMiddlewares<RequestHandler>(BackupController.prototype.getCollectionData)),

            async function BackupController_getCollectionData(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBackupController_getCollectionData, request, response });

                const controller = new BackupController();

              await templateService.apiHandler({
                methodName: 'getCollectionData',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBackupController_importCollections: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                body: {"in":"body","name":"body","required":true,"ref":"ImportCollectionsBody"},
        };
        app.post('/api/backup/importCollections',
            ...(fetchMiddlewares<RequestHandler>(BackupController)),
            ...(fetchMiddlewares<RequestHandler>(BackupController.prototype.importCollections)),

            async function BackupController_importCollections(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBackupController_importCollections, request, response });

                const controller = new BackupController();

              await templateService.apiHandler({
                methodName: 'importCollections',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOdsController_odsStatus: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/status',
            ...(fetchMiddlewares<RequestHandler>(OdsController)),
            ...(fetchMiddlewares<RequestHandler>(OdsController.prototype.odsStatus)),

            async function OdsController_odsStatus(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOdsController_odsStatus, request, response });

                const controller = new OdsController();

              await templateService.apiHandler({
                methodName: 'odsStatus',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOdsController_roles: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/roles',
            ...(fetchMiddlewares<RequestHandler>(OdsController)),
            ...(fetchMiddlewares<RequestHandler>(OdsController.prototype.roles)),

            async function OdsController_roles(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOdsController_roles, request, response });

                const controller = new OdsController();

              await templateService.apiHandler({
                methodName: 'roles',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOdsController_runScriptId: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"dataType":"any"},
        };
        app.post('/api/script/run/:id',
            ...(fetchMiddlewares<RequestHandler>(OdsController)),
            ...(fetchMiddlewares<RequestHandler>(OdsController.prototype.runScriptId)),

            async function OdsController_runScriptId(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOdsController_runScriptId, request, response });

                const controller = new OdsController();

              await templateService.apiHandler({
                methodName: 'runScriptId',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOdsController_runScript: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                body: {"in":"body","name":"body","required":true,"dataType":"any"},
                type: {"in":"query","name":"type","dataType":"string"},
        };
        app.post('/api/script/run',
            ...(fetchMiddlewares<RequestHandler>(OdsController)),
            ...(fetchMiddlewares<RequestHandler>(OdsController.prototype.runScript)),

            async function OdsController_runScript(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOdsController_runScript, request, response });

                const controller = new OdsController();

              await templateService.apiHandler({
                methodName: 'runScript',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOdsController_getNotebookvars: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                notebookId: {"in":"path","name":"notebookId","required":true,"dataType":"string"},
        };
        app.get('/api/notebook/getNotebookvars/:notebookId',
            ...(fetchMiddlewares<RequestHandler>(OdsController)),
            ...(fetchMiddlewares<RequestHandler>(OdsController.prototype.getNotebookvars)),

            async function OdsController_getNotebookvars(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOdsController_getNotebookvars, request, response });

                const controller = new OdsController();

              await templateService.apiHandler({
                methodName: 'getNotebookvars',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOdsController_getNotebookVar: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                notebookId: {"in":"path","name":"notebookId","required":true,"dataType":"string"},
                name: {"in":"path","name":"name","required":true,"dataType":"string"},
        };
        app.get('/api/notebook/getNotebookvar/:notebookId/:name',
            ...(fetchMiddlewares<RequestHandler>(OdsController)),
            ...(fetchMiddlewares<RequestHandler>(OdsController.prototype.getNotebookVar)),

            async function OdsController_getNotebookVar(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOdsController_getNotebookVar, request, response });

                const controller = new OdsController();

              await templateService.apiHandler({
                methodName: 'getNotebookVar',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOdsController_processCommand2: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                notebookId: {"in":"path","name":"notebookId","required":true,"dataType":"string"},
        };
        app.get('/api/notebook/getNotebookvarSnapshotNames/:notebookId',
            ...(fetchMiddlewares<RequestHandler>(OdsController)),
            ...(fetchMiddlewares<RequestHandler>(OdsController.prototype.processCommand2)),

            async function OdsController_processCommand2(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOdsController_processCommand2, request, response });

                const controller = new OdsController();

              await templateService.apiHandler({
                methodName: 'processCommand2',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOdsController_restoreNotebookVarsSnapshot: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                notebookId: {"in":"path","name":"notebookId","required":true,"dataType":"string"},
                snapshotName: {"in":"path","name":"snapshotName","required":true,"dataType":"string"},
        };
        app.get('/api/notebook/restoreNotebookVarsSnapshot/:notebookId/:snapshotName',
            ...(fetchMiddlewares<RequestHandler>(OdsController)),
            ...(fetchMiddlewares<RequestHandler>(OdsController.prototype.restoreNotebookVarsSnapshot)),

            async function OdsController_restoreNotebookVarsSnapshot(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOdsController_restoreNotebookVarsSnapshot, request, response });

                const controller = new OdsController();

              await templateService.apiHandler({
                methodName: 'restoreNotebookVarsSnapshot',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOdsController_copyNotebookvars: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                fromNotebookId: {"in":"path","name":"fromNotebookId","required":true,"dataType":"string"},
                toNotebookId: {"in":"path","name":"toNotebookId","required":true,"dataType":"string"},
        };
        app.get('/api/notebook/copyNotebookvars/:fromNotebookId/:toNotebookId',
            ...(fetchMiddlewares<RequestHandler>(OdsController)),
            ...(fetchMiddlewares<RequestHandler>(OdsController.prototype.copyNotebookvars)),

            async function OdsController_copyNotebookvars(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOdsController_copyNotebookvars, request, response });

                const controller = new OdsController();

              await templateService.apiHandler({
                methodName: 'copyNotebookvars',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOdsController_setNotebookvar: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                notebookId: {"in":"path","name":"notebookId","required":true,"dataType":"string"},
                name: {"in":"path","name":"name","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"dataType":"any"},
        };
        app.post('/api/notebook/setNotebookvar/:notebookId/:name',
            ...(fetchMiddlewares<RequestHandler>(OdsController)),
            ...(fetchMiddlewares<RequestHandler>(OdsController.prototype.setNotebookvar)),

            async function OdsController_setNotebookvar(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOdsController_setNotebookvar, request, response });

                const controller = new OdsController();

              await templateService.apiHandler({
                methodName: 'setNotebookvar',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOdsController_saveNotebookVarsSnapshot: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                notebookId: {"in":"path","name":"notebookId","required":true,"dataType":"string"},
                snapshotName: {"in":"path","name":"snapshotName","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"dataType":"any"},
        };
        app.post('/api/notebook/saveNotebookVarsSnapshot/:notebookId/:snapshotName',
            ...(fetchMiddlewares<RequestHandler>(OdsController)),
            ...(fetchMiddlewares<RequestHandler>(OdsController.prototype.saveNotebookVarsSnapshot)),

            async function OdsController_saveNotebookVarsSnapshot(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOdsController_saveNotebookVarsSnapshot, request, response });

                const controller = new OdsController();

              await templateService.apiHandler({
                methodName: 'saveNotebookVarsSnapshot',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOdsController_deleteNotebookVar: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                notebookId: {"in":"path","name":"notebookId","required":true,"dataType":"string"},
                name: {"in":"path","name":"name","required":true,"dataType":"string"},
        };
        app.delete('/api/notebook/deleteNotebookvar/:notebookId/:name',
            ...(fetchMiddlewares<RequestHandler>(OdsController)),
            ...(fetchMiddlewares<RequestHandler>(OdsController.prototype.deleteNotebookVar)),

            async function OdsController_deleteNotebookVar(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOdsController_deleteNotebookVar, request, response });

                const controller = new OdsController();

              await templateService.apiHandler({
                methodName: 'deleteNotebookVar',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOdsController_deleteNotebookVarsSnapshot: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                notebookId: {"in":"path","name":"notebookId","required":true,"dataType":"string"},
                snapshotName: {"in":"path","name":"snapshotName","required":true,"dataType":"string"},
        };
        app.delete('/api/notebook/deleteNotebookVarsSnapshot/:notebookId/:snapshotName',
            ...(fetchMiddlewares<RequestHandler>(OdsController)),
            ...(fetchMiddlewares<RequestHandler>(OdsController.prototype.deleteNotebookVarsSnapshot)),

            async function OdsController_deleteNotebookVarsSnapshot(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOdsController_deleteNotebookVarsSnapshot, request, response });

                const controller = new OdsController();

              await templateService.apiHandler({
                methodName: 'deleteNotebookVarsSnapshot',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
