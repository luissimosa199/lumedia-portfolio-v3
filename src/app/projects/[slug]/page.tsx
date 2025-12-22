import ProjectDetail from "@/components/ProjectDetail";
import { Project } from "@/lib/projectModel";
import { getProjectData } from "@/utils/getProjectData";
import { notFound } from "next/navigation";
import React from "react";

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug: projectSlug } = await params;
  const response = await getProjectData(projectSlug);

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
      />
    </section>
  );
};

export default Page;
