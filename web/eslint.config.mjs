import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // copy-pyodide.mjs / copy-monaco.mjs 复制的第三方运行时（压缩产物，不 lint）
    "public/pyodide/**",
    "public/monaco/**",
  ]),
]);

export default eslintConfig;
