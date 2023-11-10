"use client";

import React from "react";
import { CategoriesCountInterface } from "./ProjectList";
import { getCategoryIcon } from "@/utils/getCategoryIcon";

const ProjectFilters = ({
  categories,
  setFilter,
  filter,
  categoriesCount,
}: {
  categories: string[];
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  filter: string;
  categoriesCount: CategoriesCountInterface;
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => {
          setFilter("all");
        }}
        className={`border rounded-full py-2 px-4 text-base flex gap-2 items-center ${
          filter === "all"
            ? "border-black text-black font-semibold"
            : "text-slate-500"
        }`}
      >
        <div className="w-4 h-4 flex justify-center items-center">
          <span
            role="img"
            aria-label="all"
          >
            🌐
          </span>
        </div>
        <span>TODOS</span>
        <span className="text-slate-400">{categoriesCount?.total}</span>
      </button>

      {categories &&
        categories.length > 0 &&
        categories.map((category: string, idx: number) => (
          <button
            key={category}
            className={`border rounded-full py-2 px-4 text-base flex gap-2 items-center ${
              filter === category
                ? "border-black text-black font-semibold"
                : "text-slate-500"
            }`}
            onClick={() => {
              setFilter(category);
            }}
          >
            <div className="w-4 h-4 flex justify-center items-center">
              <span
                role="img"
                aria-label="backend"
              >
                {getCategoryIcon(category)}
              </span>
            </div>
            <span className="uppercase">{category}</span>
            <span className="text-slate-400">
              {categoriesCount.categories[idx].count}
            </span>
          </button>
        ))}
    </div>
  );
};

export default ProjectFilters;
