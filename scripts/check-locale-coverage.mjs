// Verifies that every translatable piece of project content has a row
// for BOTH locales directly in Postgres.
//
// Before the project_translations / project_image_translations tables
// (see migrations/0001_create_project_translations.sql), this script
// checked that the next-intl catalogs (src/i18n/messages/{es,en}.json)
// covered every project slug in the database. Now that the catalogs no
// longer carry project content at all - only UI chrome - the equivalent
// check is entirely DB-internal: every `projects` row must have an "es"
// and an "en" row in project_translations, and every `project_images`
// row must have an "es" and an "en" row in project_image_translations.
import assert from "node:assert/strict";
import { Pool } from "pg";

const databaseUrl = process.env.DB_URL ?? process.env.DEV_DATABASE_URL;
assert.ok(databaseUrl, "DB_URL or DEV_DATABASE_URL must be set");

const pool = new Pool({ connectionString: databaseUrl });
const expectedLocales = ["es", "en"];

try {
  const projects = await pool.query(`
    SELECT id, slug FROM projects ORDER BY slug ASC
  `);
  const translations = await pool.query(`
    SELECT project_id, locale, name, subtitle, body FROM project_translations
  `);
  const images = await pool.query(`
    SELECT project_id, idx FROM project_images ORDER BY project_id, idx ASC
  `);
  const imageTranslations = await pool.query(`
    SELECT project_id, idx, locale, caption FROM project_image_translations
  `);

  const translationsByProject = new Map();
  for (const row of translations.rows) {
    const byLocale = translationsByProject.get(row.project_id) ?? new Map();
    byLocale.set(row.locale, row);
    translationsByProject.set(row.project_id, byLocale);
  }

  const imageTranslationsByImage = new Map();
  for (const row of imageTranslations.rows) {
    const key = `${row.project_id}:${row.idx}`;
    const byLocale = imageTranslationsByImage.get(key) ?? new Map();
    byLocale.set(row.locale, row);
    imageTranslationsByImage.set(key, byLocale);
  }

  for (const project of projects.rows) {
    const byLocale = translationsByProject.get(project.id);
    assert.ok(byLocale, `project ${project.slug} has no project_translations rows`);

    for (const locale of expectedLocales) {
      const translation = byLocale.get(locale);
      assert.ok(
        translation,
        `missing ${locale} project_translations row for ${project.slug}`
      );
      for (const field of ["name", "subtitle", "body"]) {
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

  for (const image of images.rows) {
    const key = `${image.project_id}:${image.idx}`;
    const byLocale = imageTranslationsByImage.get(key);
    assert.ok(
      byLocale,
      `project_images row ${key} has no project_image_translations rows`
    );

    for (const locale of expectedLocales) {
      const translation = byLocale.get(locale);
      assert.ok(
        translation,
        `missing ${locale} project_image_translations row for ${key}`
      );
      assert.equal(
        typeof translation.caption,
        "string",
        `${locale} caption for ${key} must be a string`
      );
    }
  }

  console.log(
    `Locale coverage passed (${projects.rows.length} projects, ${images.rows.length} gallery images, ${expectedLocales.length} locales).`
  );
} finally {
  await pool.end();
}
