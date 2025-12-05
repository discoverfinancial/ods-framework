/**
 * Copyright (c) 2025 Capital One
*/


export const notebookvarType = "notebookvar";

// Document properties

export interface NotebookvarBase {
    notebook: string;       // The notebook id
    name: string;           // The variable name
    type?: string;          // The variable type (array, "")
    value: any;             // The variable value
    snapshot?: string;      // The snapshot name
    snapshotDescription?: string; // The snapshot description
}

// Retrieval interfaces

export interface NotebookvarRoot extends NotebookvarBase {
    id: string;
    state: string;
    dateCreated: number;
    dateUpdated: number;
}

export interface NotebookvarSummary extends NotebookvarRoot {
    schemaVersion: string;
    curStateRead?: string[]; // cache of current state read group
    curStateWrite?: string[]; // cache of current state write group
}

export interface NotebookvarInfo extends NotebookvarSummary {
}

// Create/update interfaces

export type NotebookvarBaseOptional = Partial<NotebookvarBase>

export interface NotebookvarCreate extends NotebookvarBase {
}

export interface NotebookvarUpdate extends NotebookvarBaseOptional {
    state?: string;
}
