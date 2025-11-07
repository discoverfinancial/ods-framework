/**
 * Copyright (c) 2025 Capital One
*/

import { AttachmentInfo, CommentCreate, CommentInfo, StateHistory, User } from "dlms-base";

export const attestationType = "attestation";

export interface AttestationInfo extends AttestationSummary {
    stateHistory: StateHistory[];
    comments: CommentInfo[];
    attachments?: AttachmentInfo[];
}

export interface AttestationSummary extends OdsAttestation {
    schemaVersion: string;
    curStateRead?: string[]; // cache of current state read group
    curStateWrite?: string[]; // cache of current state write group
}

export interface AttestationCreate extends OdsAttestationRoot {
    /**
     * title of attestation
     * @maxLength 300 
     * @description Attestation title too long
     */
    title: string;
}

export interface AttestationUpdate extends OdsAttestationRoot {
    /**
     * @maxLength 300 
     * @description Attestation title too long
     */
    title?: string;
    /**
     * @maxLength 20 
     * @description Attestation state value too long
     */
    state?: string;
    comment?: CommentCreate;
    attachments?: AttachmentInfo[];
}

export interface OdsAttestation extends OdsAttestationRoot {
    id: string;
    title: string;
    state: string;              // created, active=incomplete, pending=inprogress, overdue, complete, rejected, deferred, cancelled
    dateCreated: number;
    dateUpdated: number;
    item: AttestationRef;       // sbom id that this attestation is attached to
}

export interface OdsAttestationRoot {
    item?: AttestationRef;      // sbom id that this attestation is attached to
    targets?: AttestationTargetRef[]; // sbom ids
    /**
     * Summary of the attestation
     * @maxLength 1024 
     * @description Attestation summary too long
     */
    summary?: string;
    /**
     * The guidance base purl that this attestation answers
     * @maxLength 200 
     * @description Attestation guidance value too long
     */
    guidance?: string;
    evidence?: {                // Questions that reviewer answers
        [key: string]: OdsEvidence;
    }
    /**
     * Flow type = "updateVersion", "questions" (default), "script"
     * If script, then methods are setState(newState), showQuestion(key), getAttestation(), sendEmail(),
     *     getItemSbom(), getTargetSboms(), getGuidance()
     * @maxLength 4096 
     * @description Attestation Flow script too long
     */
    flow?: string;
    attestors?: Attestor[];     // The list of users that have edit permission for attestation
    managementChain?: Management[];
    subscriptions?: Subscriber[];
    emailText?: {               // Use this email text instead of default
        [key: string]: Email;   //      key=attestation state
    };
    dateStart?: number;         // Date the attestation becomes valid (don't sent notifications until this date)
    dateDueReminder?: AttestationReminder[];  // Number of days before due date to send reminders
    overdueReminder?: AttestationReminder[];  // Number of days after due date to send reminders
    attestationDefinitionId?: string;         // Id of the attestation definition that generated this attestation
}

export interface Email {
    groups: string[];           // Attestor, Admin, ProductTeam, or some management chain title (ie Director, VP, etc), or email address
    /**
     * Subject for single body or header for partial body
     * @maxLength 500 
     * @description Attestation email subject too long
     */
    subject: string;            // Subject for single body or header for partial body
    /**
     * Email body to send individually
     * @maxLength 10240 
     * @description Attestation email message too long
     */
    message?: string;           // Email body to send individually
    /**
     * Email body to send individually
     * @maxLength 2000 
     * @description Attestation partial message too long
     */
    partialMessage?: string;    // Partial body that is combined into single email
}

export interface AttestationReminder {
    days: number;               // Number of days before or after dateDue
    dateSent?: number;          // Date that the reminder was sent
    emailText?: Email;          // Optional email text instead of default
}

export interface AttestationRef {
    /**
     * sbom id
     * @maxLength 300 
     * @description Attestation SBOM id value too long
     */
    id: string;
    /**
     * sbom name - cached for UI
     * @maxLength 500 
     * @description Attestation SBOM name value too long
     */
    name: string;
    /**
     * sbom version - cached for UI
     * @maxLength 100 
     * @description Attestation version value too long
     */
    version?: string;
    /**
     * sbom purl - cached for UI
     * @maxLength 200 
     * @description Attestation purl value too long
     */
    purl: string;
}

export interface AttestationTargetRef extends AttestationRef {
    /**
     * @maxLength 100 
     * @description Guidance target reference value too long
     */
    preferredVersion?: string;   // guidance version
}

export interface OdsEvidence {
    /**
     * question to attest Attestation question value too long
     * @maxLength 1024
     */
    question: string;
    /**
     * type of question: text(default), yn, confirm, date, select
     * @maxLength 100 
     * @description Attestation question type value too long
     */
    type?: string;
    /**
     * the answer to the question
     * @maxLength 4096 
     * @description Attestation question answer value too long
     */
    answer?: string;
    reviewer?: User;            // person who answered question
    date?: number;              // timestamp when question was answered
}

export interface Attestor {
    role: string;
    user: AttestorUser;
    group?: AttestorGroup;
}
export interface AttestorGroup {
    id: string;
    name?: string | null;
    businessUnit?: string | null;
    agileTeamType?: string | null;
    teamType?: string | null;
}

export interface AttestorUser {
    email: string;
    lastName?: string | null;
    firstName?: string | null;
    userName?: string | null;
    displayName?: string | null;
}

export interface Management {
    email: string;
    uid: string | null;
    title: string | null;
    name: string;
    level: string | null;
}

export interface Subscriber {
    role: string;
    user: {
        email: string;
        lastName?: string | null;
        firstName?: string | null;
        userName?: string | null;
        displayName?: string | null;
    }
}
