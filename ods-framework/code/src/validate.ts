/**
 * Copyright (c) 2025 Capital One
*/

import { assertGuard } from "@nrfcloud/ts-json-schema-transformer";
import { PostDocs, throwErr, Validate } from "dlms-server";
import {
    ApiTokenCreate,
    ApiKeyCreate,
    SbomDocumentCreate,
    SbomDocumentUpdate,
    QueryCreate,
    QueryUpdate,
    ScriptCreate,
    ScriptUpdate,
    StoreCreate,
    StoreUpdate,
    GuidanceCreate,
    GuidanceUpdate,
    AttestationCreate,
    AttestationUpdate,
    AttestationDefinitionCreate,
    AttestationDefinitionUpdate,
} from "ods-common";


export function validateGetDocs(type:any, match:any, options:any) {
    try {
        if (match) {
            assertGuard<string>(match);
        }
        if (options) {
            assertGuard<string>(options);
        }
    } catch (e: any) {
        console.log("Validation error =", JSON.stringify(e.cause,null,4));
        return throwErr(422, JSON.stringify(e.cause));
    }
}

export function validatePostDocs(type:any, body:any) {
    console.log("VALIDATE postDocs: type=", type, "body=", body)
    try {
        assertGuard<PostDocs>(body);
    } catch (e: any) {
        console.log("Validation error =", JSON.stringify(e.cause,null,4));
        console.log("e=", e);
        return throwErr(422, JSON.stringify(e.cause));
    }
}

export const validateQuery: Validate = {
    postDocs: validatePostDocs,
    getDocs: validateGetDocs,
    createDoc(type, body) {
        try {
            assertGuard<QueryCreate>(body);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
    updateDoc(type, id, args) {
        try {
            assertGuard<QueryUpdate>(args);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
}

export const validateScript: Validate = {
    postDocs: validatePostDocs,
    getDocs: validateGetDocs,
    createDoc(type, body) {
        try {
            assertGuard<ScriptCreate>(body);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            console.log("e=", e);
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
    updateDoc(type, id, args) {
        try {
            assertGuard<ScriptUpdate>(args);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
}

export const validateSbom: Validate = {
    postDocs: validatePostDocs,
    getDocs: validateGetDocs,
    createDoc(type, body) {
        try {
            assertGuard<SbomDocumentCreate>(body);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
    updateDoc(type, id, args) {
        try {
            assertGuard<SbomDocumentUpdate>(args);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
}

export const validateStore: Validate = {
    postDocs: validatePostDocs,
    getDocs: validateGetDocs,
    createDoc(type, body) {
        try {
            assertGuard<StoreCreate>(body);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
    updateDoc(type, id, args) {
        try {
            assertGuard<StoreUpdate>(args);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
}

export const validateLog: Validate = {
    postDocs: validatePostDocs,
    getDocs: validateGetDocs,
    createDoc(type, body) {
        try {
            assertGuard<StoreCreate>(body);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
    updateDoc(type, id, args) {
        try {
            assertGuard<StoreUpdate>(args);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
}

export const validateApitoken: Validate = {
    postDocs: validatePostDocs,
    getDocs: validateGetDocs,
    createDoc(type, body) {
        try {
            assertGuard<ApiTokenCreate>(body);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
    updateDoc(type, id, args) {
        try {
            assertGuard<ApiTokenCreate>(args);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
}

export const validateApikey: Validate = {
    postDocs: validatePostDocs,
    getDocs: validateGetDocs,
    createDoc(type, body) {
        try {
            assertGuard<ApiKeyCreate>(body);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
    updateDoc(type, id, args) {
        try {
            assertGuard<ApiKeyCreate>(args);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
}

export const validateGuidance: Validate = {
    postDocs: validatePostDocs,
    getDocs: validateGetDocs,
    createDoc(type, body) {
        try {
            assertGuard<GuidanceCreate>(body);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
    updateDoc(type, id, args) {
        try {
            assertGuard<GuidanceUpdate>(args);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
}

export const validateAttestation: Validate = {
    postDocs: validatePostDocs,
    getDocs: validateGetDocs,
    createDoc(type, body) {
        try {
            assertGuard<AttestationCreate>(body);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
    updateDoc(type, id, args) {
        try {
            assertGuard<AttestationUpdate>(args);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
}

export const validateAttestationDefinition: Validate = {
    postDocs: validatePostDocs,
    getDocs: validateGetDocs,
    createDoc(type, body) {
        try {
            assertGuard<AttestationDefinitionCreate>(body);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
    updateDoc(type, id, args) {
        try {
            assertGuard<AttestationDefinitionUpdate>(args);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
}
