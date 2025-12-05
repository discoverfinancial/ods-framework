/**
 * Copyright (c) 2025 Capital One
*/

import { attestationType, guidanceType } from "../models";
import { OdsDocStates, Role, StateCallbackContext } from "./base";
import { StateActionCallbackReturn } from "dlms-base";

export const guidanceStates: OdsDocStates = {
    // Guidance is created but not active yet
    created: {
        label: "Created",
        description: "Created",
        entry: [Role.Employee],
        read: [Role.Employee],
        write: [Role.Editor, Role.Administrator],
        action: async function (ctx) {
            return await handleAction(ctx);
        },
        nextStates: {
            active: {
                groups: [Role.Administrator],
            },
            closed: {
                groups: [Role.Administrator],
            }
        },
    },
    // All attestations based on this guidance are required & any new products are required to follow it
    active: {
        label: "Active",
        description: "Active",
        entry: [Role.Employee],
        read: [Role.Employee],
        write: [Role.Editor, Role.Administrator],
        action: async function (ctx) {
            return await handleAction(ctx);
        },
        nextStates: {
            closed: {
                groups: [Role.Administrator],
            }
        },
    },
    // No longer active, but attestations still must be done
    closed: {
        label: "Closed",
        description: "Closed",
        entry: [Role.Employee],
        read: [Role.Employee],
        write: [Role.Editor, Role.Administrator],
        nextStates: {},
    },
    // Cancel guidance & cancel all attestations based on it
    cancelled: {
        label: "Cancelled",
        description: "Cancelled",
        onEntry: async function (ctx) {
            console.log("Entering 'cancelled' state for Guidance")
            console.log("Document =", ctx.document);

            // Get attestations for guidance id
            const docMgr = ctx.getDocMgr();
            const usrCtx = ctx.getUserContext();
            const attestations = await docMgr.getDocs(usrCtx, attestationType, {guidance: ctx.document.id}, {});
            console.log("attestations to consider cancelling =", attestations);
            for (const attestation of attestations) {
                // Cancel attestation if not in terminal state
                if (["created", "active", "pending", "overdue"].includes(attestation.state)) {
                    await docMgr.updateDoc(usrCtx, {type: attestationType, id: attestation.id}, {state: "cancelled"})
                }
            }
            return {};
        },
        entry: [Role.Employee],
        read: [Role.Employee],
        write: [Role.Editor, Role.Administrator],
        nextStates: {},
    }
}

const handleAction = async (ctx: StateCallbackContext) : Promise<StateActionCallbackReturn> => {
    console.log("states.ts: action() handleAction() called for state=", ctx.document.state);
    const userContext = ctx.getUserContext();
    
    if (ctx.updates.action == "cancelAllGuidances") {

        // Set all active guidances to cancelled
        try {
            const guidances = await ctx.getDocMgr().getDocs(userContext, guidanceType, {"item.basePurl": ctx.document.item.basePurl, state: "active"});
            console.log("handleAction: guidances=", guidances);
            for (const guidance of guidances) {
                const cancelled = await ctx.getDocMgr().updateDoc(userContext, {type: guidanceType, id: guidance.id}, {state: "cancelled"});
                console.log("handleAction: cancelled guidance =", cancelled);
            }
        }
        catch (e) {
            console.error(e);
        }
    }

    return {};
}

