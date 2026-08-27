-- Per-locale storage for project content that used to be overwritten at
-- read time by the next-intl catalog overlays (see src/lib/projectTranslations.ts,
-- now removed). Both "es" and "en" become rows in these tables so an
-- admin panel can edit either locale the same way (same table, same
-- columns, no base-column special case for Spanish).
--
-- `projects.name`, `projects.subtitle`, `projects.body`, and
-- `project_images.caption` are intentionally left in place (not dropped)
-- so this migration has no destructive step; they are no longer read by
-- the application after this change ships. See migrations/0002 for how
-- they seed the "es" rows below, and the PR description for the
-- follow-up to drop them once the admin panel has been writing to the
-- translation tables for a while.

CREATE TABLE IF NOT EXISTS project_translations (
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  locale text NOT NULL CHECK (locale IN ('es', 'en')),
  name text NOT NULL,
  subtitle text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, locale)
);

CREATE TABLE IF NOT EXISTS project_image_translations (
  project_id uuid NOT NULL,
  idx integer NOT NULL,
  locale text NOT NULL CHECK (locale IN ('es', 'en')),
  caption text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, idx, locale)
);

-- Deliberately no FK from project_image_translations(project_id, idx) to
-- project_images(project_id, idx): the existing project_images table's
-- exact uniqueness constraints weren't visible to this migration's
-- author (no read access to the dev database at authoring time), so the
-- relationship is enforced at the application/query level (JOIN on
-- project_id + idx) instead of a composite FK. Revisit once
-- project_images's constraints are confirmed.

CREATE INDEX IF NOT EXISTS project_image_translations_project_id_idx
  ON project_image_translations (project_id);
