import type { ProjectLocale } from "@/lib/projectTypes";

/**
 * Types shared between the admin server code (src/lib/adminProjects.ts) and
 * the client-side form. Deliberately free of any Node/pg import so it can be
 * bundled for the browser.
 */

export const PROJECT_LOCALES = ["es", "en"] as const satisfies readonly ProjectLocale[];

export interface LocalizedProjectText {
  name: string;
  subtitle: string;
  body: string;
}

export interface AdminGalleryImage {
  url: string;
  captions: Record<ProjectLocale, string>;
}

export interface AdminProjectInput {
  slug: string;
  category: string;
  coverUrl: string;
  liveUrl: string | null;
  repoUrl: string;
  tags: string[];
  displayOrder: number | null;
  translations: Record<ProjectLocale, LocalizedProjectText>;
  gallery: AdminGalleryImage[];
}

export interface AdminProject extends AdminProjectInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProjectSummary {
  id: string;
  slug: string;
  category: string;
  coverUrl: string;
  displayOrder: number | null;
  names: Record<ProjectLocale, string>;
  imageCount: number;
  updatedAt: string;
}
