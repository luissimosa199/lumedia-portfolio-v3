// Tiny idempotent SQL migration runner.
//
// There is no existing migration framework in this repo (the earlier
// Mongo -> Postgres mission applied its schema out-of-band, without
// committing any SQL). This script is the minimal convention going
// forward: every `migrations/NNNN_*.sql` file is applied at most once,
// in filename order, inside its own transaction, tracked in a
// `schema_migrations` table. Re-running is always safe - already-applied
// files are skipped, and every file in this repo is itself written with
// `ON CONFLICT` / `IF NOT EXISTS` so a partial re-apply is also safe.
//
// Usage:
//   DB_URL=postgres://... node migrations/apply.mjs
//   (or set DEV_DATABASE_URL, matching src/lib/postgresPool.ts)

import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const migrationsDir = dirname(fileURLToPath(import.meta.url));
const databaseUrl = process.env.DB_URL ?? process.env.DEV_DATABASE_URL;

if (!databaseUrl) {
  console.error('Missing environment variable: set DB_URL or DEV_DATABASE_URL.');
  process.exitCode = 1;
  process.exit();
}

const pool = new Pool({ connectionString: databaseUrl });

async function main() {
  const entries = await readdir(migrationsDir);
  const files = entries.filter((name) => name.endsWith(".sql")).sort();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const applied = await pool.query("SELECT filename FROM schema_migrations");
  const appliedNames = new Set(applied.rows.map((row) => row.filename));

  let ranCount = 0;
  for (const file of files) {
    if (appliedNames.has(file)) {
      console.log(`skip  ${file} (already applied)`);
      continue;
    }

    const sql = await readFile(join(migrationsDir, file), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`apply ${file}`);
      ranCount += 1;
    } catch (error) {
      await client.query("ROLLBACK");
      throw new Error(`Failed applying ${file}: ${error.message}`, { cause: error });
    } finally {
      client.release();
    }
  }

  console.log(
    ranCount === 0
      ? "Nothing to apply, database is up to date."
      : `Applied ${ranCount} migration file(s).`
  );
}

try {
  await main();
} finally {
  await pool.end();
}
