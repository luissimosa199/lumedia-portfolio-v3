"use client";

import React, { FunctionComponent, useState } from "react";
import ProjectCard from "./ProjectCard";
import ProjectFilters from "./ProjectFilters";
import { Project } from "@/lib/projectModel";

export interface CategoriesCountInterface {
  total: number;
  categories: { category: "frontend" | "backend"; count: number }[];
}

interface ProjectListProps {
  projects: Project[];
  categories: string[];
  categoriesCount: CategoriesCountInterface;
}

const ProjectList: FunctionComponent<ProjectListProps> = ({
  projects,
  categories,
  categoriesCount,
}) => {
  const [filter, setFilter] = useState<string>("all");

  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((project) => project.category === filter);

  console.log("@ProjectListComp>", projects);

  return (
    <div>
      <ProjectFilters
        categories={categories}
        setFilter={setFilter}
        filter={filter}
        categoriesCount={categoriesCount}
      />
      <div className="h-fit">
        {filteredProjects &&
          filteredProjects.length > 0 &&
          filteredProjects.map((e: Project, idx: number) => (
            <ProjectCard
              key={idx}
              name={e.name}
              subtitle={e.subtitle}
              url={e.url}
              slug={e.slug}
              image={e.image}
              tags={e.tags}
            />
          ))}
      </div>
    </div>
  );
};

export default ProjectList;
