import { Role } from "../../../../ods-common/code/src/states";
import { capitalize, chooseHighestRole, renderSoftwareName, templatized, formatDateTimeUTC, createBomRef, getBasePurl, compareVersions, normalizeGithubUrl} from "../../../../ods-common/code/src/odsUtils";

describe("templatized", () => {
    it("replaces a single variable in the template", () => {
        const template = "Hello, ${name}!";
        const result = templatized(template, { name: "World" });
        expect(result).toBe("Hello, World!");
    });

    it("replaces multiple variables in the template", () => {
        const template = "User: ${user}, Role: ${role}";
        const result = templatized(template, { user: "Alice", role: "Admin" });
        expect(result).toBe("User: Alice, Role: Admin");
    });

    it("errors when variables aren't available", () => {
        const template = "Hello, ${name}! Your age is ${age}.";
        expect(() => templatized(template, {name: "Bob"})).toThrow(ReferenceError);
    });

    it("returns the original string if no variables are present", () => {
        const template = "No variables here.";
        const result = templatized(template, { any: "value" });
        expect(result).toBe("No variables here.");
    });

    it("handles empty template string", () => {
        const template = "";
        const result = templatized(template, { name: "Test" });
        expect(result).toBe("");
    });

    it("handles empty variables object", () => {
        const template = "Hello world!";
        const result = templatized(template, {});
        expect(result).toBe("Hello world!")
    });

    it("replaces variables with falsy values", () => {
        const template = "Zero: ${zero}, Empty: ${empty}, False: ${bool}";
        const result = templatized(template, { zero: 0, empty: "", bool: false });
        expect(result).toBe("Zero: 0, Empty: , False: false");
    });
});


describe("formatDateTimeUTC", () => {
    it("returns empty string if no date provided", () => {
        expect(formatDateTimeUTC(NaN)).toBe("");
    });

    it("formats date correctly", () => {
        // 2025-06-10T00:30:00Z
        expect(formatDateTimeUTC(Date.UTC(2025, 5, 10, 1, 30))).toBe("06/10/25 at 1:30 AM");
    });

    it("returns empty string for 0 input", () => {
        expect(formatDateTimeUTC(0)).toBe("");
    });

    it("formats midnight as 12:MM AM", () => {
        // 2025-06-10T00:30:00Z
        expect(formatDateTimeUTC(Date.UTC(2025, 5, 10, 0, 0))).toBe("06/10/25 at 0:00 AM");
    });

    it("formats noon as 12:MM PM", () => {
        // 2025-06-10T12:45:00Z
        expect(formatDateTimeUTC(Date.UTC(2025, 5, 10, 12, 0))).toBe("06/10/25 at 0:00 PM");
    });

    it("pads single digit month, day, and minute", () => {
        // 2025-03-04T09:07:00Z
        expect(formatDateTimeUTC(Date.UTC(2025, 2, 4, 9, 7))).toBe("03/04/25 at 9:07 AM");
    });
});

describe("capitalize", () => {
    it("capitalizes the first letter of a lowercase string", () => {
        expect(capitalize("hello")).toBe("Hello");
    });

    it("returns empty string for empty input", () => {
        expect(capitalize("")).toBe("");
    });

    it("returns string unchanged if already capitalized", () => {
        expect(capitalize("Hello")).toBe("Hello");
    });

    it("handles single character string", () => {
        expect(capitalize("a")).toBe("A");
    });
});

describe("chooseHighestRole", () => {
    it("returns Administrator if present", () => {
        expect(chooseHighestRole([Role.Employee, Role.Administrator, Role.Editor])).toBe(Role.Administrator);
    });

    it("returns Editor if present and Administrator is absent", () => {
        expect(chooseHighestRole([Role.Employee, Role.Editor])).toBe(Role.Editor);
    });

    it("returns Employee if only Employee is present", () => {
        expect(chooseHighestRole([Role.Employee])).toBe(Role.Employee);
    });

    it("returns first role if none of the known roles are present", () => {
        expect(chooseHighestRole(["CustomRole", "AnotherRole"])).toBe("CustomRole");
    });

    it("returns undefined for empty array", () => {
        expect(chooseHighestRole([])).toBeUndefined();
    });
});

