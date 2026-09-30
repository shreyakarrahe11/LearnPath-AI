import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalDb = globalThis;
const pool = globalDb.__coursePool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== "production") globalDb.__coursePool = pool;
export const db = drizzle(pool);
