import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { env } from "./env";
import * as schema from "./schema";

const sql = neon(env.POSTGRES_URL);
export const db = drizzle(sql, { schema });

/** Stable alias for `typeof db` (for routers that accept a DB instance type without importing `db`). */
export type CooperDb = typeof db;
