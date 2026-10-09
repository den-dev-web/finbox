import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["dist/", "node_modules/"] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
  },
  {
    files: ["*.config.js"],
    languageOptions: { globals: globals.node },
  },
];
