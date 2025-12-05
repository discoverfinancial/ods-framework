/**
 * Copyright (c) 2025 Capital One
*/

import { AttestationInfo } from "../models";
import { AppContext } from "../odsUi";
import { OdsDocStates, Roles, StateCallbackContext } from "./base";

export async function doesUserHaveAttestationRole(context: AppContext, document: AttestationInfo, role: string) {
    const email = context.user.email;
    if (attestationRoles[role]) {
        if (typeof attestationRoles[role].getMembers === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
            const members = await (attestationRoles[role].getMembers as Function)( {caller: context.user, document} as any);
            if (members) {
                for (const member of members) {
                    if (member.email == email) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
    if ((role == attestationRoles.Employee.name) && context.isEmployee) {
        return true;
    }
    if ((role == attestationRoles.Editor.name) && context.isEditor) {
        return true;
    }
    if (context.isAdministrator) {
        return true;
    }
    return false;
}

// Roles for Attestation documents
export const attestationRoles: Roles = {
    Tester: {
        name: "Tester",
        getMembers: "Tester",
    },
    Attestor: {
        name: "Attestor",
        getMembers: async function(ctx: StateCallbackContext) {
            const members = [];
            if (ctx.document.attestors) {
                for (const attestor of ctx.document.attestors) {
                    try {
                        members.push({...attestor.user, name: attestor.user.displayName, title: attestor.role, department: attestor.group?.name || ""});
                    } catch (e) {
                        console.log(e);
                    }
                }
            }
            console.log(`Attestors group members =`,members)
            return members;
        },
    },
    ManagementChain: {
        name: "ManagementChain",
        getMembers: async function(ctx: StateCallbackContext) {
            const members = [];
            if (ctx.document.managementChain) {
                for (const management of ctx.document.managementChain) {
                    members.push(management);
                }
            }
            return members;
        }
    },
    Subscriber: {
        name: "Subscriber",
        getMembers: async function(ctx: StateCallbackContext) {
            const members = [];
            if (ctx.document.subscriptions) {
                for (const subscriber of ctx.document.subscriptions) {
                    members.push(subscriber.user);
                }
            }
            return members;
        }
    },
    Administrator: {
        name: "Admin",
        getMembers: "Admin",
    },
    Editor: {
        name: "Editor",
        getMembers: "Editor",
    },
    Employee: {
        name: "Employee",
        getMembers: "Employee",
    },
}

const AttestationAdministrator = attestationRoles.Administrator.name
const AttestationEditor = attestationRoles.Editor.name
const AttestationEmployee = attestationRoles.Employee.name
const AttestationManagementChain = attestationRoles.ManagementChain.name
const AttestationSubscriber = attestationRoles.Subscriber.name

// @TODO: Uncomment this to allow all users to view & edit all attestations
// const AttestationAttestor = attestationRoles.Employee.name

// @TODO: Uncomment this to allow testers to view & edit all attestations
// const AttestationAttestor = attestationRoles.Tester.name

// @TODO: Uncomment this to only allow those users listed in attestors array to view & edit attestations
const AttestationAttestor = attestationRoles.Attestor.name

// State machine for Attestation documents
export const attestationStates: OdsDocStates = {
    start: {
        label: "Start",
        description: "Start",
        entry: [],
        write: [],
        read: [],
        // This is the action handler if document id isn't specified for runAction()
        nextStates: {
            created: {
                groups: [AttestationEmployee],
            }
        }
    },
    // Attestation is created but not active yet
    created: {
        label: "Created",
        description: "Created",
        entry: [AttestationEmployee],
        read: [AttestationAttestor, AttestationAdministrator, AttestationManagementChain, AttestationSubscriber, AttestationEditor],
        write: [AttestationAttestor, AttestationAdministrator],
        nextStates: {
            active: {
                groups: [AttestationAttestor, AttestationAdministrator],
            },
            cancelled: {
                groups: [AttestationAttestor, AttestationAdministrator],
            },
        },
    },
    // Attestation is active and waiting for user to answer all required questions
    active: {
        label: "Active",
        description: "Active",
        entry: [AttestationAttestor, AttestationAdministrator],
        read: [AttestationAttestor, AttestationAdministrator, AttestationManagementChain, AttestationSubscriber, AttestationEditor],
        write: [AttestationAttestor, AttestationAdministrator],
        nextStates: {
            pending: {
                groups: [AttestationAttestor, AttestationAdministrator],
            },

            complete: {
                groups: [AttestationAttestor, AttestationAdministrator],
            },

            rejected: {
                groups: [AttestationAttestor, AttestationAdministrator],
            },

            cancelled: {
                groups: [AttestationAttestor, AttestationAdministrator],
            },

        },
    },

    // All required questions are answered except date to update, which hasn't occurred yet
    pending: {
        label: "Pending",
        description: "Pending",
        entry: [AttestationAttestor, AttestationAdministrator],
        read: [AttestationAttestor, AttestationAdministrator, AttestationManagementChain, AttestationSubscriber, AttestationEditor],
        write: [AttestationAttestor, AttestationAdministrator],
        nextStates: {
            active: {
                groups: [AttestationAttestor, AttestationAdministrator],
            },
            complete: {
                groups: [AttestationAttestor, AttestationAdministrator],
            },
            cancelled: {
                groups: [AttestationAttestor, AttestationAdministrator],
            },
        },
    },
    // Date to update reached without any update occurred
    overdue: {
        label: "Overdue",
        description: "Overdue",
        onEntry: async function (ctx) {
            console.log("Entering OVERDUE state for Attestation")
            console.log("Document =", ctx.document);
            return {};
        },
        entry: [AttestationAttestor, AttestationAdministrator],
        read: [AttestationAttestor, AttestationAdministrator, AttestationManagementChain, AttestationSubscriber, AttestationEditor],
        write: [AttestationAttestor, AttestationAdministrator],
        nextStates: {
            pending: {
                groups: [AttestationAttestor, AttestationAdministrator],
            },
            active: {
                groups: [AttestationAttestor, AttestationAdministrator],
            },
            cancelled: {
                groups: [AttestationAttestor, AttestationAdministrator],
            },

        },
    },
    // Attestation is done
    complete: {
        label: "Complete",
        description: "Complete",
        entry: [AttestationAttestor, AttestationAdministrator],
        read: [AttestationAttestor, AttestationAdministrator, AttestationManagementChain, AttestationSubscriber, AttestationEditor],
        write: [AttestationAttestor, AttestationAdministrator],
        nextStates: {},
    },
    // Attestation is rejected
    rejected: {
        label: "Rejected",
        description: "Rejected",
        entry: [AttestationAttestor, AttestationAdministrator],
        read: [AttestationAttestor, AttestationAdministrator, AttestationManagementChain, AttestationSubscriber, AttestationEditor],
        write: [AttestationAttestor, AttestationAdministrator],
        nextStates: {},
    },
    // Attestation is deferred
    deferred: {
        label: "Deferred",
        description: "Deferred",
        entry: [AttestationAttestor, AttestationAdministrator],
        read: [AttestationAttestor, AttestationAdministrator, AttestationManagementChain, AttestationSubscriber, AttestationEditor],
        write: [AttestationAttestor, AttestationAdministrator],
        nextStates: {},
    },
    // Attestation was cancelled and is no longer required to be done
    cancelled: {
        label: "Cancelled",
        description: "Cancelled",
        entry: [AttestationAttestor, AttestationAdministrator],
        read: [AttestationAttestor, AttestationAdministrator, AttestationManagementChain, AttestationSubscriber, AttestationEditor],
        write: [AttestationAdministrator],
        nextStates: {},
    },

}
