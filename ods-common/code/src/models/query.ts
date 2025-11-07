/**
 * Copyright (c) 2025 Capital One
*/

import { AttachmentInfo, CommentCreate, CommentInfo, StateHistory, User } from "dlms-base";

export const queryType = "query";

// Document properties

export interface QueryBase {
    /**
     * @maxLength 4096
     */
    query: string;
    /**
     * @maxLength 200
     * @description Query name is too long
     */
    name: string;
    /**
     * @maxLength 400
     */
    description: string;
    /**
     * @maxLength 100
     */
    database: string;
    /**
     * @maxLength 400
     */
    projection: string;
    /**
     * @maxLength 200
     * @description Query sort value is too long
     */
    sort: string;
    limit: number;
    public: boolean;
    /**
     * @maxLength 200
     * @description Query tag value is too long
     */
    tag: string;
}

// Retrieval interfaces

export interface QueryRoot extends QueryBase {
    id: string;
    state: string;
    dateCreated: number;
    dateUpdated: number;
    owner: User;
}

export interface QuerySummary extends QueryRoot {
    schemaVersion: string;
    curStateRead?: string[]; // cache of current state read group
    curStateWrite?: string[]; // cache of current state write group
}

export interface QueryInfo extends QuerySummary {
    stateHistory: StateHistory[];
    comments: CommentInfo[];
    attachments?: AttachmentInfo[];
}

// Create/update interfaces

export type QueryBaseOptional = Partial<QueryBase>

export interface QueryCreate extends QueryBaseOptional {
    /**
     * @maxLength 200
     * @description Query name is too long
     */
    name: string;
}

export interface QueryUpdate extends QueryBaseOptional {
    /**
     * @maxLength 20
     */
    state?: string;
    comment?: CommentCreate;
    attachments?: AttachmentInfo[];
}
