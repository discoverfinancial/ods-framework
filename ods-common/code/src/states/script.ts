/**
 * Copyright (c) 2025 Capital One
*/

import { OdsDocStates, Roles, StateCallbackContext } from "./base";

// Roles for Script documents
export const scriptRoles: Roles = {
    Owner: {
        name: "Owner",
        getMembers: async function(ctx: StateCallbackContext) {
            const members = [];
            if (ctx.document.owner) {
                members.push(ctx.document.owner);
            }
            console.log(`Script owner members =`,members)
            return members;
        },
    },
    Administrator: {
        name: "Admin",
        getMembers: "Admin",
    },
    Employee: {
        name: "Employee",
        getMembers: "Employee",
    },
}

export const ScriptOwner = scriptRoles.Owner.name;
export const ScriptAdministrator = scriptRoles.Administrator.name;
export const ScriptEmployee = scriptRoles.Employee.name;

export const scriptStates: OdsDocStates = {
    created: {
        label: "Created",
        description: "Created",
        entry: [ScriptEmployee],
        read: async function (ctx) {
            // If public, anyone can read
            if (ctx.document.public) {
                console.log("Script doc is public, so anyone can read")
                return { groups: [ScriptEmployee] };
            }
            // If private, only owner can read
            console.log("Script doc is private, only owner can read")
            return { groups: [ScriptOwner, ScriptAdministrator] }
        },
        write: [ScriptAdministrator, ScriptOwner],
        nextStates: {},
    }
}
