import { listCategories } from "@/lib/adminProjects";
import ProjectForm from "@/components/admin/ProjectForm";

export default async function NewProjectPage() {
  const categories = await listCategories();

  return <ProjectForm categories={categories} />;
}
