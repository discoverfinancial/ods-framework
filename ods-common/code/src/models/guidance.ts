/**
 * Copyright (c) 2025 Capital One
*/

import { AttachmentInfo, CommentCreate, CommentInfo, StateHistory, User } from "dlms-base";

export const guidanceType = "guidance";


// The software that this guidance is for
export interface GuidanceReference {
    /**
     * @maxLength 700 
     * @description Base Package URL too long
     */
    basePurl: string;
    /**
     * sbom name
     * @maxLength 500 
     * @description Package SBOM name too long
     */
    name: string;
     /**
     * @maxLength 100 
     * @description Package SBOM type value too long
     */
    type?: string;
     /**
     * @maxLength 100 
     * @description Group value too long
     */
    group?: string;
    /**
     * sbom version - cached for UI
     * @maxLength 100 
     * @description SBOM version value too long
     */
    version?: string;
    /**
     * @maxLength 700 
     * @description Software Package URL too long
     */
    purl?: string;
    /**
     * sbom id
     * @maxLength 300 
     * @description Guidance ID value too long
     */
    id?: string;
}

interface PreferredVersion {
    /**
     * @maxLength 100 
     * @description Guidance min version too long
     */
    minimum?: string;
    /**
     * @maxLength 100 
     * @description Guidance max version too long
     */
    maximum?: string;
    exclude?: string[];
}

export interface GuidanceVersionOptions {
    preferredVersion: PreferredVersion;
}


// Supporting Documentation: Links, Articles, Blogs on migration)
export interface GuidanceDocumentation {
    /**
     * @maxLength 1024 
     * @description Guidance documentation title too long
     */
    title?: string;
    /**
     * @maxLength 2048 
     * @description Guidance documentation details too long
     */
    details?: string;
    /**
     * @maxLength 2048 
     * @description Guidance documentation url too long
     */
    url?: string;
    // [key: string]: any;
}

// Alternatives for similar functionlity
export interface GuidanceAlternative {
    /**
     * @maxLength 1024 
     * @description Alternative software name too long
     */
    name: string;
    /**
     * @maxLength 2048 
     * @description Alternative software details too long
     */
    details?: string;
    /**
     * @maxLength 2048 
     * @description Alternative software url too long
     */
    url?: string;
    // [key: string]: any;
}

// Source Waivers by Product Team: Required Upgrade for teams with existing waivers
export interface GuidanceWaiver {
    /**
     * @maxLength 300 
     * @description Waiver product team value too long
     */
    productTeam: string;
    // [key: string]: any;
}

export interface GuidanceUpdated {
    date: number;
    user: User;
}

// Document properties

export interface GuidanceBase {
    item: GuidanceReference;   // The software that this guidance is for
    /**
     * Component tier this guidance applies to
     * @maxLength 10 
     * @description Guidance tier value too long
     */
    tier: string;
    /**
     * Guidance for tier 2 (values = "0", "1", "2", ... for N, N-1, N-2, ...
     * @maxLength 2 
     * @description Guidance nMinus value too long
     */
    nMinus: string;

    // Guidance specified by user
    /**
     * @maxLength 1024 
     * @description Guidance title value too long
     */
    title: string;
    /**
     * @maxLength 2048 
     * @description Guidance description too long
     */
    description: string;
    depsdevVersions?: string[];                   // List of versions found on deps.dev for dependency
    pci?: GuidanceVersionOptions;
    nonPci?: GuidanceVersionOptions;
    retireDate?: number;                        // Date at which formal policies will be enforced, and version(s) will be blocked.
    documentation?: GuidanceDocumentation[];    // Supporting Documentation: Links, Articles, Blogs on migration)
    alternatives?: GuidanceAlternative[];       // Alternatives for similar functionlity
    waivers?: GuidanceWaiver[];                 // Source Waivers by Product Team: Required Upgrade for teams with existing waivers
}

/*
    A software item can have one or more guidance objects, since guidance versions change over time.
    The latest one is used to determine compliance.
    The older ones are kept since they may be referenced by attestations.
 */
export interface Guidance extends GuidanceBase {
    id: string;                 // uuid
    state: string;              // created, active, closed, cancelled
    dateCreated: number;
    dateUpdated: number;        // Used as version of guidance
}

export interface GuidanceSummary extends Guidance {
    schemaVersion: string;
    curStateRead?: string[]; // cache of current state read group
    curStateWrite?: string[]; // cache of current state write group
}

export interface GuidanceInfo extends GuidanceSummary {
    updatedBy: GuidanceUpdated[];  // Person who updated the guidance, and when
    stateHistory: StateHistory[];
    comments: CommentInfo[];
    attachments?: AttachmentInfo[];
}

// Create/update interfaces

export type GuidanceBaseOptional = Partial<GuidanceBase>

export interface GuidanceCreate extends GuidanceBaseOptional {
}

export interface GuidanceUpdate extends GuidanceBaseOptional {
    /**
     * @maxLength 20 
     * @description Guidance update state value too long
     */
    state?: string;
    comment?: CommentCreate;
    attachments?: AttachmentInfo[];
}

export interface GuidanceList {
    count: number;
    items: GuidanceSummary[];
}
