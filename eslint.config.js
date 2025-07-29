import { defineConfig, globalIgnores } from "eslint/config";

import tsParser from "@typescript-eslint/parser";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import github from "eslint-plugin-github";
import js from "@eslint/js";

import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([
    globalIgnores(["**/node_modules", "**/dist", "**/coverage", "**/.eslintrc.js"]),
    {
        languageOptions: {
            parser: tsParser,
        },

        plugins: {
            "@typescript-eslint": typescriptEslint,
            github,
        },

        extends: compat.extends(
            "eslint:recommended",
            "plugin:@typescript-eslint/recommended",
            "plugin:@typescript-eslint/recommended-requiring-type-checking",
        ),

        rules: {
            "quotes": [2, "single", {
                "avoidEscape": true,
                "allowTemplateLiterals": true,
            }],
            "no-console": 2,
            "eqeqeq": [2, "always"],
            "prefer-arrow-callback": 2,
            "curly": 2,
            "brace-style": 2,
            "max-statements-per-line": 2,
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    "args": "all",
                    "argsIgnorePattern": "^_",
                    "caughtErrors": "all",
                    "caughtErrorsIgnorePattern": "^_",
                    "destructuredArrayIgnorePattern": "^_",
                    "varsIgnorePattern": "^_",
                    "ignoreRestSiblings": true
                }
            ],
            "github/array-foreach": 2,
            "github/no-then": 2,
        },
    },
    {
        files: ["**/*.ts"],

        languageOptions: {
            parserOptions: {
                project: ["./src/tsconfig.json"],
            },
        },
    },
]);
