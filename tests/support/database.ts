import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

export const IDS = {
  alpha: "00000000-0000-4000-8000-000000000001",
  beta: "00000000-0000-4000-8000-000000000002",
  gamma: "00000000-0000-4000-8000-000000000003",
} as const;

export const FIXED_TIME = "2024-01-02T03:04:05.000Z";

export const testPool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });

async function sqlFile(relativePath: string) {
  return readFile(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
}

export async function bootstrapDatabase() {
  await testPool.query(`
    DROP TABLE IF EXISTS project_image_translations, project_translations,
      project_images, contactforms, projects CASCADE
  `);
  await testPool.query(await sqlFile("./schema.sql"));
  await testPool.query(await sqlFile("../../migrations/0001_create_project_translations.sql"));
  await testPool.query(await sqlFile("../../migrations/0002_seed_project_translations.sql"));
  await testPool.query(await sqlFile("../../migrations/0003_admin_panel.sql"));
}

export async function seedDatabase() {
  await testPool.query(`
    TRUNCATE project_image_translations, project_translations, project_images,
      contactforms, projects CASCADE;

    INSERT INTO projects
      (id, legacy_id, slug, category, cover_url, live_url, repo_url, tags,
       display_order, created_at, updated_at)
    VALUES
      ('${IDS.beta}', NULL, 'beta', 'web', '/beta-cover.webp', NULL,
       'https://github.test/beta', ARRAY['TypeScript', 'PostgreSQL'], 1,
       '${FIXED_TIME}', '${FIXED_TIME}'),
      ('${IDS.alpha}', 'legacy-alpha', 'alpha', 'web', '/alpha-cover.webp',
       'https://alpha.test', 'https://github.test/alpha',
       ARRAY['Next.js', 'TypeScript'], 1, '${FIXED_TIME}', '${FIXED_TIME}'),
      ('${IDS.gamma}', NULL, 'gamma', 'cli', '/gamma-cover.webp', NULL,
       'https://github.test/gamma', NULL, NULL,
       '2024-02-03T04:05:06.000Z', '2024-02-03T04:05:06.000Z');

    INSERT INTO project_translations (project_id, locale, name, subtitle, body)
    VALUES
      ('${IDS.alpha}', 'es', 'Alfa ES', 'Subtítulo alfa', 'Cuerpo alfa'),
      ('${IDS.alpha}', 'en', 'Alpha EN', 'Alpha subtitle', 'Alpha body'),
      ('${IDS.beta}', 'es', 'Beta ES', 'Subtítulo beta', 'Cuerpo beta'),
      ('${IDS.beta}', 'en', 'Beta EN', 'Beta subtitle', 'Beta body'),
      ('${IDS.gamma}', 'es', 'Gamma ES', 'Subtítulo gamma', 'Cuerpo gamma'),
      ('${IDS.gamma}', 'en', 'Gamma EN', 'Gamma subtitle', 'Gamma body');

    INSERT INTO project_images (project_id, idx, url, caption)
    VALUES
      ('${IDS.alpha}', 2, '/alpha-2.webp', 'legacy 2'),
      ('${IDS.alpha}', 0, '/alpha-0.webp', 'legacy 0'),
      ('${IDS.alpha}', 1, '/alpha-1.webp', 'legacy 1'),
      ('${IDS.beta}', 0, '/beta-0.webp', 'legacy beta');

    INSERT INTO project_image_translations (project_id, idx, locale, caption)
    VALUES
      ('${IDS.alpha}', 2, 'es', 'Alfa dos'),
      ('${IDS.alpha}', 2, 'en', 'Alpha two'),
      ('${IDS.alpha}', 0, 'es', 'Alfa cero'),
      ('${IDS.alpha}', 0, 'en', 'Alpha zero'),
      ('${IDS.alpha}', 1, 'es', 'Alfa uno'),
      ('${IDS.alpha}', 1, 'en', 'Alpha one'),
      ('${IDS.beta}', 0, 'es', 'Beta cero'),
      ('${IDS.beta}', 0, 'en', 'Beta zero');
  `);
}
