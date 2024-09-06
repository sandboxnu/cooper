import baseConfig, { restrictEnvAccess } from "@cooper/eslint-config/base";
import nextjsConfig from "@cooper/eslint-config/nextjs";
import reactConfig from "@cooper/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
