import enMessages from "@/i18n/messages/en.json";
import esMessages from "@/i18n/messages/es.json";

export type ProjectLocale = "es" | "en";

export interface ProjectTranslation {
  name: string;
  subtitle: string;
  text: string;
  galleryCaptions: string[];
}

type ProjectTranslationCatalog = Record<string, ProjectTranslation>;

export const projectTranslations: Record<
  ProjectLocale,
  ProjectTranslationCatalog
> = {
  es: esMessages.projectContent,
  en: enMessages.projectContent,
};

export function getProjectTranslation(
  locale: ProjectLocale,
  slug: string
): ProjectTranslation {
  const translation = projectTranslations[locale]?.[slug];

  if (!translation) {
    throw new Error(`Missing ${locale} translation for project ${slug}`);
  }

  return translation;
}
