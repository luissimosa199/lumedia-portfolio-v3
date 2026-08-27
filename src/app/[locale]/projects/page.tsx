import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ProjectList from "@/components/ProjectList";
import { getProjects } from "@/utils/getProjects";
import { getCategories } from "@/utils/getCategories";
import { getTechStack } from "@/utils/getTechStack";
import React from "react";
import { getCategoriesCount } from "@/utils/getCategoriesCount";
import { buildAlternates, type SiteLocale } from "@/lib/alternates";
import type { ProjectLocale } from "@/lib/projectTypes";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });

  return {
    title: t("title"),
    alternates: buildAlternates(locale as SiteLocale, "/projects"),
  };
}

const Projects = async ({ params }: PageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);

  const data = await getProjects(locale as ProjectLocale);
  const categories = await getCategories();
  const categoriesCount = await getCategoriesCount();
  const techStack = JSON.parse(await getTechStack()) as string[];

  return (
    <section className="w-full bg-white dark:bg-violet-950 border-black p-4 rounded-3xl shadow-md mb-4">
      <ProjectList
        projects={data}
        categories={categories}
        categoriesCount={categoriesCount}
        techStack={techStack}
      />
    </section>
  );
};

export default Projects;
