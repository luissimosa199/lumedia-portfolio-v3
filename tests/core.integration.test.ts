import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  createProject,
  deleteProject,
  getProjectForAdmin,
  isProjectId,
  isSlugTaken,
  listCategories,
  listProjectsForAdmin,
  moveProject,
  updateProject,
} from "@/lib/adminProjects";
import type { AdminProjectInput } from "@/lib/adminProjectTypes";
import { createContactRepository, contactRepository } from "@/lib/contactRepository";
import { isContactInput, type ContactInput, type ContactRow } from "@/lib/contactSchema";
import { createContactService, createSesEmailSender } from "@/lib/contactService";
import { postgresPool } from "@/lib/postgresPool";
import { loadProjects, type Project } from "@/lib/projectTypes";
import { handleForm } from "@/app/contact/handleForm";
import { getCategories } from "@/utils/getCategories";
import { getCategoriesCount } from "@/utils/getCategoriesCount";
import { getProjectData } from "@/utils/getProjectData";
import { getProjects } from "@/utils/getProjects";
import { getTechStack } from "@/utils/getTechStack";
import {
  bootstrapDatabase,
  FIXED_TIME,
  IDS,
  seedDatabase,
  testPool,
} from "./support/database";

const alphaEs: Project = {
  _id: "legacy-alpha",
  name: "Alfa ES",
  subtitle: "Subtítulo alfa",
  category: "web",
  text: "Cuerpo alfa",
  image: "/alpha-cover.webp",
  gallery: ["/alpha-0.webp", "/alpha-1.webp", "/alpha-2.webp"],
  galleryCaptions: ["Alfa cero", "Alfa uno", "Alfa dos"],
  slug: "alpha",
  url: "https://alpha.test",
  repo: "https://github.test/alpha",
  tags: ["Next.js", "TypeScript"],
};

const betaEs: Project = {
  _id: IDS.beta,
  name: "Beta ES",
  subtitle: "Subtítulo beta",
  category: "web",
  text: "Cuerpo beta",
  image: "/beta-cover.webp",
  gallery: ["/beta-0.webp"],
  galleryCaptions: ["Beta cero"],
  slug: "beta",
  url: "https://github.test/beta",
  repo: "https://github.test/beta",
  tags: ["TypeScript", "PostgreSQL"],
};

const gammaEs: Project = {
  _id: IDS.gamma,
  name: "Gamma ES",
  subtitle: "Subtítulo gamma",
  category: "cli",
  text: "Cuerpo gamma",
  image: "/gamma-cover.webp",
  gallery: [],
  galleryCaptions: [],
  slug: "gamma",
  url: "https://github.test/gamma",
  repo: "https://github.test/gamma",
  tags: [],
};

const adminInput: AdminProjectInput = {
  slug: "delta",
  category: "api",
  coverUrl: "/delta-cover.webp",
  liveUrl: "https://delta.test",
  repoUrl: "https://github.test/delta",
  tags: ["Node.js", "PostgreSQL"],
  displayOrder: null,
  translations: {
    es: { name: "Delta ES", subtitle: "Sub delta", body: "Cuerpo delta" },
    en: { name: "Delta EN", subtitle: "Delta sub", body: "Delta body" },
  },
  gallery: [
    {
      url: "/delta-0.webp",
      captions: { es: "Delta cero", en: "Delta zero" },
    },
  ],
};

beforeAll(async () => {
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error(
      "TEST_DATABASE_URL is required. Database integration tests are never skipped."
    );
  }
  await bootstrapDatabase();
});

beforeEach(async () => {
  await seedDatabase();
});

afterAll(async () => {
  await postgresPool.end();
  await testPool.end();
});

