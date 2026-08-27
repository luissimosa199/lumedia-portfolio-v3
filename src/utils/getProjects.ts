"use server";

import { loadProjects, type ProjectLocale } from "@/lib/projectTypes";

export async function getProjects(locale: ProjectLocale = "es") {
  const projects = await loadProjects(locale);

  if (!projects) {
    throw new Error("Failed to fetch data");
  }

  return projects;
}
