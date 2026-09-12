import {beforeAll, describe, expect, it} from "vitest";
import {getPostgresPool} from "@/lib/postgresPool";
import {loadProjects, type Project, type ProjectLocale} from "@/lib/projectTypes";
import {getProjects} from "@/utils/getProjects";
import {getProjectData} from "@/utils/getProjectData";
import {getCategories} from "@/utils/getCategories";
import {getTechStack} from "@/utils/getTechStack";
import {getCategoriesCount} from "@/utils/getCategoriesCount";
import {IDS, seedProjects} from "./support/fixtures";

function expectedProject(slug: keyof typeof IDS, locale: ProjectLocale): Project {
  const data = {
    beta: {category: "Web", cover: "/cover/beta.png", url: "https://beta.live", repo: "https://repo/beta", tags: ["Next.js", "TypeScript"]},
    alpha: {category: "API", cover: "/cover/alpha.png", url: "https://repo/alpha", repo: "https://repo/alpha", tags: ["PostgreSQL", "TypeScript"]},
    delta: {category: "CLI", cover: "/cover/delta.png", url: "https://repo/delta", repo: "https://repo/delta", tags: ["Docker"]},
    epsilon: {category: "Web", cover: "/cover/epsilon.png", url: "https://repo/epsilon", repo: "https://repo/epsilon", tags: ["Next.js", "Docker"]},
    gamma: {category: "API", cover: "/cover/gamma.png", url: "https://repo/gamma", repo: "https://repo/gamma", tags: []},
  }[slug];
  const title = slug[0].toUpperCase() + slug.slice(1);
  return {
    _id: slug === "beta" ? "legacy-beta" : IDS[slug],
    name: `${locale.toUpperCase()} ${title}`,
    subtitle: locale === "es" ? `Sub ES ${slug}` : `Sub EN ${slug}`,
    category: data.category,
    text: locale === "es" ? `Cuerpo ES ${slug}` : `Body EN ${slug}`,
    image: data.cover,
    gallery: slug === "alpha" ? ["/gallery/alpha-2.png", "/gallery/alpha-10.png"] : [],
    galleryCaptions: slug === "alpha"
      ? locale === "es" ? ["Segunda ES", "Décima ES"] : ["Second EN", "Tenth EN"]
      : [],
    slug,
    url: data.url,
    repo: data.repo,
    tags: data.tags,
  };
}

describe("public PostgreSQL data access", () => {
  beforeAll(() => seedProjects(getPostgresPool()));

  it("loads the exact Spanish project list in public ordering", async () => {
    expect(await loadProjects("es")).toEqual(
      (["beta", "alpha", "delta", "epsilon", "gamma"] as const).map((slug) => expectedProject(slug, "es"))
    );
  });

  it("the public wrapper returns exact localized English rows", async () => {
    expect(await getProjects("en")).toEqual(
      (["beta", "alpha", "delta", "epsilon", "gamma"] as const).map((slug) => expectedProject(slug, "en"))
    );
  });

  it("looks up one project and orders its gallery by idx", async () => {
    expect(await loadProjects("es", "alpha")).toEqual([expectedProject("alpha", "es")]);
    expect(JSON.parse(await getProjectData("alpha", "en"))).toEqual(expectedProject("alpha", "en"));
    expect(await getProjectData("not-present", "es")).toBe("null");
  });

  it("returns exact duplicate-free categories, counts, and technologies", async () => {
    expect(await getCategories()).toEqual(["API", "CLI", "Web"]);
    expect(await getCategoriesCount()).toEqual({
      total: 5,
      categories: [
        {category: "API", count: 2},
        {category: "CLI", count: 1},
        {category: "Web", count: 2},
      ],
    });
    expect(await getTechStack()).toBe('["Docker","Next.js","PostgreSQL","TypeScript"]');
  });
});
