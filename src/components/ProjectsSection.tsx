import React from "react";
import ProjectCard from "./ProjectCard";
import Button from "./Button";
import { getProjects } from "@/utils/getProjects";

const ProjectsSection = async () => {
  const data = await getProjects();

  return (
    <section className="w-full bg-white dark:bg-violet-950 border-black px-6 pt-6 pb-4 rounded-3xl shadow-md mb-4">
      <div className="flex justify-between">
        <div>
          <h2 className="text-slate-500 text-sm">Proyectos</h2>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {data &&
          data.length > 0 &&
          data.map((e: any, idx) => (
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
      <Button
        href="/projects"
        text="Ver todos"
      />
    </section>
  );
};

export default ProjectsSection;

export const revalidate = 3600;
