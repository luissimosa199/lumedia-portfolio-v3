import type {Pool} from "pg";

export const IDS = {
  beta: "00000000-0000-4000-8000-000000000001",
  alpha: "00000000-0000-4000-8000-000000000002",
  delta: "00000000-0000-4000-8000-000000000003",
  epsilon: "00000000-0000-4000-8000-000000000004",
  gamma: "00000000-0000-4000-8000-000000000005",
} as const;

export async function seedProjects(pool: Pool) {
  await pool.query(`TRUNCATE project_image_translations, project_images, project_translations, projects CASCADE`);
  await pool.query(
    `INSERT INTO projects
      (id, legacy_id, slug, name, subtitle, body, category, cover_url, live_url, repo_url, tags, display_order, created_at, updated_at)
     VALUES
      ($1, 'legacy-beta', 'beta', '', '', '', 'Web', '/cover/beta.png', 'https://beta.live', 'https://repo/beta', ARRAY['Next.js','TypeScript'], 0, '2024-01-02T00:00:00Z', '2024-02-02T00:00:00Z'),
      ($2, NULL, 'alpha', '', '', '', 'API', '/cover/alpha.png', NULL, 'https://repo/alpha', ARRAY['PostgreSQL','TypeScript'], 1, '2024-01-01T00:00:00Z', '2024-02-01T00:00:00Z'),
      ($3, NULL, 'delta', '', '', '', 'CLI', '/cover/delta.png', '', 'https://repo/delta', ARRAY['Docker'], NULL, '2024-01-03T00:00:00Z', '2024-02-03T00:00:00Z'),
      ($4, NULL, 'epsilon', '', '', '', 'Web', '/cover/epsilon.png', NULL, 'https://repo/epsilon', ARRAY['Next.js','Docker'], NULL, '2024-01-03T00:00:00Z', '2024-02-04T00:00:00Z'),
      ($5, NULL, 'gamma', '', '', '', 'API', '/cover/gamma.png', NULL, 'https://repo/gamma', NULL, NULL, '2024-01-04T00:00:00Z', '2024-02-05T00:00:00Z')`,
    Object.values(IDS)
  );
  await pool.query(
    `INSERT INTO project_translations (project_id, locale, name, subtitle, body, created_at, updated_at)
     SELECT p.id, l.locale,
       CASE WHEN l.locale = 'es' THEN 'ES ' || initcap(p.slug) ELSE 'EN ' || initcap(p.slug) END,
       CASE WHEN l.locale = 'es' THEN 'Sub ES ' || p.slug ELSE 'Sub EN ' || p.slug END,
       CASE WHEN l.locale = 'es' THEN 'Cuerpo ES ' || p.slug ELSE 'Body EN ' || p.slug END,
       p.created_at, p.updated_at
     FROM projects p CROSS JOIN (VALUES ('es'), ('en')) l(locale)`
  );
  await pool.query(
    `INSERT INTO project_images (project_id, idx, url, caption, created_at, updated_at)
     VALUES ($1, 10, '/gallery/alpha-10.png', '', now(), now()),
            ($1, 2, '/gallery/alpha-2.png', '', now(), now())`,
    [IDS.alpha]
  );
  await pool.query(
    `INSERT INTO project_image_translations (project_id, idx, locale, caption)
     VALUES ($1, 10, 'es', 'Décima ES'), ($1, 10, 'en', 'Tenth EN'),
            ($1, 2, 'es', 'Segunda ES'), ($1, 2, 'en', 'Second EN')`,
    [IDS.alpha]
  );
}
