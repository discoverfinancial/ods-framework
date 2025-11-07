import { defineConfig, globalIgnores } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores(["**/dist/", "**/node_modules/", "**/build/"]), {
    extends: compat.extends("plugin:@typescript-eslint/recommended", "prettier"),

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 2021,
        sourceType: "module",

        parserOptions: {
            project: "./tsconfig.json",
        },
    },

    ignores: [ "src/__tests__/**/*", "eslint.config.mjs", "src/ui/**/*", "coverage/**/*", "src/adminSandboxFunctions.*" ],

    rules: {
        "@typescript-eslint/no-unused-vars": ["warn", {
            vars: "all",
            args: "after-used",
            ignoreRestSiblings: false,
        }],

        "@typescript-eslint/no-require-imports": "warn",

        "@typescript-eslint/no-explicit-any": "off",
        "no-unused-vars": "off",
        "prefer-const": "warn",
        "no-var": "warn",
        "@typescript-eslint/no-this-alias": "warn",
        "@typescript-eslint/no-empty-object-type": "warn",
    },
}]);