import { getPostgresPool } from "@/lib/postgresPool";

export async function getTechStack() {
  const response = await getPostgresPool().query<{ tag: string }>(
    `SELECT DISTINCT tag
     FROM projects
     CROSS JOIN LATERAL unnest(tags) AS tag
     WHERE tag IS NOT NULL
     ORDER BY tag ASC`
  );

  const serializedTags = JSON.stringify(response.rows.map(({ tag }) => tag));

  if (!serializedTags) {
    throw new Error("Failed to fetch tags");
  }

  return serializedTags;
}
