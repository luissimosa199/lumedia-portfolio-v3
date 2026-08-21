import { getPostgresPool } from "@/lib/postgresPool";

export interface PostgresProjectRow {
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
  display_order: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface PostgresProjectImageRow {
  project_id: string;
  idx: number;
  url: string;
  caption: string | null;
}

export interface Project {
  _id: string;
  name: string;
  subtitle: string;
  category: string;
  text: string;
  image: string;
  gallery: string[];
  slug: string;
  url: string;
  repo: string;
  tags: string[];
}

export interface CategoriesCount {
  total: number;
  categories: { category: string; count: number }[];
}

const projectColumns = `
  id,
  legacy_id,
  slug,
  name,
  subtitle,
  body,
  category,
  cover_url,
  live_url,
  repo_url,
  tags,
  display_order,
  created_at,
  updated_at
`;

export async function loadProjects(slug?: string) {
  const pool = getPostgresPool();
  const values = slug === undefined ? [] : [slug];
  const whereClause = slug === undefined ? "" : "WHERE slug = $1";
  const orderClause =
    slug === undefined
      ? "ORDER BY display_order ASC NULLS LAST, created_at ASC, id ASC"
      : "";

  const projects = await pool.query<PostgresProjectRow>(
    `SELECT ${projectColumns} FROM projects ${whereClause} ${orderClause}`,
    values
  );

  if (projects.rows.length === 0) {
    return [];
  }

  const projectIds = projects.rows.map((project) => project.id);
  const images = await pool.query<PostgresProjectImageRow>(
    `SELECT project_id, idx, url, caption
     FROM project_images
     WHERE project_id = ANY($1::uuid[])
     ORDER BY project_id, idx ASC`,
    [projectIds]
  );

  const galleryByProject = new Map<string, string[]>();
  for (const image of images.rows) {
    const gallery = galleryByProject.get(image.project_id) ?? [];
    gallery.push(image.url);
    galleryByProject.set(image.project_id, gallery);
  }

  return projects.rows.map((project) => mapProject(project, galleryByProject));
}

function mapProject(
  project: PostgresProjectRow,
  galleryByProject: Map<string, string[]>
): Project {
  return {
    _id: project.legacy_id ?? project.id,
    name: project.name,
    subtitle: project.subtitle,
    category: project.category,
    text: project.body,
    image: project.cover_url,
    gallery: galleryByProject.get(project.id) ?? [],
    slug: project.slug,
    url: project.live_url || project.repo_url,
    repo: project.repo_url,
    tags: project.tags ?? [],
  };
}
