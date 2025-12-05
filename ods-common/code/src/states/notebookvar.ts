/**
 * Copyright (c) 2025 Capital One
*/

import { OdsDocStates, Roles } from "./base";

// Roles for Depsdev documents
export const notebookvarRoles: Roles = {
    Administrator: {
        name: "Admin",
        getMembers: "Admin",
    },
    Employee: {
        name: "Employee",
        getMembers: "Employee",
    },
}

export const NotebookvarAdministrator = notebookvarRoles.Administrator.name;
export const NotebookvarEmployee = notebookvarRoles.Employee.name;

export const notebookvarStates: OdsDocStates = {
    created: {
        label: "Created",
        description: "Created",
        entry: [NotebookvarEmployee],
        read: [NotebookvarEmployee],
        write: [NotebookvarEmployee],
        nextStates: {},
    }
}
