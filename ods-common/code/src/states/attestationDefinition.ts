/**
 * Copyright (c) 2025 Capital One
*/

import { OdsDocStates, Roles, StateCallbackContext } from "./base";

// Roles for AttestationDefinition documents
export const attestationDefinitionRoles: Roles = {
    Tester: {
        name: "Tester",
        getMembers: "Tester",
    },
    Editor: {
        name: "Editor",
        getMembers: "Editor",
    },
    Owner: {
        name: "Owner",
        getMembers: async function(ctx: StateCallbackContext) {
            const members = [ctx.document.owner];
            console.log(`Owner group members =`,members)
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

const AttestationDefinitionAdministrator = attestationDefinitionRoles.Administrator.name
const AttestationDefinitionEmployee = attestationDefinitionRoles.Employee.name
const AttestationDefinitionEditor = attestationDefinitionRoles.Editor.name
const AttestationDefinitionOwner = attestationDefinitionRoles.Owner.name
const AttestationDefinitionTester = attestationDefinitionRoles.Tester.name

// State machine for AttestationDefinition documents
export const attestationDefinitionStates: OdsDocStates = {
    start: {
        label: "Start",
        description: "Start",
        entry: [],
        write: [],
        read: [],
        // This is the action handler if document id isn't specified for runAction()
        nextStates: {
            created: {
                groups: [AttestationDefinitionEmployee],
            }
        }
    },
    // Attestation Definition is created but not active yet
    inactive: {
        label: "Inactive",
        description: "Inactive",
        entry: [AttestationDefinitionEmployee],
        read: [AttestationDefinitionOwner, AttestationDefinitionAdministrator, AttestationDefinitionEditor],
        write: [AttestationDefinitionOwner, AttestationDefinitionAdministrator, AttestationDefinitionEditor],
        nextStates: {
            active: {
                groups: [AttestationDefinitionOwner, AttestationDefinitionAdministrator, AttestationDefinitionEditor],
            },
            cancelled: {
                groups: [AttestationDefinitionOwner, AttestationDefinitionAdministrator, AttestationDefinitionEditor],
            }
        },
    },
    // Attestation Definition is active
    active: {
        label: "Active",
        description: "Active",
        entry: [AttestationDefinitionOwner, AttestationDefinitionAdministrator, AttestationDefinitionEditor],
        read: [AttestationDefinitionOwner, AttestationDefinitionAdministrator, AttestationDefinitionEditor],
        write: [AttestationDefinitionOwner, AttestationDefinitionAdministrator, AttestationDefinitionEditor],
        nextStates: {
            inactive: {
                groups: [AttestationDefinitionOwner, AttestationDefinitionAdministrator, AttestationDefinitionEditor],
            },
            cancelled: {
                groups: [AttestationDefinitionOwner, AttestationDefinitionAdministrator, AttestationDefinitionEditor],
            }
        },
    },
    // Attestation Definition is cancelled
    cancelled: {
        label: "Cancelled",
        description: "Cancelled",
        entry: [AttestationDefinitionOwner, AttestationDefinitionAdministrator, AttestationDefinitionEditor],
        read: [AttestationDefinitionOwner, AttestationDefinitionAdministrator, AttestationDefinitionEditor],
        write: [AttestationDefinitionOwner, AttestationDefinitionAdministrator, AttestationDefinitionEditor],
        nextStates: {
        },
    },
}
