import { loadProjects } from "@/lib/projectTypes";
import { getProjectTranslation, type ProjectLocale } from "@/lib/projectTranslations";

export const getProjectData = async (
  slug: string,
  locale: ProjectLocale = "es"
) => {
  try {
    const [project] = await loadProjects(slug);

    if (!project) {
      return JSON.stringify(null);
    }

    const translation = getProjectTranslation(locale, project.slug);

    return JSON.stringify({
      ...project,
      name: translation.name,
      subtitle: translation.subtitle,
      text: translation.text,
      galleryCaptions: translation.galleryCaptions,
    });
  } catch (error) {
    throw new Error(JSON.stringify(error));
  }
};
