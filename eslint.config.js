import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import json from 'eslint-plugin-json';

export default {
    parser: tsParser,
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        extraFileExtensions: ['.json'],

    },
    plugins: {
        '@typescript-eslint': ts,
        ts,
        json
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:json/recommended",
    ],
    rules: {
        semi: ["error", "always"],
        "prefer-const": ["error"],
        "@typescript-eslint/no-non-null-assertion": "off"
    },
    files: ["**/*.ts", "**/*.json"]
};