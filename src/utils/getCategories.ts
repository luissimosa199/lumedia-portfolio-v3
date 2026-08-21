"use server";
import { getPostgresPool } from "@/lib/postgresPool";

export async function getCategories() {
  const response = await getPostgresPool().query<{ category: string }>(
    `SELECT DISTINCT category
     FROM projects
     WHERE category IS NOT NULL
     ORDER BY category ASC`
  );

  if (!response.rows) {
    throw new Error("Failed to fetch data");
  }

  return response.rows.map(({ category }) => category);
}
