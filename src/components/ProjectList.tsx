"use client";

import React, { FunctionComponent, useState } from "react";
import { useTranslations } from "next-intl";
import ProjectCard from "./ProjectCard";
import ProjectFilters from "./ProjectFilters";
import { Project } from "@/lib/projectTypes";

export interface CategoriesCountInterface {
  total: number;
  categories: { category: string; count: number }[];
}

interface ProjectListProps {
  projects: Project[];
  categories: string[];
  categoriesCount: CategoriesCountInterface;
  techStack: string[];
}

const ProjectList: FunctionComponent<ProjectListProps> = ({
  projects,
  categories,
  categoriesCount,
  techStack,
}) => {
  const t = useTranslations("projects");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [techFilter, setTechFilter] = useState<string>("all");

  const filteredProjects = projects.filter(
    (project) =>
      (categoryFilter === "all" || project.category === categoryFilter) &&
      (techFilter === "all" || project.tags.includes(techFilter))
  );

  return (
    <div>
      <ProjectFilters
        categories={categories}
        techStack={techStack}
        selectedCategory={categoryFilter}
        setSelectedCategory={setCategoryFilter}
        selectedTech={techFilter}
        setSelectedTech={setTechFilter}
        categoriesCount={categoriesCount}
        projects={projects}
      />
      <div
        className="h-fit"
        aria-live="polite"
        data-testid="project-result-count"
        data-count={filteredProjects.length}
      >
        <span className="sr-only">
          {t("resultCount", { count: filteredProjects.length })}
        </span>
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
              category={e.category}
            />
          ))}
      </div>
    </div>
  );
};

export default ProjectList;
