import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import ProjectDetail from "@/components/ProjectDetail";
import { Project } from "@/lib/projectTypes";
import { getProjectData } from "@/utils/getProjectData";
import { notFound } from "next/navigation";
import React from "react";
import { buildAlternates, type SiteLocale } from "@/lib/alternates";
import type { ProjectLocale } from "@/lib/projectTranslations";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const response = await getProjectData(slug, locale as ProjectLocale);
  const data = JSON.parse(response) as Project | null;

  return {
    title: data?.name,
    description: data?.subtitle,
    alternates: buildAlternates(locale as SiteLocale, `/projects/${slug}`),
  };
}

const Page = async ({ params }: PageProps) => {
  const { locale, slug: projectSlug } = await params;
  setRequestLocale(locale);

  const response = await getProjectData(projectSlug, locale as ProjectLocale);

  const data = JSON.parse(response) as Project | null;

  if (!data) {
    notFound();
  }

  const {
    name,
    subtitle,
    image,
    url,
    slug,
    tags,
    text,
    category,
    repo,
    gallery,
    galleryCaptions,
  } = data;

  return (
    <section className="w-full bg-white dark:bg-violet-950 border-black p-2 sm:p-12 rounded-3xl shadow-md mb-4">
      <ProjectDetail
        name={name}
        subtitle={subtitle}
        image={image}
        url={url}
        slug={slug}
        tags={tags}
        text={text}
        category={category}
        repo={repo}
        gallery={gallery}
        galleryCaptions={galleryCaptions}
      />
    </section>
  );
};

export default Page;
