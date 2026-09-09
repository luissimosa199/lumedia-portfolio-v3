"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveProjectAction, type SaveProjectState } from "@/app/admin/actions";
import { PROJECT_LOCALES, type AdminProject } from "@/lib/adminProjectTypes";
import type { ProjectLocale } from "@/lib/projectTypes";
import ImageField from "./ImageField";
import {
  cardClass,
  errorTextClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./styles";

interface ProjectFormProps {
  project?: AdminProject;
  categories: string[];
}

interface GalleryRow {
  key: number;
  url: string;
  captions: Record<ProjectLocale, string>;
}

const LOCALE_NAMES: Record<ProjectLocale, string> = {
  es: "Español",
  en: "English",
};

const initialState: SaveProjectState = {};

type TextField =
  | "slug"
  | "category"
  | "tags"
  | "repoUrl"
  | "liveUrl"
  | "displayOrder"
  | "coverUrl"
  | `name_${ProjectLocale}`
  | `subtitle_${ProjectLocale}`
  | `body_${ProjectLocale}`;

let nextRowKey = 1;
function newRow(image?: AdminProject["gallery"][number]): GalleryRow {
  return {
    key: nextRowKey++,
    url: image?.url ?? "",
    captions: { es: image?.captions.es ?? "", en: image?.captions.en ?? "" },
  };
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p role="alert" className={errorTextClass}>
      {message}
    </p>
  ) : null;
}

/**
 * Create/edit form for one project. All inputs are controlled so React's
 * automatic form reset after a server action never wipes what was typed
 * when validation fails; the server action reads the named fields from
 * FormData (see src/app/admin/projectForm.ts for the names).
 */
