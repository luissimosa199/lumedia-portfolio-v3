import ProjectDetail from "@/components/ProjectDetail";
import { Project } from "@/lib/projectModel";
import { getProjectData } from "@/utils/getProjectData";
import React from "react";

const Page = async ({ params }: { params: { slug: string } }) => {
  const response = await getProjectData(params.slug);

  const data = JSON.parse(response) as Project;

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
    <section className="w-full bg-white dark:bg-violet-950 border-black p-12 rounded-3xl shadow-md mb-4">
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
