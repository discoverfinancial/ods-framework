# ODS Data Model and Clients

The data in the ODS is stored in a MongoDB database as JSON objects with collections for each type of data client.  By saving a record as a JSON object, queries across any document or subdocument property can be made, with results returned as arrays of JSON documents.  

Documents saved in MongoDB don't need a schema, which is convenient since data from SORs are significantly different from each other and can even differ based on the query.  This flexibility also enables the base CycloneDX SBOM data model to be easily extended by adding additional properties that cache information from SORs to speed up queries that would otherwise need a database lookup (MongoDB equivalent of a JOIN).

Data clients are used to access systems of record (SOR), retrieve data, and aggregate it with data from other SORs into the SBOM CycloneDX data model.  

## Data Model

As mentioned above, the CycloneDX SBOM data model is extended by ODS to include cached information from the various SORs to augment the SBOM collection.  This has two benefits:

1. Significantly improves query performance
2. Keeps frequently correlated data together

The data models are used by both **ods-framework** and the application that includes **ods-framework**, so they are in their own **ods-common** module.  In ods-common is a **models** directory that contains all of the data models for the MongoDB collections used by ods-framework.  The **states** directory contains the state definition objects for each of the models.

The **sbom.ts** file defines and exports the interfaces for the SBOM data model.  The **SbomDocumentBase** interface extends **Bom**, which is the CycloneDX interface generated from [bom-1.6.schema.json](https://github.com/CycloneDX/sbom-utility/blob/main/resources/schema/cyclonedx/1.6/bom-1.6.schema.json) using tool [json-schema-to-typescript](https://github.com/bcherny/json-schema-to-typescript).  

Note that **SbomDocumentBase** can include any JSON object as a property.  This allows the data model to be extended to include any SOR data that might be needed for performance or correlation purposes mentioned above.

```
export interface SbomDocumentBase extends Bom {
    [key:string]: any; // Allow other properties as well
}
```

The remaining interfaces include metadata used by the Document Lifecycle Management System (DLMS) Framework.  DLMS is used by ODS Framework to manage documents and their lifecycle in MongoDB.  (See [dlms-server](https://github.com/discoverfinancial/dlms-server) for reference). 

```
// Retrieval interfaces

export interface SbomDocument extends SbomDocumentBase {
    id: string;
    state: string;
    dateCreated: number;
    dateUpdated: number;
    _vulnerabilities?: number;
    _compositions?: number;
}

export interface SbomDocumentSummary extends SbomDocument {
    comment?: CommentCreate;
    curStateRead?: string[]; // cache of current state read group
    curStateWrite?: string[]; // cache of current state write group
}

export interface SbomDocumentInfo extends SbomDocumentSummary {
    stateHistory: StateHistory[];
    comments: CommentInfo[];
    attachments?: AttachmentInfo[];
}

// Create/update interfaces

export type SbomDocumentBaseOptional = Partial<SbomDocumentBase>

export interface SbomDocumentCreate extends SbomDocumentBaseOptional {
}

export interface SbomDocumentUpdate extends SbomDocumentBaseOptional {
    state?: string;
    comment?: CommentCreate;
    attachments?: AttachmentInfo[];
    "$set"?: any;
}

export interface SbomDocumentList {
    count: number;
    items: SbomDocumentSummary[];
}
```

The projection constants define the default MongoDB query projections to use when retrieving summary lists.  The SBOM components array can be quite large, so it is separated to reduce data size for queries that don't need it.  The ODS Framework allows these default projections to be overridden.  (See [Using ODS Framework](./Using_ODS_Framework.md)).

```
export const summaryProjectionList = {
    id: 1,
    dateCreated: 1,
    dateUpdated: 1,
    state: 1,
    curStateRead: 1,
    curStateWrite: 1,
    metadata: 1,
    _vulnerabilities: 1,
    compositions: 1,
    _compositions: 1,
}

export const summaryProjection = {
    ...summaryProjectionList,
    components: 1,
}
```


## Data Clients

There are three types of ETL data clients that are supported by the ODS Framework.

1. CacheDataClient
2. UpdateDataClient
3. Processor

Below are the interfaces for each of these data clients from **DataClientInterfaces.ts**.

```
/**
 * Interface for a client that supports refreshing cached data.
 */
export interface CacheDataClient {
    /**
     * Refreshes the cache for the data client.
     * 
     * @param ctx The user context.
     * @param doRefresh Whether to force a full refresh.
     * @param processItems Optional list of items to process.
     * @returns A promise resolving to the refresh result.
     */
    refreshCache(ctx: UserContext, doRefresh: boolean, processItems?: string[]): Promise<any>;
}

/**
 * Interface for a client that supports updating data.
 */
export interface UpdateDataClient {
    /**
     * Updates the data for the client.
     * 
     * @param ctx The user context.
     * @param doRefresh Whether to force a full refresh.
     * @param processItems Optional list of items to process.
     * @returns A promise resolving to the update result.
     */
    updateData(ctx: UserContext, doRefresh: boolean, processItems?: string[]): Promise<any>;
}

/**
 * Type for a client that supports both caching and updating data.
 */
export type CacheUpdateDataClient = CacheDataClient & UpdateDataClient;

/**
 * Interface for a processor that can process data.
 */
export interface Processor {
    /**
     * Processes data for the client.
     * 
     * @param ctx The user context.
     * @param doRefresh Whether to force a full refresh.
     * @param processItems Optional list of items to process.
     * @returns A promise resolving to the process result.
     */
    process(ctx: UserContext, doRefresh: boolean, processItems?: string[]): Promise<any>;
}
```

A **CachedDataClient** retrieves data from a system of record (SOR) and saves it in the ODS.  The cached data can be a partial record, the entire record, or a combination of records.  The saved record should include a dateUpdated field.  If the SOR has a date updated field, then it can be used to update the cached record only if it's newer.  This will dramatically improve performance and efficiently of the caching process.

An **UpdateDataClient** is used to update the data stored in the SBOM from the system of record.  If the SOR data is cached, then this cached data can be used to update the SBOM (**CachedUpdateDataClient**), otherwise the SOR will need to be queried for the specific SBOM being updated to retrieve the appropriate data.

A **Processor** can be used to process data in an SBOM or other ODS data collection.  The attestations are created and managed by the AttestationProcessor, which examine SBOMs and guidance to manage attestations.

Any data client can be periodically run by adding the **refreshCache**, **updateData**, or **process** methods to a cron task.

## Cron Tasks

The ODS Framework includes four cron tasks that run every 8 hours, with staggerd starts every 2 hours.  So 

* cronJob1 runs at 0, 8, 16 hours
* cronJob2 runs at 2, 10, 18 hours 
* cronJob3 runs at 4, 12, 20 hours 
* cronJob4 run at 6, 14, 22 hours

The application that extends ods-framework can configure tasks to run during these cron tasks.

The interval that the cron tasks run can be configured by environment variables.  To run cron tasks, they must be enabled.

```
const CRON_ENABLED = process.env["CRON_ENABLED"];

// every 8 hrs starting at midnight (0, 8, 16)
const CRON_JOB_0 = process.env["CRON_JOB_0"] || "0 0/8 * * *"

// every 8 hrs starting at 2am (gives refresh 2 hr to finish) (2, 10, 18)
const CRON_JOB_1 = process.env["CRON_JOB_1"] || "0 2/8 * * *"

// every 8 hrs starting at 4am (gives refresh 2 hr to finish) (4, 12, 20)
const CRON_JOB_2 = process.env["CRON_JOB_2"] || "0 4/8 * * *"

// every 8 hrs starting at 6am (gives refresh 2 hr to finish) (8, 14, 22)
const CRON_JOB_3 = process.env["CRON_JOB_3"] || "0 6/8 * * *"
```
