/**
 * Copyright (c) 2025 Capital One
*/

import { OdsDocStates, Role } from "./base";

export const sbomStates:OdsDocStates = {

    created: {
        label: "Created",
        description: "Created",
        entry: [Role.Editor, Role.Administrator],
        read: [Role.Employee],
        write: [Role.Editor, Role.Administrator],
        nextStates: {},
    }

}