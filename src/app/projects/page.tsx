import ProjectList from "@/components/ProjectList";
import { getProjects } from "@/utils/getProjects";
import { getCategories } from "@/utils/getCategories";
import React from "react";
import { Project } from "@/lib/projectModel";
import { getCategoriesCount } from "@/utils/getCategoriesCount";

const Projects = async () => {
  const data = await getProjects();
  const categories = await getCategories();
  const categoriesCount = await getCategoriesCount();

  return (
    <section className="w-full bg-white dark:bg-violet-950 border-black p-4 rounded-3xl shadow-md mb-4">
      <ProjectList
        projects={data as Project[]}
        categories={categories}
        categoriesCount={categoriesCount}
      />
    </section>
  );
};

export default Projects;
