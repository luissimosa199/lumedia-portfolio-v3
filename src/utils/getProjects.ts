"use server";
import { loadProjects } from "@/lib/projectTypes";

export async function getProjects() {
  const projects = await loadProjects();

  if (!projects) {
    throw new Error("Failed to fetch data");
  }

  return projects;
}
