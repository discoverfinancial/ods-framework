/**
 * Copyright (c) 2025 Capital One
*/

import { AttachmentInfo, CommentCreate, CommentInfo, StateHistory, User } from "dlms-base";

export const scriptType = "script";

// Document properties

export interface ScriptBase {
    /**
     * @maxLength 20
     * @description Script type value is too long
     */
    type: string;   // "user" | "admin"

    /**
     * @maxLength 1000000
     */
    script: string;

    /**
     * @maxLength 4000
     */
    parameters: string;

    /**
     * @maxLength 200
     * @description Script name is too long
     */
    name: string;

    /**
     * @maxLength 400
     */
    description: string;

    public: boolean;

    /**
     * @maxLength 200
     * @description Script tag value is too long
     */
    tag: string;


    /**
     * @maxLength 10
     * @description Cron job value is too long
     */
    cronJob: string; // "0" - "3"

    /**
     * @maxLength 10
     * @description Cron run at value is too long
     */
    cronRunAt: string; // "start" | "end";

    /**
     * @maxLength 20
     * @description Script view value is too long
     */
    view: string; // raw | json | sbom | ...
}

// Retrieval interfaces

export interface ScriptRoot extends ScriptBase {
    id: string;
    state: string;
    dateCreated: number;
    dateUpdated: number;
    owner: User;
}

export interface ScriptSummary extends ScriptRoot {
    schemaVersion: string;
    curStateRead?: string[]; // cache of current state read group
    curStateWrite?: string[]; // cache of current state write group
}

export interface ScriptInfo extends ScriptSummary {
    stateHistory: StateHistory[];
    comments: CommentInfo[];
    attachments?: AttachmentInfo[];
}

// Create/update interfaces

export type ScriptBaseOptional = Partial<ScriptBase>

export interface ScriptCreate extends ScriptBaseOptional {
    /**
     * @maxLength 20
     * @description Script type value is too long
     */
    type: string;

    /**
     * @maxLength 200
     * @description Script name is too long
     */
    name: string;
}

export interface ScriptUpdate extends ScriptBaseOptional {
    /**
     * @maxLength 20
     */
    state?: string;
    comment?: CommentCreate;
    attachments?: AttachmentInfo[];
}
