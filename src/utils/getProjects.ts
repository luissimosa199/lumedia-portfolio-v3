"use server";

import {
  getProjectTranslation,
  type ProjectLocale,
} from "@/lib/projectTranslations";
import { loadProjects } from "@/lib/projectTypes";

export async function getProjects(locale: ProjectLocale = "es") {
  const projects = await loadProjects();

  if (!projects) {
    throw new Error("Failed to fetch data");
  }

  return projects.map((project) => {
    const translation = getProjectTranslation(locale, project.slug);

    return {
      ...project,
      name: translation.name,
      subtitle: translation.subtitle,
      text: translation.text,
      galleryCaptions: translation.galleryCaptions,
    };
  });
}
