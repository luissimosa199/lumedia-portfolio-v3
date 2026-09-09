-- Prerequisites for the /admin panel (src/lib/adminProjects.ts), which is the
-- first thing in this codebase that INSERTs into `projects` / `project_images`
-- (those tables were created out-of-band during the Mongo -> Postgres
-- migration and their exact defaults/constraints were never committed).
--
-- Everything here is guarded so it is a no-op on a schema that already has
-- it, and safe to re-run:
--
--   * id / created_at / updated_at columns get a default if they have none
--     (the panel generates project ids itself, but not image ids, and never
--     writes timestamps explicitly on insert).
--   * The legacy single-locale content columns (projects.name/subtitle/body,
--     project_images.caption - superseded by the *_translations tables in
--     0001/0002 and slated to be dropped) default to '' so they never block
--     an insert. The panel does not read or write them, so dropping them
--     later needs no application change.
--   * slug and (project_id, idx) become unique, which the panel relies on
--     for routing and for the per-project gallery rewrite.

DO $$
DECLARE
  spec record;
BEGIN
  FOR spec IN
    SELECT *
    FROM (VALUES
      ('projects',       'id',         'uuid',      'gen_random_uuid()'),
      ('project_images', 'id',         'uuid',      'gen_random_uuid()'),
      ('projects',       'created_at', 'timestamp', 'now()'),
      ('projects',       'updated_at', 'timestamp', 'now()'),
      ('project_images', 'created_at', 'timestamp', 'now()'),
      ('project_images', 'updated_at', 'timestamp', 'now()'),
      ('projects',       'name',       NULL,        ''''''),
      ('projects',       'subtitle',   NULL,        ''''''),
      ('projects',       'body',       NULL,        ''''''),
      ('project_images', 'caption',    NULL,        '''''')
    ) AS v(table_name, column_name, type_prefix, default_expr)
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns c
      WHERE c.table_schema = current_schema()
        AND c.table_name = spec.table_name
        AND c.column_name = spec.column_name
        AND (spec.type_prefix IS NULL OR c.data_type LIKE spec.type_prefix || '%')
        AND c.column_default IS NULL
    ) THEN
      EXECUTE format(
        'ALTER TABLE %I ALTER COLUMN %I SET DEFAULT %s',
        spec.table_name,
        spec.column_name,
        spec.default_expr
      );
    END IF;
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_unique
  ON projects (slug);

CREATE UNIQUE INDEX IF NOT EXISTS project_images_project_id_idx_unique
  ON project_images (project_id, idx);
