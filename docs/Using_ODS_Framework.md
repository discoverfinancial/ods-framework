# Using ODS Framework

The ODS Framework is an npm module that can be included in your application to implement an ODS Server.  It is configured using environment variables, and can be integrated within your application as described in below.  

## Installing

To install the ods-framework package and its dependencies, run:

```
npm -i ods-framework
```


## Setup the Runtime Environment

The ODS Framework can be configured using environment variables.  

### DLMS Environment Variables
The framework extends the [DLMS framework](https://github.com/discoverfinancial/dlms-server), which has the following environment variables.

| Environment Variable  | Description | Default Value |
| ------------- | ------------- | ------------- |
| IDS_ADMIN  | Comma separated list of userids that will be given the admin role  | |
| EMAIL_ENABLED | Specifies whether server should try to send emails in response to actions on documents or for other reasons |  |
| ADMIN | Basic auth credential for admin if admin id is specified as "admin".  String, in emailAddress:password format. |  |
| DLMS_ADMIN_${uid} | Basic auth credential for admin if admin is specified as ${uid}.  String, in emailAddress:password format. |  |
| API_TOKEN | Specifies a token that will ensure access when used to execute APIs.  Value should certainly be secured. |  |
| HTTP_PROXY / http_proxy | URL of http proxy |  |
| HTTPS_PROXY / https_proxy | URL of https proxy |  |
| USE_PROXY / use_proxy | Comma separated list of domains that require being sent through proxy (e.g. "<external_domain1>, <external_domain2>") |  |
| NO_PROXY / no_proxy | Comma separated list of domains that don't require proxy (e.g. "localhost, 127.0.0.1, <your_enterprise_domain>") |  |
| PORT | The port on which DLMS server will listen | "3000" |
| BASE_URL | The root URL of the running DLMS server | "http://localhost:" + this.port |
| DEBUG | Currently unused | true |
| CORS_ORIGIN | Provides value that will be used for Access-Control-Allow-Origin header in responses from DLMS server | "*" |
| OAUTH_ENABLED | Turns on or off the OAuth middleware usage on the DLMS server | false |
| OAUTH_CLIENT_ID | Public identifier for the OAuth client app |  |
| OAUTH_CLIENT_SECRET | Secret provided to OAuth client app upon registration.  Used to make communications with authorization server more secure |  |
| OAUTH_ISSUER_URL | Domain of the authentication provider |  |
| OAUTH_AUTHORIZATION_URL | The Authorization Server's URL to which authorization requests will be sent | "${OAUTH_ISSUER_URL}/v1/authorize" |
| OAUTH_TOKEN_URL | The Authorization Server's URL to which requests will be make for access tokens  | "${OAUTH_ISSUER_URL}/v1/token" |
| BASIC_AUTH_ENABLED | Turns on or off the basic auth middleware usage on the DLMS server | false |
| SESSION_SECRET | The secret used to sign session data in order to create a JWT | crypto.randomBytes(48).toString("hex") |
| EMAIL_SERVER | URL of SMTP server to use when DLMS needs to send email |  |
| LOG_HTTP_RESPONSE_BODY | if defined, will enable code to log the response body sent in reply to each request made | undefined |
| PASSPORT_DEBUG | if defined, will log information around OIDC authentication | undefined |

### ODS Framework Environment Variables
The ODS Framework variables include the following.

| Environment Variable  | Description | Default Value |
| ------------- | ------------- | ------------- |
| CRON_ENABLED | Enable cron jobs to be run for ETL processes | false |
| CRON_JOB_0 | Schedule for cron job 0 | "0 0/8 * * *" |
| CRON_JOB_1 | Schedule for cron job 1 | "0 2/8 * * *" |
| CRON_JOB_2 | Schedule for cron job 2 | "0 4/8 * * *" |
| CRON_JOB_3 | Schedule for cron job 3 | "0 7/8 * * *" |
| DRAIN_TIMEOUT | Timeout to wait for client to read data when streaming results (ms) | 60000 |
| EMAIL_DEBUG | Comma separated list of email addresses to send emails to for debugging | |
| ADMIN_EMAIL | The administrator email address that sent emails use | |
| enableUtf8Validation | Set the enableUtf8Validation option for MongoDB queries | true |
| DB_APP | The database collection prefix for the ODS Server | ods |
| ETL_ENABLED | Enable ETL for the ODS Server | false |
| USE_NOTEBOOKVARS_IN_FILE | ODS Server stores notebook variables in database or in file system | false |
| DATA_DIR | The directory to use if storing notebook variables in the file system | data |
| GLOBAL_AGENT_HTTP_PROXY | Some network requests don't honor HTTP_PROXY environment variable, so set this to the same value | |
| GLOBAL_AGENT_HTTPS_PROXY | Some network requests don't honor HTTPS_PROXY environment variable, so set this to the same value |
| GLOBAL_AGENT_NO_PROXY | Some network requests don't honor NO_PROXY environment variable, so set this to the same value |


## Extending ODS Framework
The ODS Framework includes an Express Node.JS server with endpoints or routes defined using tsoa.  The implementing ODS Server should extend the **Ods** class and add additional data models, and create ETL processors to run during one of the cron jobs.

```
import { Ods } from "ods-framework";

export class AppMgr extends Ods {

    /**
     * Initialize the AppMgr instance.
     * @param simpleInit Optional flag for simple initialization.
     * @returns {Promise<AppMgr>} The initialized AppMgr instance.
     */
    public static async init(simpleInit?: boolean): Promise<AppMgr> {
        log.debug(`Initializing app manager`);
        const pm = new AppMgr();
        if (etlEnabled) {
            log.debug(`ETL Enabled`)
            pm.etl = ETL.getInstance(pm);
        }
        else {
            log.debug(`ETL Disabled`)
        }
        Ods.setInstance(pm);
        await pm.init(simpleInit);
        log.debug(`Finished initializing app manager`);
        return pm;
    }

    /**
     * Get the singleton instance of AppMgr.
     * @returns {AppMgr} The AppMgr instance.
     */
    public static getInstance(): AppMgr {
        return Ods.getInstance() as AppMgr;
    }

    constructor() {
        userProfileService = new DfsUserProfileService();
        super({
            appName: dbApp,
            documents: appDocuments,
            adminGroups: [GROUP_ADMIN],
            email: adminEmail,
            userGroups: [
                { id: GROUP_ADMIN, deletable: false },
                { id: GROUP_EDITOR, deletable: false },
                { id: GROUP_TESTER, deletable: false },
            ],
            adminRole: GROUP_ADMIN,
            roles: [],
            userProfileService: userProfileService,
            sandboxFunctions: path.join(__dirname, "adminSandboxFunctions.js"),
            etlConfig: {

                cronJob0Start: async function(ctx: UserContext, etl: ETL, cronJob: string, runAt: string) {
                },
                cronJob0End: async function(ctx: UserContext, etl: ETL, cronJob: string, runAt: string) {
                },

                cronJob1Start: async function(ctx: UserContext, etl: ETL, cronJob: string, runAt: string) {
                },
                cronJob1End: async function(ctx: UserContext, etl: ETL, cronJob: string, runAt: string) {
                },

                cronJob2Start: async function(ctx: UserContext, etl: ETL, cronJob: string, runAt: string) {
                },
                cronJob2End: async function(ctx: UserContext, etl: ETL, cronJob: string, runAt: string) {
                },

                cronJob3Start: async function(ctx: UserContext, etl: ETL, cronJob: string, runAt: string) {
                },
                cronJob3End: async function(ctx: UserContext, etl: ETL, cronJob: string, runAt: string) {
                },

            },
        });
    }

    /**
     * Called when initialization is completed.
     * Performs migration and cleanup tasks.
     */
    public async onInit() {
        ...
    }
}
```

The ODS Server application should also include an app.ts that creates the **AppMgr** above, defines any additional routes for APIs and begins listening on a port.

```
import { Server, Config, Logger } from "dlms-server";
import { RegisterRoutes } from "./routes";
import { RegisterRoutes as RegisterOdsRoutes } from "ods-framework";
import { AppMgr } from "./appMgr";
import { Role } from "ods-framework";

async function addCustomRoutes(app: express.Application) {
    ...
    RegisterRoutes(app);
    RegisterOdsRoutes(app);
    ...
}

export const defaultUser =
    {
        id: "employee",
        name: "Employee",
        roles: [Role.Employee],
        department: "Product Development",
        email: "reviewer@test.com",
        title: "Employee",
        employeeNumber: "9876",
    }

async function main() {
    appMgr = await AppMgr.init();
    await Server.run(appMgr, {addCustomRoutes, disabledAuthUser: defaultUser}); 
}

main();

```

## API

The ODS Server includes the DLMS server APIs that are detailed at [here](https://github.com/discoverfinancial/dlms-server?tab=readme-ov-file#server-api).

DLMS is a document management system that enables JSON documents to be created, retrieved, updated and deleted based upon a document type.  So, the DLMS APIs are used to manage all data models defined in ods-common.

The relevant DLMS APIs are

- PUT /api/docs/:type - Create a document in the given collection
- GET /api/docs/:type - Retrieve documents of the given type that satisfy the given match
- POST /api/docs/:type - Retrieve documents of the given type that satisfy the given query in the body
- GET /api/docs/:type/:id - Retrieve the given document of the given type
- PATCH /api/docs/:type/:id - Update a document of the given type with the given unique id
- DELETE /api/docs/:type/:id - Delete the given document of the given type.

Thus, to manage **sbom** documents as defined by **sbomType** in models/sbom.ts, the **type** would be "sbom".  Calling the endpoint

```
PUT <server:port>/api/docs/sbom
```
would create a new **sbom** document with the contents of the request body.

In addition to these model endpoints, the ODS Framework includes those in **controllers/odsController.ts**

### Log APIs
ODS logs events using the ods.writeLog() method.  These logs are saved in a **logType** collection.  These two APIs are provided as a helper in deleting those logs.

#### GET /api/service/deleteLog/{id}
Delete a specific log
- id: The log id

#### GET /api/service/deleteLogs/{date}
Delete all logs older than the specific date
- date: The date as a timestamp string

### Import APIs
Data from one ODS Server can be copied or imported into another using the following APIs

#### GET /api/backup/getCollectionNames
Get all collection names

#### POST /api/backup/getRemoteCollectionNames
Get all collection names from another ODS Server
- body: JSON object
    - odsUrl: The url for the remote ODS server
    - user: The user id
    - pass: The user password

#### GET /api/backup/getCollectionData?names=<names>&encoding=<encoding>
Get collection data for the names
- names: JSON string array of collection names to retrieve
- encoding?: [Optional] string.  The default is "base64".

#### POST /api/backup/importCollections
Import collection data from another ODS Server
- body: ImportCollectionsBody

### Status API
The status of the ODS Server is set by ETL processes using ods.setStatus().  This status can be retieved by a UI to show the current ETL operation being performed.

#### GET /api/status
Get the status of the ODS Server set by ETL processes.  

### Roles API

#### GET /api/roles
Get the roles for the current user.

### Script API
JavaScript code can be run in a NodeJS sandbox environment.

#### POST /api/script/run/{id}
Run the script with id
- id: The id of the script to run
- body: JSON object for any parameters for the script

#### POST /api/script/run
Run the script passed in
- body: JSON object
    - script: The Javascript code to run
    - parameters: The parameters for the script
    - stream: "compress" to return compressed formatted data

### Notebook API
The notebook APIs manage notebooks and notebook variables.

#### GET /api/notebook/getNotebookvars/{notebookId}
Get all notebook variables for the notebookId
- notebookId: The notebook id

#### GET /api/notebook/getNotebookvar/{notebookId}/{name}
Get the notebook variable
- notebookId: The notebook id
- name: The variable name

#### GET /api/notebook/getNotebookvarSnapshotNames/{notebookId}
Get the notebook variable snapshot names for the notebook
- notebookId: The notebook id

#### GET /api/notebook/restoreNotebookVarsSnapshot/{notebookId}/{snapshotName}
Restore the notebook variables to those values saved in snapshot
- notebookId: The notebook id
- snapshotName: The snapshot name

#### GET /api/notebook/copyNotebookvars/{fromNotebookId}/{toNotebookId}
Copy all notebook variables from one notebook to another
- fromNotebookId: The source notebook id
- toNotebookId: The destination notebook id

#### POST /api/notebook/setNotebookvar/{notebookId}/{name}
Set a notebook variable
- notebookId: The notebook id
- name: The variable name
- body: The value of the variable.  Can be a primative type or a JSON object

#### POST /api/notebook/saveNotebookVarsSnapshot/{notebookId}/{snapshotName}
Save a snapshot of the current notebook variables
- notebookId: The notebook id
- snapshotName: The snapshot name
- body: JSON object 
    - description: The description of the snapshot

#### DELETE /api/notebook/deleteNotebookvar/{notebookId}/{name}
Delete the notebook variable
- notebookId: The notebook id
- name: The variable name

#### DELETE /api/notebook/deleteNotebookVarsSnapshot/{notebookId}/{snapshotName}
Delete the notebook snapshot
- notebookId: The notebook id
- snapshotName: The snapshot name