describe("renderSoftwareName", () => {
    it("renders name and version if version is present", () => {
        expect(renderSoftwareName({ name: "foo", version: "1.2.3" })).toBe("foo@1.2.3");
    });

    it("renders name only if version is absent", () => {
        expect(renderSoftwareName({ name: "bar" })).toBe("bar");
    });

    it("renders name with empty version if version is empty string", () => {
        expect(renderSoftwareName({ name: "baz", version: "" })).toBe("baz");
    });

    it("renders undefined if name is missing", () => {
        expect(renderSoftwareName({ version: "1.0.0" })).toBe("undefined@1.0.0");
    });
});

describe("createBomRef", () => {
    it("creates bomRef successfully if component has all fields and id is provided", () => {
        const component = { name: "comp1", version: "2.0", type: "library", purl: "pkg:npm/comp1@2.0", group: "group1" };
        const bomRef = createBomRef(component, "id123");
        expect(bomRef).toEqual({
        id: "id123",
        name: "comp1",
        version: "2.0",
        type: "library",
        purl: "pkg:npm/comp1@2.0",
        group: "group1"
        });
    });

    it("creates bomRef if component has some fields missing and id is provided", () => {
        const component = {name: "comp1", version: "2.0"}
        const bomRef = createBomRef(component, "id123");
        expect(bomRef).toEqual({
            id: "id123",
            name: "comp1",
            version: "2.0",
            type: undefined,
            purl: undefined,
            group: undefined
        });
    });

    it("creates bomRef if id is not provided", () => {
        const component = { name: "comp1", version: "2.0", type: "library", purl: "pkg:npm/comp1@2.0", group: "group1" };
        const bomRef = createBomRef(component);
        expect(bomRef).toEqual({
            id: undefined,
            name: "comp1",
            version: "2.0",
            type: "library",
            purl: "pkg:npm/comp1@2.0",
            group: "group1"
        });
    });
});


describe("getBasePurl", () => {
    it("returns the base purl for the purl", () => {
        const purl = "pkg:npm/comp1@2.0.0";
        const result = getBasePurl(purl);
        expect(result).toBe("pkg:npm/comp1");
    });

    it("returns the original purl if no version is present", () => {
        const purl = "pkg:npm/comp1";
        const result = getBasePurl(purl);
        expect(result).toBe("pkg:npm/comp1");
    });

    it("returns empty if purl is empty", () => {
        const purl = "";
        const result = getBasePurl(purl);
        expect(result).toBe("");
    });

    it("returns submitted purl if purl starts with @", () => {
        const purl = "@pkg:npm/comp1";
        const result = getBasePurl(purl);
        expect(result).toBe("@pkg:npm/comp1");
    });
});

describe("compareVersions", () => {
    it("Successfully compares versions", () => {
        const result = compareVersions("1.2.4", "1.2.3");
        expect(result).toBe(1);
    });

    it("Successfully only compares digits in versions", () => {
        const result = compareVersions("1.2e.3a",  "1.2.4!", true);
        expect(result).toBe(-1);
    });

    it("Returns equals if one version has x", () => {
        const result = compareVersions("1.2.x", "1.2.4");
        expect(result).toBe(0);
    });

    it("Returns comparison if one version is null", () => {
        const result = compareVersions("1.2", "");
        expect(result).toBe(1);
    });

    it("Returns equals when one version has different number of components", () => {
        const result = compareVersions("1.2.3", "1.2.3.4");
        expect(result).toBe(0);
    });
});

describe("normalizeGithubUrl", () => {
    it(" normalizes githubURL if valid url submitted", () => {
        const url = "http://Github.com/x.git";
        const result = normalizeGithubUrl(url);
        expect(result).toBe("http://github.com/x");
    });

    it(" returns empty string if invalid url submitted", () => {
        const url = "not a url";
        const result = normalizeGithubUrl(url);
        expect(result).toBe("");
    });

    it(" returns empty string if empty string submitted", () => {
        const url = "";
        const result = normalizeGithubUrl(url);
        expect(result).toBe("");
    });
});

describe("partialGithubUrl", () => {
    it(" normalizes partial github URL if valid url submitted", () => {
        const url = "http://Github.com/x.git";
        const result = normalizeGithubUrl(url);
        expect(result).toBe("http://github.com/x");
    });

    it(" normalizes partial github URL if valid url with no / is submitted", () => {
        const url = "http://Github.com";
        const result = normalizeGithubUrl(url);
        expect(result).toBe("http://github.com");
    });
    it(" returns empty string if invalid url submitted", () => {
        const url = "not a url";
        const result = normalizeGithubUrl(url);
        expect(result).toBe("");
    });

    it(" returns empty string if empty string submitted", () => {
        const url = "";
        const result = normalizeGithubUrl(url);
        expect(result).toBe("");
    });
});


