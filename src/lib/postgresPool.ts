import { Pool } from "pg";

const globalForPostgres = globalThis as typeof globalThis & {
  postgresPool?: Pool;
};

const databaseUrl = process.env.DB_URL ?? process.env.DEV_DATABASE_URL;

export const postgresPool =
  globalForPostgres.postgresPool ??
  new Pool({
    connectionString: databaseUrl,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPostgres.postgresPool = postgresPool;
}

export function getPostgresPool() {
  if (!databaseUrl) {
    throw new Error('Invalid/Missing environment variable: "DB_URL"');
  }

  return postgresPool;
}
