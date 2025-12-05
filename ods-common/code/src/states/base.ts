/**
 * Copyright (c) 2025 Capital One
*/

import { DocState } from "dlms-base";
export * from "dlms-base";

export interface OdsDocStates {
    [name: string]: OdsDocState
}
export interface OdsDocState extends DocState {
    alwaysEnableNextState?: string[];
    showNextStateOnTab?: any;
}

export const Role = {
    Administrator: "Admin",
    Editor: "Editor",
    Employee: "Employee",
}
