import type { Config } from "drizzle-kit";
import { neonConfig } from "@neondatabase/serverless";

console.log("Loading Drizzle config...");

if (!process.env.VERCEL_ENV) {
  neonConfig.wsProxy = (host) => `${host}:5433/v1`;
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;
}

if (!process.env.POSTGRES_URL) {
  throw new Error("Missing POSTGRES_URL");
}

const nonPoolingUrl = process.env.POSTGRES_URL.replace(":6543", ":5432");

console.log("Using non-pooling URL:", nonPoolingUrl);

export default {
  schema: "./src/schema",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: nonPoolingUrl,
    ssl:
      process.env.VERCEL_ENV === "production"
        ? {
            rejectUnauthorized: false,
          }
        : false,
  },
} satisfies Config;
