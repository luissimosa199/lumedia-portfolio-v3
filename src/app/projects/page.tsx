import ProjectList from "@/components/ProjectList";
import { getProjects } from "@/utils/getProjects";
import { getCategories } from "@/utils/getCategories";
import React from "react";
import { Project } from "@/lib/projectModel";
import { getCategoriesCount } from "@/utils/getCategoriesCount";
import { getDbLogs } from "@/utils/getDbLogs";
import Logger from "@/components/Logger";

const Projects = async () => {
  const data = await getProjects();
  const categories = await getCategories();
  const categoriesCount = await getCategoriesCount();
  const dberror = await getDbLogs();

  return (
    <section className="w-full bg-white dark:bg-violet-950 border-black p-4 rounded-3xl shadow-md mb-4">
      <ProjectList
        projects={data as Project[]}
        categories={categories}
        categoriesCount={categoriesCount}
      />
      <Logger message={dberror} />
    </section>
  );
};

export default Projects;
