/**
 * Copyright (c) 2025 Capital One
*/

import { AttachmentInfo, CommentCreate, CommentInfo, StateHistory, User } from "dlms-base";

// Collection to persist any information
// If key = query
//      value = { database:string, query:string, name:string, description:string, projection:string}
// If key = etl-log
//      value = string

export const storeType = "store";
export const logType = "logs";

// Document properties

export interface StoreBase {
    key: string;
    value: any;
    public: boolean;
}

// Retrieval interfaces

export interface Store extends StoreBase {
    id: string;
    owner: User;
    state: string;              // created, closed
    dateCreated: number;
    dateUpdated: number;
}

export interface StoreSummary extends Store {
    schemaVersion: string;
    curStateRead?: string[]; // cache of current state read group
    curStateWrite?: string[]; // cache of current state write group
}

export interface StoreInfo extends StoreSummary {
    stateHistory: StateHistory[];
    comments: CommentInfo[];
    attachments?: AttachmentInfo[];
}

// Create/update interfaces

export type StoreBaseOptional = Partial<StoreBase>

export interface StoreCreate extends StoreBaseOptional {
}

export interface StoreUpdate extends StoreBaseOptional {
    state?: string;
    comment?: CommentCreate;
    attachments?: AttachmentInfo[];
}
