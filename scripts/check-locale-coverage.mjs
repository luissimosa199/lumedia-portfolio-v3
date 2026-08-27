import assert from "node:assert/strict";
import { Pool } from "pg";
import {
  projectTranslations,
} from "../src/lib/projectTranslations.ts";

const databaseUrl = process.env.DB_URL ?? process.env.DEV_DATABASE_URL;
assert.ok(databaseUrl, "DB_URL or DEV_DATABASE_URL must be set");

const pool = new Pool({ connectionString: databaseUrl });

try {
  const projects = await pool.query(`
    SELECT slug, name, subtitle, body, category, cover_url, live_url, repo_url, tags
    FROM projects
    ORDER BY display_order ASC NULLS LAST, created_at ASC, id ASC
  `);
  const images = await pool.query(`
    SELECT projects.slug, project_images.idx, project_images.caption
    FROM projects
    JOIN project_images ON project_images.project_id = projects.id
    WHERE project_images.caption IS NOT NULL
    ORDER BY projects.slug ASC, project_images.idx ASC
  `);

  const slugs = projects.rows.map(({ slug }) => slug);
  const expectedLocales = ["es", "en"];

  for (const locale of expectedLocales) {
    const catalog = projectTranslations[locale];
    assert.ok(catalog, `missing project translation locale: ${locale}`);
    assert.deepEqual(
      Object.keys(catalog).sort(),
      [...slugs].sort(),
      `${locale} project translations must match database slugs`
    );

    for (const project of projects.rows) {
      const translation = catalog[project.slug];
      assert.ok(translation, `missing ${locale} translation for ${project.slug}`);
      for (const field of ["name", "subtitle", "text"]) {
        assert.equal(
          typeof translation[field],
          "string",
          `${locale}.${project.slug}.${field} must be a string`
        );
        assert.ok(
          translation[field].trim().length > 0,
          `${locale}.${project.slug}.${field} must not be empty`
        );
      }
    }
  }

  const captionsBySlug = new Map();
  for (const image of images.rows) {
    const captions = captionsBySlug.get(image.slug) ?? [];
    captions.push(image);
    captionsBySlug.set(image.slug, captions);
  }

  for (const locale of expectedLocales) {
    for (const [slug, imagesForProject] of captionsBySlug) {
      const captions = projectTranslations[locale][slug].galleryCaptions;
      assert.ok(
        Array.isArray(captions),
        `${locale}.${slug}.galleryCaptions must be an array`
      );
      for (const image of imagesForProject) {
        assert.ok(
          Object.prototype.hasOwnProperty.call(captions, image.idx),
          `missing ${locale}.${slug} gallery caption ${image.idx}`
        );
      }
    }
  }

  console.log(
    `Locale coverage passed (${projects.rows.length} projects, ${images.rows.length} non-null gallery captions, ${expectedLocales.length} locales).`
  );
} finally {
  await pool.end();
}
