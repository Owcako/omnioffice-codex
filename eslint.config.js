import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default [
    // Array entry with ignores skips node_modules, dist, .venv, and build artifacts from linting.
    {
        ignores: [
            "node_modules/**",
            "dist/**",
            ".venv/**",
            "backend/**",
            "public/**"
        ]
    },
    // Spread entries apply the recommended React and Prettier configs.
    js.configs.recommended,
    pluginReact.configs.flat.recommended,
    eslintConfigPrettier,
    // Config block sets browser globals, enables React settings, and turns off react/react-in-jsx-scope and react/prop-types for the automatic runtime.
    {
        files: ["**/*.{js,mjs,cjs,jsx}"],
        languageOptions: {
            globals: globals.browser
        },
        settings: {
            react: {
                version: "detect"
            }
        },
        rules: {
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off"
        }
    }
];
