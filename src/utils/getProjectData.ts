import { loadProjects } from "@/lib/projectTypes";

export const getProjectData = async (slug: string) => {
  try {
    const [project] = await loadProjects(slug);
    return JSON.stringify(project ?? null);
  } catch (error) {
    throw new Error(JSON.stringify(error));
  }
};
