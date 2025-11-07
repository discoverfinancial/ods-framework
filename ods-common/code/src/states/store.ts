/**
 * Copyright (c) 2025 Capital One
*/

import { OdsDocStates, Roles, StateCallbackContext } from "./base";

// Roles for Store documents
export const storeRoles: Roles = {
    Owner: {
        name: "Owner",
        getMembers: async function(ctx: StateCallbackContext) {
            const members = [];
            if (ctx.document.owner) {
                members.push(ctx.document.owner);
            }
            console.log(`Store group members =`,members)
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

export const StoreOwner = storeRoles.Owner.name;
export const StoreAdministrator = storeRoles.Administrator.name;
export const StoreEmployee = storeRoles.Employee.name;

export const storeStates: OdsDocStates = {
    created: {
        label: "Created",
        description: "Created",
        entry: [StoreEmployee],
        read: async function (ctx) {
            // If public, anyone can read
            if (ctx.document.public) {
                console.log("Store doc is public, so anyone can read")
                return { groups: [StoreEmployee] };
            }
            // If private, only owner can read
            console.log("Store doc is private, only owner can read")
            return { groups: [StoreOwner, StoreAdministrator] }
        },
        write: [StoreAdministrator, StoreOwner],
        nextStates: {},
    }
}
