"use client";

import React from "react";
import { CategoriesCountInterface } from "./ProjectList";
import { getCategoryIcon } from "@/utils/getCategoryIcon";
import { Project } from "@/lib/projectTypes";

const ProjectFilters = ({
  categories,
  techStack,
  selectedCategory,
  setSelectedCategory,
  selectedTech,
  setSelectedTech,
  categoriesCount,
  projects,
}: {
  categories: string[];
  techStack: string[];
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  selectedTech: string;
  setSelectedTech: React.Dispatch<React.SetStateAction<string>>;
  categoriesCount: CategoriesCountInterface;
  projects: Project[];
}) => {
  const techCount = (tech: string) =>
    projects.filter(
      (project) =>
        (selectedCategory === "all" || project.category === selectedCategory) &&
        project.tags.includes(tech)
    ).length;

  return (
    <div className="flex flex-col gap-4" aria-label="Filtros de proyectos">
      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">Filtrar por categoría</legend>
        <button
          type="button"
          data-filter-category="all"
          aria-pressed={selectedCategory === "all"}
          onClick={() => setSelectedCategory("all")}
          className={`border rounded-full py-2 px-4 text-base flex gap-2 items-center ${
            selectedCategory === "all"
              ? "border-black text-black font-semibold dark:text-white dark:border-white transition-all"
              : "text-slate-500"
          }`}
        >
          <span role="img" aria-label="todas las categorías">🌐</span>
          <span>TODAS LAS CATEGORÍAS</span>
          <span className="text-slate-400">{categoriesCount?.total}</span>
        </button>

        {categories.map((category: string) => {
          const categoryData = categoriesCount.categories.find(
            (c) => c.category === category
          );
          return (
            <button
              key={category}
              type="button"
              data-filter-category={category}
              aria-pressed={selectedCategory === category}
              className={`border rounded-full py-2 px-4 text-base flex gap-2 items-center ${
                selectedCategory === category
                  ? "border-black text-black font-semibold dark:text-white dark:border-white transition-all"
                  : "text-slate-500"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              <span role="img" aria-label={category}>
                {getCategoryIcon(category)}
              </span>
              <span className="uppercase">{category}</span>
              <span className="text-slate-400">{categoryData?.count ?? 0}</span>
            </button>
          );
        })}
      </fieldset>

      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">Filtrar por tecnología</legend>
        <button
          type="button"
          data-filter-tech="all"
          aria-pressed={selectedTech === "all"}
          onClick={() => setSelectedTech("all")}
          className={`border rounded-full py-2 px-4 text-base flex gap-2 items-center ${
            selectedTech === "all"
              ? "border-black text-black font-semibold dark:text-white dark:border-white transition-all"
              : "text-slate-500"
          }`}
        >
          <span>TODAS LAS TECNOLOGÍAS</span>
          <span className="text-slate-400">
            {projects.filter(
              (project) =>
                selectedCategory === "all" ||
                project.category === selectedCategory
            ).length}
          </span>
        </button>

        {techStack.map((tech: string) => (
          <button
            key={tech}
            type="button"
            data-filter-tech={tech}
            aria-pressed={selectedTech === tech}
            onClick={() => setSelectedTech(tech)}
            className={`border rounded-full py-2 px-4 text-base flex gap-2 items-center ${
              selectedTech === tech
                ? "border-black text-black font-semibold dark:text-white dark:border-white transition-all"
                : "text-slate-500"
            }`}
          >
            <span>{tech}</span>
            <span className="text-slate-400">{techCount(tech)}</span>
          </button>
        ))}
      </fieldset>
    </div>
  );
};

export default ProjectFilters;
