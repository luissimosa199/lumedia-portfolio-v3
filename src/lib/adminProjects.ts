import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { getPostgresPool } from "@/lib/postgresPool";
import type { ProjectLocale } from "@/lib/projectTypes";

/**
 * Write side of the project catalog, used only by the /admin panel. The
 * public site keeps reading through src/lib/projectTypes.ts; both share the
 * same tables:
 *
 *   projects                    - locale-agnostic fields (slug, urls, tags...)
 *   project_translations        - one row per (project, locale)
 *   project_images              - gallery, ordered by idx
 *   project_image_translations  - one caption row per (project, idx, locale)
 *
 * Every write touches all four tables inside one transaction so a project
 * can never end up half-localized (scripts/check-locale-coverage.mjs
 * asserts exactly that invariant).
 */

import {
  PROJECT_LOCALES,
  type AdminGalleryImage,
  type AdminProject,
  type AdminProjectInput,
  type AdminProjectSummary,
  type LocalizedProjectText,
} from "@/lib/adminProjectTypes";

export * from "@/lib/adminProjectTypes";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isProjectId(value: string): boolean {
  return UUID_PATTERN.test(value);
}

const ORDER_CLAUSE =
  "ORDER BY p.display_order ASC NULLS LAST, p.created_at ASC, p.id ASC";

interface SummaryRow {
  id: string;
  slug: string;
  category: string;
  cover_url: string;
  display_order: number | null;
  name_es: string | null;
  name_en: string | null;
  image_count: number;
  updated_at: Date;
}

export async function listProjectsForAdmin(): Promise<AdminProjectSummary[]> {
  const result = await getPostgresPool().query<SummaryRow>(
    `SELECT p.id, p.slug, p.category, p.cover_url, p.display_order, p.updated_at,
            (SELECT t.name FROM project_translations t
              WHERE t.project_id = p.id AND t.locale = 'es') AS name_es,
            (SELECT t.name FROM project_translations t
              WHERE t.project_id = p.id AND t.locale = 'en') AS name_en,
            (SELECT COUNT(*)::int FROM project_images i
              WHERE i.project_id = p.id) AS image_count
     FROM projects p
     ${ORDER_CLAUSE}`
  );

  return result.rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    category: row.category,
    coverUrl: row.cover_url,
    displayOrder: row.display_order,
    names: { es: row.name_es ?? "", en: row.name_en ?? "" },
    imageCount: row.image_count,
    updatedAt: row.updated_at.toISOString(),
  }));
}

interface ProjectRow {
  id: string;
  slug: string;
  category: string;
  cover_url: string;
  live_url: string | null;
  repo_url: string;
  tags: string[] | null;
  display_order: number | null;
  created_at: Date;
  updated_at: Date;
}

interface TranslationRow {
  locale: ProjectLocale;
  name: string;
  subtitle: string;
  body: string;
}

interface ImageRow {
  idx: number;
  url: string;
  locale: ProjectLocale | null;
  caption: string | null;
}

function emptyText(): LocalizedProjectText {
  return { name: "", subtitle: "", body: "" };
}

export async function getProjectForAdmin(id: string): Promise<AdminProject | null> {
  if (!isProjectId(id)) return null;
  const pool = getPostgresPool();

  const project = await pool.query<ProjectRow>(
    `SELECT id, slug, category, cover_url, live_url, repo_url, tags, display_order,
            created_at, updated_at
     FROM projects WHERE id = $1`,
    [id]
  );
  const row = project.rows[0];
  if (!row) return null;

  const [translations, images] = await Promise.all([
    pool.query<TranslationRow>(
      `SELECT locale, name, subtitle, body FROM project_translations WHERE project_id = $1`,
      [id]
    ),
    pool.query<ImageRow>(
      `SELECT i.idx, i.url, t.locale, t.caption
       FROM project_images i
       LEFT JOIN project_image_translations t
         ON t.project_id = i.project_id AND t.idx = i.idx
       WHERE i.project_id = $1
       ORDER BY i.idx ASC`,
      [id]
    ),
  ]);

  const text: Record<ProjectLocale, LocalizedProjectText> = {
    es: emptyText(),
    en: emptyText(),
  };
  for (const t of translations.rows) {
    if (t.locale in text) {
      text[t.locale] = { name: t.name, subtitle: t.subtitle, body: t.body };
    }
  }

  const galleryByIdx = new Map<number, AdminGalleryImage>();
  for (const image of images.rows) {
    const entry = galleryByIdx.get(image.idx) ?? {
      url: image.url,
      captions: { es: "", en: "" },
    };
    if (image.locale && image.locale in entry.captions) {
      entry.captions[image.locale] = image.caption ?? "";
    }
    galleryByIdx.set(image.idx, entry);
  }

  return {
    id: row.id,
    slug: row.slug,
    category: row.category,
    coverUrl: row.cover_url,
    liveUrl: row.live_url,
    repoUrl: row.repo_url,
    tags: row.tags ?? [],
    displayOrder: row.display_order,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    translations: text,
    gallery: Array.from(galleryByIdx.entries())
      .sort(([a], [b]) => a - b)
      .map(([, image]) => image),
  };
}

export async function listCategories(): Promise<string[]> {
  const result = await getPostgresPool().query<{ category: string }>(
    `SELECT DISTINCT category FROM projects WHERE category IS NOT NULL ORDER BY category ASC`
  );
  return result.rows.map((row) => row.category);
}

