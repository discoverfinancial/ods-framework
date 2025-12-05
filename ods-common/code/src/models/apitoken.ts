/**
 * Copyright (c) 2025 Capital One
*/

import { AttachmentInfo, CommentInfo, StateHistory } from "dlms-base";

export const apitokenType = "apitokens";

export interface ApiTokenBase {
    /**
     * name of the api token
     * @maxLength 500
     * @description API Token name value too long
     */
    name: string;
    expirationDate: number;
    /**
     * the id of the api token
     * @maxLength 500 
     * @description API Token id value too long
     */
    id: string;
    /**
     * the value of the api token
     * @maxLength 100 
     * @description API Token value too long
     */
    value: string;
    /**
     * @maxLength 20 
     * @description API Token state value too long
     */
}

// Retrieval interfaces

export interface ApiToken extends ApiTokenBase {
    state: string;
    dateCreated: number;
    dateUpdated: number;
}

export interface ApiTokenSummary extends ApiToken {
    schemaVersion: string;
    curStateRead?: string[]; // cache of current state read group
    curStateWrite?: string[]; // cache of current state write group
}

export interface ApiTokenInfo extends ApiTokenSummary {
    stateHistory: StateHistory[];
    comments: CommentInfo[];
    attachments?: AttachmentInfo[];
}

// Create/update interfaces

export type ApiTokenOptional = Partial<ApiToken>

export interface ApiTokenCreate extends ApiTokenOptional {
}

export interface ApiTokenUpdate extends ApiTokenOptional {
    state?: string;
}
