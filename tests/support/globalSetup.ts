import {readFile, readdir} from "node:fs/promises";
import {resolve} from "node:path";
import {Pool} from "pg";
import {seedProjects} from "./fixtures";
import {getTestDatabaseUrl} from "../../scripts/test-database-env.mjs";

export default async function setup() {
  const pool = new Pool({connectionString: getTestDatabaseUrl()});
  try {
    await pool.query(`
      DROP TABLE IF EXISTS project_image_translations, project_translations,
        project_images, contactforms, projects, schema_migrations CASCADE
    `);
    await pool.query(await readFile(resolve("tests/support/base-schema.sql"), "utf8"));
    const files = (await readdir(resolve("migrations")))
      .filter((file) => /^\d+_.*\.sql$/.test(file))
      .sort();
    for (const file of files) {
      await pool.query(await readFile(resolve("migrations", file), "utf8"));
    }
    await seedProjects(pool);
    await pool.query(`TRUNCATE contactforms`);
  } finally {
    await pool.end();
  }
}