describe("public PostgreSQL catalog", () => {
  it("pins localized listing, detail, wrapper, JSON, ordering, and missing contracts", async () => {
    expect(await loadProjects("es")).toEqual([alphaEs, betaEs, gammaEs]);

    expect(await loadProjects("en", "alpha")).toEqual([
      {
        ...alphaEs,
        name: "Alpha EN",
        subtitle: "Alpha subtitle",
        text: "Alpha body",
        galleryCaptions: ["Alpha zero", "Alpha one", "Alpha two"],
      },
    ]);
    expect(await loadProjects("es", "missing")).toEqual([]);
    expect(await getProjects("es")).toEqual([alphaEs, betaEs, gammaEs]);
    expect(await getProjectData("alpha", "es")).toBe(JSON.stringify(alphaEs));
    expect(await getProjectData("missing", "en")).toBe("null");
  });

  it("pins unique sorted categories, tags, and exact category counts", async () => {
    expect(await getCategories()).toEqual(["cli", "web"]);
    expect(await getTechStack()).toBe(
      JSON.stringify(["Next.js", "PostgreSQL", "TypeScript"])
    );
    expect(await getCategoriesCount()).toEqual({
      total: 3,
      categories: [
        { category: "cli", count: 1 },
        { category: "web", count: 2 },
      ],
    });
  });
});

