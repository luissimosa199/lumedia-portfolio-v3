import { notFound } from "next/navigation";
import { getProjectForAdmin, listCategories } from "@/lib/adminProjects";
import ProjectForm from "@/components/admin/ProjectForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  const [project, categories] = await Promise.all([
    getProjectForAdmin(id),
    listCategories(),
  ]);

  if (!project) {
    notFound();
  }

  return <ProjectForm project={project} categories={categories} />;
}
