/**
 * Copyright (c) 2025 Capital One
*/

import { AppContext } from "./odsUi"

export * from "./states/base"
export * from "./states/sbom"
export * from "./states/store"
export * from "./states/query"
export * from "./states/script"
export * from "./states/notebookvar"
export * from './states/guidance'
export * from './states/attestation'
export * from './states/attestationDefinition'

export async function doesUserHaveRole(context: AppContext, document: any, roles: any, role: string) {
    const email = context.user.email;
    if (roles[role]) {
        if (typeof roles[role].getMembers === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
            const members = await (roles[role].getMembers as Function)( {caller: context.user, document} as any);
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
    if ((role == roles.Employee.name) && context.isEmployee) {
        return true;
    }
    if (context.isAdministrator) {
        return true;
    }
    return false;
}
