/**
 * Copyright (c) 2025 Capital One
*/

import { Role } from "./states";

/**
 * Replace variables in a template string with values from an object.
 * 
 * @param template The template string with variables in ${} format
 * @param vars The object with variable values
 * @returns The templated string
 */
export const templatized = (template: string, vars = {}) => {
    const handler = new Function('vars', [
        'const localVars = ( ' + Object.keys(vars).join(', ') + ' ) =>',
        '`' + template + '`',
        'return localVars(...Object.values(vars))'
    ].join('\n'))
    return handler(vars)
}

/**
 * Get the base url for the app
 * 
 * @returns The base url as a string
 */
export function getAppUrl() {
    try {
        return (window.location.origin);
    } catch (e) {
        return (process.env.BASE_URL);
    }
}

/** Format a date as MM/DD/YY at HH:MM AM/PM
 * 
 * @param d The date as a number
 * @returns The formatted date as a string
 */
export function formatDateTimeUTC(d: number): string {
    if (!d) { return "" }
    const date = new Date(d);
    const hours = date.getUTCHours() % 12;
    const amPm = date.getUTCHours() > 11 ? "PM" : "AM";
    return (
        ("0" + (date.getUTCMonth() + 1)).slice(-2) + "/" +
        ("0" + date.getUTCDate()).slice(-2) + "/" +
        ("" + date.getUTCFullYear()).slice(-2) + " at " + hours + ":" + ("0" + date.getUTCMinutes()).slice(-2) + " " + amPm
    )
}

/**
 * Capitalize the first letter of a string
 * 
 * @param str The string to capitalize
 * @returns String
 */
export function capitalize(str: string) {
    return (str.charAt(0).toUpperCase() + str.slice(1)) || "";
}

/**
 * Return the highest role from an array of roles
 * 
 * @param roles Array of roles
 * @returns The highest role from the array
 */
export function chooseHighestRole(roles: string[]) {
    if (roles.includes(Role.Administrator)) {
        return Role.Administrator;
    }
    if (roles.includes(Role.Editor)) {
        return Role.Editor;
    }
    if (roles.includes(Role.Employee)) {
        return Role.Employee;
    }
    return roles[0];
}

/**
 * Render software name from bomRef object
 * 
 * @param bomRef The bomRef object
 * @returns String
 */
export function renderSoftwareName(bomRef: any) {
    return bomRef.name + (bomRef.version ? "@" + bomRef.version : "");
}

/**
 * Create a BomRef object from an SBOM component
 * 
 * @param component The SBOM component object
 * @param id Optional id for the BomRef
 * @returns BomRef object
 */
export function createBomRef(component: any, id?: string) {
    const bomRef = { id: id, name: component.name, version: component.version, type: component.type, purl: component.purl, group: component.group };
    return bomRef;
}

/**
 * Return the base purl for the purl.  This is the purl without the version.
 * 
 * @param purl The purl string
 * @returns String
 */
export function getBasePurl(purl: string) {
    if (purl) {
        const i = purl.indexOf("@");
        if (i > 0) {
            return purl.substring(0, i);
        }
    }
    return purl;
}


/**
 * Compare version strings.  Return -1 if v1 < v2, 1 if v1 > v2 more, 0 if equal.
 * 
 * @param v1 The first version string
 * @param v2 The second version string
 * @param onlyCompareDigits If true, only compare the digit parts of the version (ignore letters)
 * @returns -1, 0, or 1
 */
export function compareVersions(v1: string, v2: string, onlyCompareDigits=false) {
    if ((v1 == undefined || !v1) && (v2 == undefined && !v2)) return 0;
    if (v1 == undefined || !v2 ) return -1;
    if (v2 == undefined || !v2) return 1;
    const parts1 = v1.split(".");
    const parts2 = v2.split(".");
    const len = Math.min(parts1.length, parts2.length);
    for (let i=0; i<len; i++) {

        // Ignore non-digit characters if onlyCompareDigits is true
        let _p1 = onlyCompareDigits ? parts1[i].replace(/[^\d.x]/gi, '') : parts1[i];
        let _p2 = onlyCompareDigits ? parts2[i].replace(/[^\d.x]/gi, '') : parts2[i];

        // Replace quotes
        _p1 = _p1.replace('"', "").replace('"', "");
        _p2 = _p2.replace('"', "").replace('"', "");

        // If version has #.x, then need to stop compare & return equals
        if ((_p1?.toLowerCase() == "x") || (_p2?.toLowerCase() == "x")) {
            return 0;
        }
        const p1 = parseInt(_p1);
        const p2 = parseInt(_p2);
        if (p1 < p2) {
            return -1;
        }
        if (p1 > p2) {
            return 1;
        }
    }
    return 0;
}


/**
 * Normalize a GitHub URL by converting it to lowercase and removing the ".git" suffix.
 * 
 * @param url The GitHub URL to normalize
 * @returns The normalized URL
 */
export function normalizeGithubUrl(url: string | undefined) {
    if (url && url.startsWith("http")) {
        return url.toLowerCase().replace(".git", "");
    }
    return "";
}


/**
 * Return the repo name part of a GitHub URL and convert to lowercase and removing the ".git" suffix.
 * 
 * @param url The GitHub URL to normalize
 * @returns The partial URL
 */
export function partialGithubUrl(url: string | undefined) {
    if (url && url.startsWith("http")) {
        const i = url.lastIndexOf("/");
        if (i > 0) {
            const r = url.substring(i + 1).toLowerCase().replace(".git", "");
            return r;
        }
        else {
            return url.toLowerCase().replace(".git", "");
        }
    }
    return "";
}