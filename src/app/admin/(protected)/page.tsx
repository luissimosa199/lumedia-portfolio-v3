import Link from "next/link";
import { listProjectsForAdmin } from "@/lib/adminProjects";
import { moveProjectAction } from "@/app/admin/actions";
import DeleteProjectButton from "@/components/admin/DeleteProjectButton";
import {
  cardClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/admin/styles";

type PageProps = {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
};

export default async function AdminProjectsPage({ searchParams }: PageProps) {
  const { saved, deleted } = await searchParams;
  const projects = await listProjectsForAdmin();

  return (
    <main className={cardClass}>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div>
          <h1 className="text-slate-500 text-sm">Content</h1>
          <h2 className="text-2xl font-semibold dark:text-slate-200">Projects</h2>
        </div>
        <Link href="/admin/projects/new" className={primaryButtonClass}>
          New project
        </Link>
      </div>

      {saved ? (
        <p role="status" className="mb-4 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-200 p-3 text-sm">
          Saved <strong>{saved}</strong>. The public pages have been refreshed.
        </p>
      ) : null}
      {deleted ? (
        <p role="status" className="mb-4 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-200 p-3 text-sm">
          Project deleted.
        </p>
      ) : null}

      {projects.length === 0 ? (
        <p className="dark:text-slate-300">No projects yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
          {projects.map((project, index) => (
            <li
              key={project.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 py-3"
              data-testid="admin-project-row"
              data-slug={project.slug}
            >
              <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element -- previews can be any allowed host */}
                <img
                  src={project.coverUrl}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold dark:text-slate-200 truncate">
                  {project.names.es || <em>(no ES name)</em>}
                  <span className="text-slate-500 font-normal"> / </span>
                  {project.names.en || <em>(no EN name)</em>}
                </p>
                <p className="text-sm text-slate-500 truncate">
                  /projects/{project.slug} · {project.category} · {project.imageCount}{" "}
                  {project.imageCount === 1 ? "image" : "images"}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <form action={moveProjectAction.bind(null, project.id, "up")}>
                  <button
                    type="submit"
                    className={secondaryButtonClass}
                    disabled={index === 0}
                    aria-label={`Move ${project.slug} up`}
                  >
                    ↑
                  </button>
                </form>
                <form action={moveProjectAction.bind(null, project.id, "down")}>
                  <button
                    type="submit"
                    className={secondaryButtonClass}
                    disabled={index === projects.length - 1}
                    aria-label={`Move ${project.slug} down`}
                  >
                    ↓
                  </button>
                </form>
                <Link
                  href={`/admin/projects/${project.id}`}
                  className={secondaryButtonClass}
                >
                  Edit
                </Link>
                <DeleteProjectButton id={project.id} slug={project.slug} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
