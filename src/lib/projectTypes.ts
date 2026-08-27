import { getPostgresPool } from "@/lib/postgresPool";

export type ProjectLocale = "es" | "en";

export interface PostgresProjectRow {
  id: string;
  legacy_id: string | null;
  slug: string;
  category: string;
  cover_url: string;
  live_url: string | null;
  repo_url: string;
  tags: string[] | null;
  display_order: number | null;
  created_at: Date;
  updated_at: Date;
  name: string;
  subtitle: string;
  body: string;
}

export interface PostgresProjectImageRow {
  project_id: string;
  idx: number;
  url: string;
  caption: string;
}

export interface Project {
  _id: string;
  name: string;
  subtitle: string;
  category: string;
  text: string;
  image: string;
  gallery: string[];
  galleryCaptions?: string[];
  slug: string;
  url: string;
  repo: string;
  tags: string[];
}

export interface CategoriesCount {
  total: number;
  categories: { category: string; count: number }[];
}

// `tags` (and `category`) are intentionally NOT locale-scoped: they are
// technology/category names (e.g. "Next.js", "web") that next-intl's
// catalogs never translated even before this change - see
// src/i18n/messages/{es,en}.json's (now-removed) projectContent overlay,
// which only ever carried name/subtitle/text/galleryCaptions. Project
// filtering (ProjectFilters.tsx) also depends on tags being identical
// strings across locales.
const projectColumns = `
  p.id,
  p.legacy_id,
  p.slug,
  p.category,
  p.cover_url,
  p.live_url,
  p.repo_url,
  p.tags,
  p.display_order,
  p.created_at,
  p.updated_at,
  t.name,
  t.subtitle,
  t.body
`;

export async function loadProjects(
  locale: ProjectLocale,
  slug?: string
): Promise<Project[]> {
  const pool = getPostgresPool();
  const values: unknown[] = [locale];
  const whereClause = slug === undefined ? "" : "AND p.slug = $2";
  if (slug !== undefined) {
    values.push(slug);
  }
  const orderClause =
    slug === undefined
      ? "ORDER BY p.display_order ASC NULLS LAST, p.created_at ASC, p.id ASC"
      : "";

  const projects = await pool.query<PostgresProjectRow>(
    `SELECT ${projectColumns}
     FROM projects p
     JOIN project_translations t ON t.project_id = p.id AND t.locale = $1
     ${whereClause}
     ${orderClause}`,
    values
  );

  if (projects.rows.length === 0) {
    return [];
  }

  const projectIds = projects.rows.map((project) => project.id);
  const images = await pool.query<PostgresProjectImageRow>(
    `SELECT pi.project_id, pi.idx, pi.url, it.caption
     FROM project_images pi
     JOIN project_image_translations it
       ON it.project_id = pi.project_id AND it.idx = pi.idx AND it.locale = $1
     WHERE pi.project_id = ANY($2::uuid[])
     ORDER BY pi.project_id, pi.idx ASC`,
    [locale, projectIds]
  );

  const galleryByProject = new Map<string, PostgresProjectImageRow[]>();
  for (const image of images.rows) {
    const gallery = galleryByProject.get(image.project_id) ?? [];
    gallery.push(image);
    galleryByProject.set(image.project_id, gallery);
  }

  return projects.rows.map((project) => mapProject(project, galleryByProject));
}

function mapProject(
  project: PostgresProjectRow,
  galleryByProject: Map<string, PostgresProjectImageRow[]>
): Project {
  const gallery = galleryByProject.get(project.id) ?? [];

  return {
    _id: project.legacy_id ?? project.id,
    name: project.name,
    subtitle: project.subtitle,
    category: project.category,
    text: project.body,
    image: project.cover_url,
    gallery: gallery.map(({ url }) => url),
    galleryCaptions: gallery.map(({ caption }) => caption),
    slug: project.slug,
    url: project.live_url || project.repo_url,
    repo: project.repo_url,
    tags: project.tags ?? [],
  };
}
