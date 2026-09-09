import type { ProjectLocale } from "@/lib/projectTypes";
import {
  PROJECT_LOCALES,
  type AdminGalleryImage,
  type AdminProjectInput,
} from "@/lib/adminProjectTypes";
import { isAllowedImageUrl } from "@/lib/imageUrls";

/**
 * FormData -> AdminProjectInput, with validation. Shared by the create and
 * edit actions. Field names match src/components/admin/ProjectForm.tsx.
 *
 * Gallery rows arrive as parallel `gallery_url[]` / `gallery_caption_es[]` /
 * `gallery_caption_en[]` lists (FormData.getAll keeps empty strings, so the
 * lists stay aligned by index).
 */

export type ProjectFieldErrors = Partial<Record<string, string>>;

export interface ParsedProjectForm {
  input: AdminProjectInput;
  errors: ProjectFieldErrors;
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 80;

function text(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function textList(formData: FormData, field: string): string[] {
  return formData
    .getAll(field)
    .map((value) => (typeof value === "string" ? value.trim() : ""));
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const part of raw.split(/[,\n]/)) {
    const tag = part.trim();
    const key = tag.toLowerCase();
    if (tag && !seen.has(key)) {
      seen.add(key);
      tags.push(tag);
    }
  }
  return tags;
}

export function parseProjectForm(formData: FormData): ParsedProjectForm {
  const errors: ProjectFieldErrors = {};

  const slug = text(formData, "slug").toLowerCase();
  if (!slug) {
    errors.slug = "Slug is required.";
  } else if (!SLUG_PATTERN.test(slug) || slug.length > MAX_SLUG_LENGTH) {
    errors.slug = "Use lowercase letters, numbers and single hyphens (e.g. my-project).";
  }

  const category = text(formData, "category").toLowerCase();
  if (!category) errors.category = "Category is required.";

  const coverUrl = text(formData, "coverUrl");
  if (!coverUrl) {
    errors.coverUrl = "Cover image is required.";
  } else if (!isAllowedImageUrl(coverUrl)) {
    errors.coverUrl = "Cover must be an https://res.cloudinary.com URL or a /public path.";
  }

  const repoUrl = text(formData, "repoUrl");
  if (!repoUrl) {
    errors.repoUrl = "Repository URL is required.";
  } else if (!isHttpUrl(repoUrl)) {
    errors.repoUrl = "Enter a valid http(s) URL.";
  }

  const liveUrlRaw = text(formData, "liveUrl");
  if (liveUrlRaw && !isHttpUrl(liveUrlRaw)) {
    errors.liveUrl = "Enter a valid http(s) URL, or leave it empty.";
  }

  const displayOrderRaw = text(formData, "displayOrder");
  let displayOrder: number | null = null;
  if (displayOrderRaw) {
    const parsed = Number(displayOrderRaw);
    if (!Number.isInteger(parsed) || parsed < 0) {
      errors.displayOrder = "Order must be a whole number (0 or more), or empty.";
    } else {
      displayOrder = parsed;
    }
  }

  const translations = {} as AdminProjectInput["translations"];
  for (const locale of PROJECT_LOCALES) {
    const name = text(formData, `name_${locale}`);
    const subtitle = text(formData, `subtitle_${locale}`);
    const body = text(formData, `body_${locale}`);
    if (!name) errors[`name_${locale}`] = `Name (${locale.toUpperCase()}) is required.`;
    if (!subtitle) errors[`subtitle_${locale}`] = `Subtitle (${locale.toUpperCase()}) is required.`;
    if (!body) errors[`body_${locale}`] = `Description (${locale.toUpperCase()}) is required.`;
    translations[locale] = { name, subtitle, body };
  }

  const urls = textList(formData, "gallery_url");
  const captions: Record<ProjectLocale, string[]> = {
    es: textList(formData, "gallery_caption_es"),
    en: textList(formData, "gallery_caption_en"),
  };
  const gallery: AdminGalleryImage[] = [];
  urls.forEach((url, index) => {
    const image: AdminGalleryImage = {
      url,
      captions: { es: captions.es[index] ?? "", en: captions.en[index] ?? "" },
    };
    const isBlank = !url && !image.captions.es && !image.captions.en;
    if (isBlank) return;
    if (!url) {
      errors[`gallery_${index}`] = "This gallery row has captions but no image.";
    } else if (!isAllowedImageUrl(url)) {
      errors[`gallery_${index}`] =
        "Gallery images must be https://res.cloudinary.com URLs or /public paths.";
    }
    gallery.push(image);
  });

  return {
    input: {
      slug,
      category,
      coverUrl,
      liveUrl: liveUrlRaw || null,
      repoUrl,
      tags: parseTags(text(formData, "tags")),
      displayOrder,
      translations,
      gallery,
    },
    errors,
  };
}
