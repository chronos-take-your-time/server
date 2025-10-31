import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import jest from "eslint-plugin-jest"; // 👈 aqui

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs"
    }
  },
  {
    files: ["**/*.test.js", "**/*.spec.js"],
    plugins: { jest },
    languageOptions: {
      globals: {
        ...jest.environments.globals.globals
      }
    },
    rules: {
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/prefer-to-have-length": "warn",
      "jest/valid-expect": "error"
    }
  }
]);