const ProjectForm = ({ project, categories }: ProjectFormProps) => {
  const [state, formAction, pending] = useActionState(saveProjectAction, initialState);
  const errors = state.errors ?? {};

  const [fields, setFields] = useState<Record<TextField, string>>(() => ({
    slug: project?.slug ?? "",
    category: project?.category ?? "",
    tags: project?.tags.join(", ") ?? "",
    repoUrl: project?.repoUrl ?? "",
    liveUrl: project?.liveUrl ?? "",
    displayOrder: project?.displayOrder === null || project === undefined
      ? ""
      : String(project.displayOrder),
    coverUrl: project?.coverUrl ?? "",
    name_es: project?.translations.es.name ?? "",
    subtitle_es: project?.translations.es.subtitle ?? "",
    body_es: project?.translations.es.body ?? "",
    name_en: project?.translations.en.name ?? "",
    subtitle_en: project?.translations.en.subtitle ?? "",
    body_en: project?.translations.en.body ?? "",
  }));

  function setField(name: TextField, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
  }

  function bind(name: TextField) {
    return {
      name,
      value: fields[name],
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => setField(name, event.target.value),
    };
  }
  const [gallery, setGallery] = useState<GalleryRow[]>(() =>
    (project?.gallery ?? []).map((image) => newRow(image))
  );

  function updateRow(key: number, patch: Partial<Omit<GalleryRow, "key">>) {
    setGallery((rows) =>
      rows.map((row) =>
        row.key === key
          ? { ...row, ...patch, captions: { ...row.captions, ...patch.captions } }
          : row
      )
    );
  }

  function moveRow(index: number, direction: -1 | 1) {
    setGallery((rows) => {
      const target = index + direction;
      if (target < 0 || target >= rows.length) return rows;
      const next = [...rows];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  const isEdit = Boolean(project);

  return (
    <form action={formAction} className="flex flex-col" noValidate>
      {project ? <input type="hidden" name="id" value={project.id} /> : null}

      <section className={cardClass}>
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <div>
            <h1 className="text-slate-500 text-sm">
              <Link href="/admin" className="md:hover:text-violet-700">
                Projects
              </Link>{" "}
              / {isEdit ? "Edit" : "New"}
            </h1>
            <h2 className="text-2xl font-semibold dark:text-slate-200">
              {isEdit ? project?.translations.es.name || project?.slug : "New project"}
            </h2>
          </div>
          {project ? (
            <Link
              href={`/projects/${project.slug}`}
              className={secondaryButtonClass}
              target="_blank"
              rel="noreferrer"
            >
              View on site
            </Link>
          ) : null}
        </div>

        {state.error ? (
          <p role="alert" className="mb-4 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-200 p-3 text-sm">
            {state.error}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Slug (URL)
            <input
              type="text"
              {...bind("slug")}
              placeholder="my-project"
              className={inputClass}
              aria-invalid={errors.slug ? true : undefined}
            />
            <FieldError message={errors.slug} />
          </label>

          <label className={labelClass}>
            Category
            <input
              type="text"
              list="admin-categories"
              {...bind("category")}
              placeholder="frontend"
              className={inputClass}
              aria-invalid={errors.category ? true : undefined}
            />
            <datalist id="admin-categories">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
            <FieldError message={errors.category} />
          </label>

          <label className={`${labelClass} sm:col-span-2`}>
            Technologies (comma separated, shared by both languages)
            <input
              type="text"
              {...bind("tags")}
              placeholder="Next.js, TypeScript, PostgreSQL"
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            Repository URL
            <input
              type="url"
              {...bind("repoUrl")}
              placeholder="https://github.com/..."
              className={inputClass}
              aria-invalid={errors.repoUrl ? true : undefined}
            />
            <FieldError message={errors.repoUrl} />
          </label>

          <label className={labelClass}>
            Live URL (optional)
            <input
              type="url"
              {...bind("liveUrl")}
              placeholder="https://..."
              className={inputClass}
              aria-invalid={errors.liveUrl ? true : undefined}
            />
            <FieldError message={errors.liveUrl} />
          </label>

          <label className={labelClass}>
            Order (optional, lower first)
            <input
              type="number"
              min={0}
              step={1}
              {...bind("displayOrder")}
              className={inputClass}
              aria-invalid={errors.displayOrder ? true : undefined}
            />
            <FieldError message={errors.displayOrder} />
          </label>

          <div className="sm:col-span-2">
            <ImageField
              name="coverUrl"
              label="Cover image"
              value={fields.coverUrl}
              onChange={(url) => setField("coverUrl", url)}
              error={errors.coverUrl}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 mb-4">
        {PROJECT_LOCALES.map((locale) => (
          <section key={locale} className={`${cardClass} mb-0`}>
            <h3 className="text-slate-500 text-sm mb-3">
              {LOCALE_NAMES[locale]}{" "}
              <span className="uppercase text-xs">({locale})</span>
            </h3>
            <div className="flex flex-col gap-4">
              <label className={labelClass}>
                Name
                <input
                  type="text"
                  {...bind(`name_${locale}`)}
                  className={inputClass}
                  aria-invalid={errors[`name_${locale}`] ? true : undefined}
                />
                <FieldError message={errors[`name_${locale}`]} />
              </label>
              <label className={labelClass}>
                Subtitle
                <input
                  type="text"
                  {...bind(`subtitle_${locale}`)}
                  className={inputClass}
                  aria-invalid={errors[`subtitle_${locale}`] ? true : undefined}
                />
                <FieldError message={errors[`subtitle_${locale}`]} />
              </label>
              <label className={labelClass}>
                Description
                <textarea
                  rows={8}
                  {...bind(`body_${locale}`)}
                  className={inputClass}
                  aria-invalid={errors[`body_${locale}`] ? true : undefined}
                />
                <FieldError message={errors[`body_${locale}`]} />
              </label>
            </div>
          </section>
        ))}
      </div>

      <section className={cardClass}>
        <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
          <h3 className="text-slate-500 text-sm">Gallery</h3>
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() => setGallery((rows) => [...rows, newRow()])}
          >
            Add image
          </button>
        </div>

        {gallery.length === 0 ? (
          <p className="text-sm dark:text-slate-300">No gallery images.</p>
        ) : (
          <ol className="flex flex-col gap-4">
            {gallery.map((row, index) => (
              <li
                key={row.key}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3"
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-slate-500">Image {index + 1}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={secondaryButtonClass}
                      disabled={index === 0}
                      onClick={() => moveRow(index, -1)}
                      aria-label={`Move image ${index + 1} up`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className={secondaryButtonClass}
                      disabled={index === gallery.length - 1}
                      onClick={() => moveRow(index, 1)}
                      aria-label={`Move image ${index + 1} down`}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className={secondaryButtonClass}
                      onClick={() =>
                        setGallery((rows) => rows.filter((r) => r.key !== row.key))
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <ImageField
                  name="gallery_url"
                  label="Image"
                  value={row.url}
                  onChange={(url) => updateRow(row.key, { url })}
                  error={errors[`gallery_${index}`]}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  {PROJECT_LOCALES.map((locale) => (
                    <label key={locale} className={labelClass}>
                      Caption ({locale.toUpperCase()})
                      <input
                        type="text"
                        name={`gallery_caption_${locale}`}
                        value={row.captions[locale]}
                        onChange={(event) =>
                          updateRow(row.key, {
                            captions: { ...row.captions, [locale]: event.target.value },
                          })
                        }
                        className={inputClass}
                      />
                    </label>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3 px-4 pb-8">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Saving..." : isEdit ? "Save changes" : "Create project"}
        </button>
        <Link href="/admin" className={secondaryButtonClass}>
          Cancel
        </Link>
      </div>
    </form>
  );
};

export default ProjectForm;
