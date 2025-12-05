/**
 * Copyright (c) 2025 Capital One
*/

import { StateHistory } from "dlms-base";

export const apikeyType = "apikeys";

export interface ApiKeyBase {
    /**
     * The key of the api key
     * @maxLength 500
     * @description API key too long
     */
    key: string;
    
    /**
     * The expiration date of the api key
     * @description API Key expiration date
     */
    expirationDate: number;
    
    /**
     * The id of the api key
     * @maxLength 500 
     * @description API Key id value too long
     */
    id: string;
    
    /**
     * The role of the api token
     * @maxLength 100 
     * @description API Key role too long
     */
    role: string;

    /**
     * The app name of the api token
     * @maxLength 100 
     * @description API Key app too long
     */
    app: string;

}

// Retrieval interfaces

export interface ApiKey extends ApiKeyBase {
    state: string;
    dateCreated: number;
    dateUpdated: number;
}

export interface ApiKeySummary extends ApiKey {
    schemaVersion: string;
    curStateRead?: string[]; // cache of current state read group
    curStateWrite?: string[]; // cache of current state write group
}

export interface ApiKeyInfo extends ApiKeySummary {
    stateHistory: StateHistory[];
}

// Create/update interfaces

export type ApiKeyOptional = Partial<ApiKey>

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ApiKeyCreate extends ApiKeyOptional {
}

export interface ApiKeyUpdate extends ApiKeyOptional {
    state?: string;
}
