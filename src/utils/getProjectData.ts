import { loadProjects, type ProjectLocale } from "@/lib/projectTypes";

export const getProjectData = async (
  slug: string,
  locale: ProjectLocale = "es"
) => {
  try {
    const [project] = await loadProjects(locale, slug);

    if (!project) {
      return JSON.stringify(null);
    }

    return JSON.stringify(project);
  } catch (error) {
    throw new Error(JSON.stringify(error));
  }
};
