"use server";
import { getPostgresPool } from "@/lib/postgresPool";
import { CategoriesCount } from "@/lib/projectTypes";

export async function getCategoriesCount() {
  const response = await getPostgresPool().query<{
    category: string;
    count: number;
  }>(
    `SELECT category, COUNT(*)::int AS count
     FROM projects
     WHERE category IS NOT NULL
     GROUP BY category
     ORDER BY category ASC`
  );

  if (!response.rows) {
    throw new Error("Failed to fetch data");
  }

  const categories = response.rows.map(({ category, count }) => ({
    category,
    count,
  }));

  return {
    total: categories.reduce((total, item) => total + item.count, 0),
    categories,
  } satisfies CategoriesCount;
}
