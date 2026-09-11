import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import LocaleLayout, { generateStaticParams } from "@/app/[locale]/layout";
import { routing } from "@/i18n/routing";
import { buildAlternates } from "@/lib/alternates";
import proxy from "@/proxy";

function request(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(`https://portfolio.test${path}`, { headers });
}

describe("localized routing", () => {
  it("pins supported locales, default prefix policy, and generated params", () => {
    expect(routing.locales).toEqual(["es", "en"]);
    expect(routing.defaultLocale).toBe("es");
    expect(routing.localePrefix).toBe("as-needed");
    expect(routing.localeDetection).toBe(false);
    expect(generateStaticParams()).toEqual([{ locale: "es" }, { locale: "en" }]);
  });

  it("rejects unsupported locale layout params with Next.js not-found semantics", async () => {
    await expect(
      LocaleLayout({ children: null, params: Promise.resolve({ locale: "fr" }) })
    ).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });
  });

  it("redirects a first English-preference document request and records English", async () => {
    const response = await proxy(
      request("/projects", {
        "accept-language": "fr;q=0.9, en-US;q=0.8, es;q=0.7",
        "sec-fetch-dest": "document",
      })
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://portfolio.test/en/projects");
    expect(response.cookies.get("NEXT_LOCALE")).toMatchObject({
      name: "NEXT_LOCALE",
      value: "en",
      path: "/",
      sameSite: "lax",
    });
  });

  it("serves Spanish unprefixed and English prefixed paths with exact rewrites", async () => {
    const spanish = await proxy(
      request("/about", {
        cookie: "NEXT_LOCALE=es",
        "sec-fetch-dest": "document",
      })
    );
    expect(spanish.status).toBe(200);
    expect(spanish.headers.get("x-middleware-rewrite")).toBe(
      "https://portfolio.test/es/about"
    );
    expect(spanish.cookies.get("NEXT_LOCALE")).toBeUndefined();

    const english = await proxy(
      request("/en/about", { "sec-fetch-dest": "document" })
    );
    expect(english.status).toBe(200);
    expect(english.headers.get("x-middleware-rewrite")).toBeNull();
    expect(english.cookies.get("NEXT_LOCALE")?.value).toBe("en");
  });

  it("a locale cookie suppresses repeat language-preference redirects", async () => {
    const response = await proxy(
      request("/contact", {
        "accept-language": "en-US,en;q=0.9",
        cookie: "NEXT_LOCALE=es",
        "sec-fetch-dest": "document",
      })
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://portfolio.test/es/contact"
    );
  });

  it("does not write locale cookies for non-document requests", async () => {
    const response = await proxy(
      request("/en/projects", { "sec-fetch-dest": "image" })
    );
    expect(response.status).toBe(200);
    expect(response.cookies.get("NEXT_LOCALE")).toBeUndefined();
  });

  it("keeps admin unlocalized and redirects unauthenticated users to login", async () => {
    delete process.env.ADMIN_SESSION_SECRET;
    delete process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_PASSWORD_HASH;
    const protectedResponse = await proxy(request("/admin/projects?from=test"));
    expect(protectedResponse.status).toBe(307);
    expect(protectedResponse.headers.get("location")).toBe(
      "https://portfolio.test/admin/login"
    );
    expect(protectedResponse.cookies.get("NEXT_LOCALE")).toBeUndefined();

    const loginResponse = await proxy(request("/admin/login"));
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.headers.get("location")).toBeNull();
    expect(loginResponse.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("builds exact canonical and language-alternate localized URLs", () => {
    expect(buildAlternates("es", "/projects/alpha")).toEqual({
      canonical: "/projects/alpha",
      languages: { es: "/projects/alpha", en: "/en/projects/alpha" },
    });
    expect(buildAlternates("en", "/")).toEqual({
      canonical: "/en",
      languages: { es: "/", en: "/en" },
    });
  });
});
