import js from "@eslint/js";
import compat from "eslint-plugin-compat";
import globals from "globals";

export default [
  { ignores: ["dist/", "node_modules/"] },
  js.configs.recommended,
  compat.configs["flat/recommended"],
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
    rules: {
      "no-console": "error",
      "no-debugger": "error",
      "no-var": "error",
      "prefer-const": "error",
    },
  },
  {
    files: ["*.config.js"],
    languageOptions: { globals: globals.node },
  },
  // Tests run in Node and Playwright, not in the visitors' browsers
  {
    files: ["tests/**"],
    rules: { "compat/compat": "off" },
  },
];