export async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const result = await getPostgresPool().query<{ id: string }>(
    `SELECT id FROM projects WHERE slug = $1 AND ($2::uuid IS NULL OR id <> $2::uuid) LIMIT 1`,
    [slug, excludeId ?? null]
  );
  return result.rows.length > 0;
}

async function withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPostgresPool().connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function writeTranslations(
  client: PoolClient,
  projectId: string,
  translations: AdminProjectInput["translations"]
) {
  for (const locale of PROJECT_LOCALES) {
    const text = translations[locale];
    await client.query(
      `INSERT INTO project_translations (project_id, locale, name, subtitle, body, updated_at)
       VALUES ($1, $2, $3, $4, $5, now())
       ON CONFLICT (project_id, locale) DO UPDATE SET
         name = EXCLUDED.name,
         subtitle = EXCLUDED.subtitle,
         body = EXCLUDED.body,
         updated_at = now()`,
      [projectId, locale, text.name, text.subtitle, text.body]
    );
  }
}

/**
 * The gallery is small (a handful of images per project) and idx is its
 * only identity, so it is simply rewritten: delete + reinsert keeps
 * reordering/removal trivial and needs no knowledge of project_images's
 * exact constraints beyond (project_id, idx).
 */
async function writeGallery(
  client: PoolClient,
  projectId: string,
  gallery: AdminGalleryImage[]
) {
  await client.query(`DELETE FROM project_image_translations WHERE project_id = $1`, [
    projectId,
  ]);
  await client.query(`DELETE FROM project_images WHERE project_id = $1`, [projectId]);

  for (let idx = 0; idx < gallery.length; idx += 1) {
    const image = gallery[idx];
    await client.query(
      `INSERT INTO project_images (project_id, idx, url) VALUES ($1, $2, $3)`,
      [projectId, idx, image.url]
    );
    for (const locale of PROJECT_LOCALES) {
      await client.query(
        `INSERT INTO project_image_translations (project_id, idx, locale, caption, updated_at)
         VALUES ($1, $2, $3, $4, now())`,
        [projectId, idx, locale, image.captions[locale] ?? ""]
      );
    }
  }
}

export async function createProject(input: AdminProjectInput): Promise<string> {
  const id = randomUUID();

  await withTransaction(async (client) => {
    let displayOrder = input.displayOrder;
    if (displayOrder === null) {
      const max = await client.query<{ next: number }>(
        `SELECT COALESCE(MAX(display_order), -1) + 1 AS next FROM projects`
      );
      displayOrder = max.rows[0].next;
    }

    await client.query(
      `INSERT INTO projects
         (id, slug, category, cover_url, live_url, repo_url, tags, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7::text[], $8)`,
      [
        id,
        input.slug,
        input.category,
        input.coverUrl,
        input.liveUrl,
        input.repoUrl,
        input.tags,
        displayOrder,
      ]
    );
    await writeTranslations(client, id, input.translations);
    await writeGallery(client, id, input.gallery);
  });

  return id;
}

export async function updateProject(id: string, input: AdminProjectInput): Promise<boolean> {
  if (!isProjectId(id)) return false;

  return withTransaction(async (client) => {
    const updated = await client.query(
      `UPDATE projects SET
         slug = $2,
         category = $3,
         cover_url = $4,
         live_url = $5,
         repo_url = $6,
         tags = $7::text[],
         display_order = $8,
         updated_at = now()
       WHERE id = $1`,
      [
        id,
        input.slug,
        input.category,
        input.coverUrl,
        input.liveUrl,
        input.repoUrl,
        input.tags,
        input.displayOrder,
      ]
    );
    if (updated.rowCount === 0) return false;

    await writeTranslations(client, id, input.translations);
    await writeGallery(client, id, input.gallery);
    return true;
  });
}

export async function deleteProject(id: string): Promise<boolean> {
  if (!isProjectId(id)) return false;

  return withTransaction(async (client) => {
    // project_translations cascades from projects; the image tables are
    // deleted explicitly since project_images's FK behaviour is not known.
    await client.query(`DELETE FROM project_image_translations WHERE project_id = $1`, [id]);
    await client.query(`DELETE FROM project_images WHERE project_id = $1`, [id]);
    await client.query(`DELETE FROM project_translations WHERE project_id = $1`, [id]);
    const deleted = await client.query(`DELETE FROM projects WHERE id = $1`, [id]);
    return (deleted.rowCount ?? 0) > 0;
  });
}

/**
 * Swaps a project with its neighbour in the public ordering and then
 * renumbers display_order 0..n-1 for everyone, so NULL / duplicate orders
 * left over from the original import stop being ambiguous.
 */
export async function moveProject(id: string, direction: "up" | "down"): Promise<boolean> {
  if (!isProjectId(id)) return false;

  return withTransaction(async (client) => {
    const ordered = await client.query<{ id: string }>(
      `SELECT p.id FROM projects p ${ORDER_CLAUSE} FOR UPDATE`
    );
    const ids = ordered.rows.map((row) => row.id);
    const index = ids.indexOf(id);
    if (index === -1) return false;

    const target = direction === "up" ? index - 1 : index + 1;
    if (target >= 0 && target < ids.length) {
      [ids[index], ids[target]] = [ids[target], ids[index]];
    }

    for (let order = 0; order < ids.length; order += 1) {
      await client.query(`UPDATE projects SET display_order = $2 WHERE id = $1`, [
        ids[order],
        order,
      ]);
    }
    return true;
  });
}
