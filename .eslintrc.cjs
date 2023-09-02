module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: [
        '@typescript-eslint',
        'json'
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended-type-checked",
        "plugin:json/recommended"
    ],
    root: true,
    parserOptions: {
        project: true,
        tsconfigRootDir: "tsconfig.json",
    },
    env: {
        node: true,
        es6: true
    }
};