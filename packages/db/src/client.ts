import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";

import * as schema from "./schema";

export const db = drizzle(sql, { schema });

/** Stable alias for `typeof db` (for routers that accept a DB instance type without importing `db`). */
export type CooperDb = typeof db;
