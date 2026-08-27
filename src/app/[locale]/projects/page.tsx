import { setRequestLocale } from "next-intl/server";
import ProjectList from "@/components/ProjectList";
import { getProjects } from "@/utils/getProjects";
import { getCategories } from "@/utils/getCategories";
import { getTechStack } from "@/utils/getTechStack";
import React from "react";
import { getCategoriesCount } from "@/utils/getCategoriesCount";

const Projects = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);

  const data = await getProjects();
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
