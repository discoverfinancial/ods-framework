/**
 * Copyright (c) 2025 Capital One
*/

import { AttachmentInfo, CommentCreate, CommentInfo, StateHistory, User } from "dlms-base";

export const attestationDefinitionType = "attestationDefinition";

// Document properties

export interface AttestationDefinitionBase {

    /**
     * @maxLength 300 
     * @description Attestation definition title too long
     */
    title: string;

    /**
     * @maxLength 8000 
     * @description Attestation definition script too long
     */
    script: string;

    /**
     * @maxLength 1024 
     * @description Attestation definition description too long
     */
    description: string;
}

// Retrieval interfaces

export interface AttestationDefinition extends AttestationDefinitionBase {
    id: string;
    state: string;              // inactive, active, cancelled
    dateCreated: number;
    dateUpdated: number;
    owner: User;
}

export interface AttestationDefinitionSummary extends AttestationDefinition {
    schemaVersion: string;
    curStateRead?: string[]; // cache of current state read group
    curStateWrite?: string[]; // cache of current state write group
}

export interface AttestationDefinitionInfo extends AttestationDefinitionSummary {
    stateHistory: StateHistory[];
    comments: CommentInfo[];
    attachments?: AttachmentInfo[];
}

// Create/update interfaces

export type AttestationDefinitionBaseOptional = Partial<AttestationDefinitionBase>

export interface AttestationDefinitionCreate extends AttestationDefinitionBaseOptional {
    title: string;
    script: string;
}

export interface AttestationDefinitionUpdate extends AttestationDefinitionBaseOptional {
    state?: string;
    comment?: CommentCreate;
    attachments?: AttachmentInfo[];
}