describe("admin PostgreSQL catalog", () => {
  it("pins admin listing, detail, category, id, and slug contracts", async () => {
    expect(isProjectId(IDS.alpha)).toBe(true);
    expect(isProjectId("not-a-uuid")).toBe(false);
    expect(await listProjectsForAdmin()).toEqual([
      {
        id: IDS.alpha,
        slug: "alpha",
        category: "web",
        coverUrl: "/alpha-cover.webp",
        displayOrder: 1,
        names: { es: "Alfa ES", en: "Alpha EN" },
        imageCount: 3,
        updatedAt: FIXED_TIME,
      },
      {
        id: IDS.beta,
        slug: "beta",
        category: "web",
        coverUrl: "/beta-cover.webp",
        displayOrder: 1,
        names: { es: "Beta ES", en: "Beta EN" },
        imageCount: 1,
        updatedAt: FIXED_TIME,
      },
      {
        id: IDS.gamma,
        slug: "gamma",
        category: "cli",
        coverUrl: "/gamma-cover.webp",
        displayOrder: null,
        names: { es: "Gamma ES", en: "Gamma EN" },
        imageCount: 0,
        updatedAt: "2024-02-03T04:05:06.000Z",
      },
    ]);

    expect(await getProjectForAdmin(IDS.alpha)).toEqual({
      id: IDS.alpha,
      slug: "alpha",
      category: "web",
      coverUrl: "/alpha-cover.webp",
      liveUrl: "https://alpha.test",
      repoUrl: "https://github.test/alpha",
      tags: ["Next.js", "TypeScript"],
      displayOrder: 1,
      createdAt: FIXED_TIME,
      updatedAt: FIXED_TIME,
      translations: {
        es: { name: "Alfa ES", subtitle: "Subtítulo alfa", body: "Cuerpo alfa" },
        en: { name: "Alpha EN", subtitle: "Alpha subtitle", body: "Alpha body" },
      },
      gallery: [
        { url: "/alpha-0.webp", captions: { es: "Alfa cero", en: "Alpha zero" } },
        { url: "/alpha-1.webp", captions: { es: "Alfa uno", en: "Alpha one" } },
        { url: "/alpha-2.webp", captions: { es: "Alfa dos", en: "Alpha two" } },
      ],
    });
    expect(await getProjectForAdmin("bad-id")).toBeNull();
    expect(await listCategories()).toEqual(["cli", "web"]);
    expect(await isSlugTaken("alpha")).toBe(true);
    expect(await isSlugTaken("alpha", IDS.alpha)).toBe(false);
    expect(await isSlugTaken("unused")).toBe(false);
  });

  it("creates all project relations and assigns the next display order", async () => {
    const id = await createProject(adminInput);
    expect(isProjectId(id)).toBe(true);
    const created = await getProjectForAdmin(id);
    expect(created).toMatchObject({ ...adminInput, id, displayOrder: 2 });
    expect(created?.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(created?.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(await isSlugTaken("delta")).toBe(true);
  });

  it("updates exact base, translated, and gallery values", async () => {
    const input: AdminProjectInput = {
      ...adminInput,
      slug: "alpha-updated",
      category: "service",
      coverUrl: "/updated.webp",
      liveUrl: null,
      displayOrder: 7,
      tags: ["Go"],
      translations: {
        es: { name: "Actualizado", subtitle: "Nuevo", body: "Nuevo cuerpo" },
        en: { name: "Updated", subtitle: "New", body: "New body" },
      },
      gallery: [
        { url: "/new-0.webp", captions: { es: "Nueva cero", en: "New zero" } },
        { url: "/new-1.webp", captions: { es: "Nueva uno", en: "New one" } },
      ],
    };
    expect(await updateProject(IDS.alpha, input)).toBe(true);
    expect(await getProjectForAdmin(IDS.alpha)).toMatchObject({ id: IDS.alpha, ...input });
    expect(await updateProject("bad-id", input)).toBe(false);
  });

  it("deletes the project and every related row", async () => {
    expect(await deleteProject(IDS.alpha)).toBe(true);
    expect(await deleteProject(IDS.alpha)).toBe(false);
    expect(await getProjectForAdmin(IDS.alpha)).toBeNull();
    const relations = await testPool.query(
      `SELECT
        (SELECT count(*)::int FROM project_translations WHERE project_id = $1) translations,
        (SELECT count(*)::int FROM project_images WHERE project_id = $1) images,
        (SELECT count(*)::int FROM project_image_translations WHERE project_id = $1) captions`,
      [IDS.alpha]
    );
    expect(relations.rows[0]).toEqual({ translations: 0, images: 0, captions: 0 });
  });

  it("moves neighbours and deterministically normalizes null and duplicate orders", async () => {
    expect(await moveProject(IDS.beta, "up")).toBe(true);
    expect(
      (await listProjectsForAdmin()).map(({ id, displayOrder }) => ({ id, displayOrder }))
    ).toEqual([
      { id: IDS.beta, displayOrder: 0 },
      { id: IDS.alpha, displayOrder: 1 },
      { id: IDS.gamma, displayOrder: 2 },
    ]);
    expect(await moveProject(IDS.beta, "up")).toBe(true);
    expect(await moveProject("bad-id", "down")).toBe(false);
  });
});

describe("contact submission", () => {
  const contact: ContactInput = {
    name: "Ada Lovelace",
    email: "ada@example.test",
    message: "Build an analytical engine.",
    origin: "portfolio",
  };

  it("validates the complete runtime shape and rejects blank/non-string input", () => {
    expect(isContactInput(contact)).toBe(true);
    expect(isContactInput({ ...contact, name: "  " })).toBe(false);
    expect(isContactInput({ ...contact, email: "" })).toBe(false);
    expect(isContactInput({ ...contact, message: 42 })).toBe(false);
    expect(isContactInput({ name: "Ada" })).toBe(false);
    expect(isContactInput(null)).toBe(false);
  });

  it("persists exact fields through both repository exports", async () => {
    const first = await createContactRepository(testPool).insertContact(contact);
    const second = await contactRepository.insertContact({
      ...contact,
      email: "ada.second@example.test",
    });
    expect(first).toMatchObject(contact);
    expect(second).toMatchObject({ ...contact, email: "ada.second@example.test" });
    expect(first.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(first.created_at).toBeInstanceOf(Date);
    expect(first.updated_at).toBeInstanceOf(Date);
    const rows = await testPool.query(
      `SELECT name, email, message, origin FROM contactforms ORDER BY email`
    );
    expect(rows.rows).toEqual([
      { ...contact, email: "ada.second@example.test" },
      contact,
    ]);
  });

  it("passes the persisted row to email only after persistence", async () => {
    const events: string[] = [];
    const saved: ContactRow = {
      ...contact,
      id: "10000000-0000-4000-8000-000000000001",
      created_at: new Date(FIXED_TIME),
      updated_at: new Date(FIXED_TIME),
    };
    let emailed: ContactInput | undefined;
    const service = createContactService({
      repository: {
        async insertContact(received) {
          events.push("persist");
          expect(received).toEqual(contact);
          return saved;
        },
      },
      emailSender: {
        async send(received) {
          events.push("email");
          emailed = received;
        },
      },
    });
    expect(await service.submit(contact)).toEqual(saved);
    expect(events).toEqual(["persist", "email"]);
    expect(emailed).toBe(saved);
  });

  it("handles valid and invalid FormData with real persistence and exact messages", async () => {
    const emailed: ContactInput[] = [];
    const valid = new FormData();
    valid.set("name", contact.name);
    valid.set("email", contact.email);
    valid.set("message", contact.message);
    expect(
      await handleForm(valid, {
        repository: createContactRepository(testPool),
        emailSender: { async send(value) { emailed.push(value); } },
        messages: { success: "SENT", failure: "FAILED" },
      })
    ).toEqual({ ok: true, message: "SENT" });

    const persisted = await testPool.query(`SELECT * FROM contactforms`);
    expect(persisted.rows).toHaveLength(1);
    expect(persisted.rows[0]).toMatchObject(contact);
    expect(emailed).toHaveLength(1);
    expect(emailed[0]).toEqual(persisted.rows[0]);

    const invalid = new FormData();
    invalid.set("name", "   ");
    invalid.set("email", "nobody@example.test");
    invalid.set("message", "ignored");
    expect(
      await handleForm(invalid, {
        repository: createContactRepository(testPool),
        emailSender: { async send(value) { emailed.push(value); } },
        messages: { failure: "FAILED" },
      })
    ).toEqual({ ok: false, message: "FAILED" });
    expect((await testPool.query(`SELECT count(*)::int count FROM contactforms`)).rows[0]).toEqual({ count: 1 });
    expect(emailed).toHaveLength(1);
  });

  it("returns failure before email on repository errors and retains rows on email errors", async () => {
    const form = new FormData();
    form.set("name", contact.name);
    form.set("email", contact.email);
    form.set("message", contact.message);
    let emailCalls = 0;
    expect(
      await handleForm(form, {
        repository: { async insertContact() { throw new Error("database unavailable"); } },
        emailSender: { async send() { emailCalls += 1; } },
        messages: { failure: "FAILED" },
      })
    ).toEqual({ ok: false, message: "FAILED" });
    expect(emailCalls).toBe(0);

    expect(
      await handleForm(form, {
        repository: createContactRepository(testPool),
        emailSender: { async send() { emailCalls += 1; throw new Error("SES unavailable"); } },
        messages: { failure: "FAILED" },
      })
    ).toEqual({ ok: false, message: "FAILED" });
    expect(emailCalls).toBe(1);
    expect((await testPool.query(`SELECT name, email, message, origin FROM contactforms`)).rows).toEqual([contact]);
  });

  it("builds one concrete SES command with exact addressing and escaped HTML", async () => {
    const commands: unknown[] = [];
    const sender = createSesEmailSender({
      async send(command) {
        commands.push(command);
        return { MessageId: "provider-message-1" };
      },
    });
    await sender.send({
      name: "<Ada & Co>",
      email: 'ada+"quote"@example.test',
      message: "It's <ready>",
      origin: "portfolio",
    });
    expect(commands).toHaveLength(1);
    const command = commands[0] as { constructor: { name: string }; input: unknown };
    expect(command.constructor.name).toBe("SendEmailCommand");
    expect(command.input).toEqual({
      Destination: { ToAddresses: ["simosa37@gmail.com"] },
      Content: {
        Simple: {
          Subject: { Data: "Test Email", Charset: "UTF-8" },
          Body: {
            Text: {
              Data: `Recibiste un contacto desde el portafolio\n\nDe: <Ada & Co>\nEmail: ada+"quote"@example.test\nMensaje: It's <ready>`,
              Charset: "UTF-8",
            },
            Html: {
              Data: "<div><h1>Recibiste un contacto desde el portafolio</h1><ul><li>De: &lt;Ada &amp; Co&gt;</li><li>Email: ada+&quot;quote&quot;@example.test</li><li>It&#39;s &lt;ready&gt;</li></ul></div>",
              Charset: "UTF-8",
            },
          },
        },
      },
      FromEmailAddress: "doxacontacts01@gmail.com",
    });
  });
});
