/**
 * Copyright (c) 2025 Capital One
*/

import { OdsDocStates, Roles, StateCallbackContext } from "./base";

// Roles for Query documents
export const queryRoles: Roles = {
    Owner: {
        name: "Owner",
        getMembers: async function(ctx: StateCallbackContext) {
            const members = [];
            if (ctx.document.owner) {
                members.push(ctx.document.owner);
            }
            console.log(`Query owner members =`,members)
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

export const QueryOwner = queryRoles.Owner.name;
export const QueryAdministrator = queryRoles.Administrator.name;
export const QueryEmployee = queryRoles.Employee.name;

export const queryStates: OdsDocStates = {
    created: {
        label: "Created",
        description: "Created",
        entry: [QueryEmployee],
        read: async function (ctx) {
            // If public, anyone can read
            if (ctx.document.public) {
                console.log("Query doc is public, so anyone can read")
                return { groups: [QueryEmployee] };
            }
            // If private, only owner can read
            console.log("Query doc is private, only owner can read")
            return { groups: [QueryOwner, QueryAdministrator] }
        },
        write: [QueryAdministrator, QueryOwner],
        nextStates: {},
    }
}
