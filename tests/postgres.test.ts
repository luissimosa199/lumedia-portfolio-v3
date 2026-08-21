import assert from "node:assert/strict";
import { getPostgresPool } from "../src/lib/postgresPool";
import { getCategories } from "../src/utils/getCategories";
import { getProjectData } from "../src/utils/getProjectData";
import { getProjects } from "../src/utils/getProjects";
import { getTechStack } from "../src/utils/getTechStack";

async function main() {
  const pool = getPostgresPool();
  const source = await pool.query<{
    id: string;
    legacy_id: string | null;
    slug: string;
    name: string;
    subtitle: string;
    body: string;
    category: string;
    cover_url: string;
    live_url: string;
    repo_url: string;
    tags: string[] | null;
  }>(
    `SELECT id, legacy_id, slug, name, subtitle, body, category, cover_url,
            live_url, repo_url, tags
     FROM projects
     ORDER BY display_order ASC NULLS LAST, created_at ASC, id ASC`
  );

  assert.ok(source.rows.length > 0, "the PostgreSQL project fixture is present");

  const projects = await getProjects();
  assert.equal(projects.length, source.rows.length);

  const firstSource = source.rows[0];
  const firstProject = projects.find(
    (project) => project.slug === firstSource.slug
  );
  assert.ok(firstProject);
  assert.equal(firstProject._id, firstSource.legacy_id ?? firstSource.id);
  assert.equal(firstProject.text, firstSource.body);
  assert.equal(firstProject.image, firstSource.cover_url);
  assert.equal(firstProject.url, firstSource.live_url || firstSource.repo_url);
  assert.equal(firstProject.repo, firstSource.repo_url);
  assert.deepEqual(firstProject.tags, firstSource.tags ?? []);

  const imageSource = await pool.query<{ url: string }>(
    `SELECT url
     FROM project_images
     WHERE project_id = $1
     ORDER BY idx ASC`,
    [firstSource.id]
  );
  assert.deepEqual(firstProject.gallery, imageSource.rows.map(({ url }) => url));

  const projectData = JSON.parse(await getProjectData(firstSource.slug));
  assert.deepEqual(projectData, firstProject);

  const categorySource = await pool.query<{ category: string }>(
    `SELECT DISTINCT category
     FROM projects
     WHERE category IS NOT NULL
     ORDER BY category ASC`
  );
  assert.deepEqual(await getCategories(), categorySource.rows.map(({ category }) => category));

  const tagSource = await pool.query<{ tag: string }>(
    `SELECT DISTINCT tag
     FROM projects
     CROSS JOIN LATERAL unnest(tags) AS tag
     WHERE tag IS NOT NULL
     ORDER BY tag ASC`
  );
  assert.deepEqual(
    JSON.parse(await getTechStack()),
    tagSource.rows.map(({ tag }) => tag)
  );

  console.log(
    `PostgreSQL project data tests passed (${projects.length} projects, ${categorySource.rows.length} categories, ${tagSource.rows.length} tags).`
  );
  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  await getPostgresPool().end();
  process.exitCode = 1;
});
