import {beforeEach, describe, expect, it} from "vitest";
import {getPostgresPool} from "@/lib/postgresPool";
import {
  createProject, deleteProject, getProjectForAdmin, isProjectId, isSlugTaken,
  listCategories, listProjectsForAdmin, moveProject, updateProject,
  type AdminProjectInput,
} from "@/lib/adminProjects";
import {IDS, seedProjects} from "./support/fixtures";

const newInput: AdminProjectInput = {
  slug: "zeta", category: "Tools", coverUrl: "/cover/zeta.png",
  liveUrl: "https://zeta.live", repoUrl: "https://repo/zeta", tags: ["Rust", "CLI"],
  displayOrder: null,
  translations: {
    es: {name: "ES Zeta", subtitle: "Sub ES zeta", body: "Cuerpo ES zeta"},
    en: {name: "EN Zeta", subtitle: "Sub EN zeta", body: "Body EN zeta"},
  },
  gallery: [{url: "/gallery/zeta.png", captions: {es: "Zeta ES", en: "Zeta EN"}}],
};

describe("admin PostgreSQL data access", () => {
  beforeEach(() => seedProjects(getPostgresPool()));

  it("lists exact summaries, categories, slug state, and details", async () => {
    const summaries = await listProjectsForAdmin();
    expect(summaries.map(({id, slug, category, displayOrder, names, imageCount, updatedAt}) =>
      ({id, slug, category, displayOrder, names, imageCount, updatedAt}))).toEqual([
      {id: IDS.beta, slug: "beta", category: "Web", displayOrder: 0, names: {es: "ES Beta", en: "EN Beta"}, imageCount: 0, updatedAt: "2024-02-02T00:00:00.000Z"},
      {id: IDS.alpha, slug: "alpha", category: "API", displayOrder: 1, names: {es: "ES Alpha", en: "EN Alpha"}, imageCount: 2, updatedAt: "2024-02-01T00:00:00.000Z"},
      {id: IDS.delta, slug: "delta", category: "CLI", displayOrder: null, names: {es: "ES Delta", en: "EN Delta"}, imageCount: 0, updatedAt: "2024-02-03T00:00:00.000Z"},
      {id: IDS.epsilon, slug: "epsilon", category: "Web", displayOrder: null, names: {es: "ES Epsilon", en: "EN Epsilon"}, imageCount: 0, updatedAt: "2024-02-04T00:00:00.000Z"},
      {id: IDS.gamma, slug: "gamma", category: "API", displayOrder: null, names: {es: "ES Gamma", en: "EN Gamma"}, imageCount: 0, updatedAt: "2024-02-05T00:00:00.000Z"},
    ]);
    expect(await listCategories()).toEqual(["API", "CLI", "Web"]);
    expect(await isSlugTaken("alpha")).toBe(true);
    expect(await isSlugTaken("alpha", IDS.alpha)).toBe(false);
    expect(await isSlugTaken("absent")).toBe(false);
    expect(isProjectId(IDS.alpha)).toBe(true);
    expect(isProjectId("bad-id")).toBe(false);

    const alpha = await getProjectForAdmin(IDS.alpha);
    expect(alpha).toEqual({
      id: IDS.alpha, slug: "alpha", category: "API", coverUrl: "/cover/alpha.png",
      liveUrl: null, repoUrl: "https://repo/alpha", tags: ["PostgreSQL", "TypeScript"], displayOrder: 1,
      createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-02-01T00:00:00.000Z",
      translations: {
        es: {name: "ES Alpha", subtitle: "Sub ES alpha", body: "Cuerpo ES alpha"},
        en: {name: "EN Alpha", subtitle: "Sub EN alpha", body: "Body EN alpha"},
      },
      gallery: [
        {url: "/gallery/alpha-2.png", captions: {es: "Segunda ES", en: "Second EN"}},
        {url: "/gallery/alpha-10.png", captions: {es: "Décima ES", en: "Tenth EN"}},
      ],
    });
    expect(await getProjectForAdmin("bad-id")).toBeNull();
    expect(await getProjectForAdmin("ffffffff-ffff-4fff-8fff-ffffffffffff")).toBeNull();
  });

  it("creates all project records and assigns the next display order", async () => {
    const id = await createProject(newInput);
    const created = await getProjectForAdmin(id);
    expect(created).toMatchObject({...newInput, id, displayOrder: 2});
    const counts = await getPostgresPool().query(
      `SELECT (SELECT count(*)::int FROM projects WHERE id=$1) projects,
              (SELECT count(*)::int FROM project_translations WHERE project_id=$1) translations,
              (SELECT count(*)::int FROM project_images WHERE project_id=$1) images,
              (SELECT count(*)::int FROM project_image_translations WHERE project_id=$1) captions`, [id]);
    expect(counts.rows[0]).toEqual({projects: 1, translations: 2, images: 1, captions: 2});
  });

  it("atomically updates scalars, translations, and the complete gallery", async () => {
    const input = {...newInput, slug: "alpha-replaced", displayOrder: 7,
      gallery: [
        {url: "/new/one.png", captions: {es: "Uno", en: "One"}},
        {url: "/new/two.png", captions: {es: "Dos", en: "Two"}},
      ]};
    expect(await updateProject(IDS.alpha, input)).toBe(true);
    expect(await getProjectForAdmin(IDS.alpha)).toMatchObject({...input, id: IDS.alpha});
    expect(await updateProject("bad-id", input)).toBe(false);
    expect(await updateProject("ffffffff-ffff-4fff-8fff-ffffffffffff", input)).toBe(false);
    expect((await getPostgresPool().query(`SELECT idx, url FROM project_images WHERE project_id=$1 ORDER BY idx`, [IDS.alpha])).rows)
      .toEqual([{idx: 0, url: "/new/one.png"}, {idx: 1, url: "/new/two.png"}]);
  });

  it("deletes only the target across all four project tables", async () => {
    expect(await deleteProject(IDS.alpha)).toBe(true);
    expect(await deleteProject(IDS.alpha)).toBe(false);
    expect(await deleteProject("bad-id")).toBe(false);
    const counts = await getPostgresPool().query(
      `SELECT (SELECT count(*)::int FROM projects) projects,
              (SELECT count(*)::int FROM project_translations) translations,
              (SELECT count(*)::int FROM project_images) images,
              (SELECT count(*)::int FROM project_image_translations) captions`);
    expect(counts.rows[0]).toEqual({projects: 4, translations: 8, images: 0, captions: 0});
  });

  it("moves a neighbor, normalizes every order, and handles boundaries", async () => {
    expect(await moveProject(IDS.gamma, "up")).toBe(true);
    expect((await getPostgresPool().query(`SELECT id, display_order FROM projects ORDER BY display_order`)).rows).toEqual([
      {id: IDS.beta, display_order: 0}, {id: IDS.alpha, display_order: 1},
      {id: IDS.delta, display_order: 2}, {id: IDS.gamma, display_order: 3},
      {id: IDS.epsilon, display_order: 4},
    ]);
    expect(await moveProject(IDS.beta, "up")).toBe(true);
    expect(await moveProject("bad-id", "down")).toBe(false);
    expect(await moveProject("ffffffff-ffff-4fff-8fff-ffffffffffff", "down")).toBe(false);
  });
});
