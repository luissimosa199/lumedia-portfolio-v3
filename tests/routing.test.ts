import {describe, expect, it} from "vitest";
import {NextRequest} from "next/server";
import proxy from "@/proxy";
import {routing} from "@/i18n/routing";
import {buildAlternates} from "@/lib/alternates";

function request(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(`https://portfolio.test${path}`, {headers: {"sec-fetch-dest": "document", ...headers}});
}

describe("localized routing", () => {
  it("exports the exact locale and alternate-path contract", () => {
    expect(routing.locales).toEqual(["es", "en"]);
    expect(routing.defaultLocale).toBe("es");
    expect(routing.localePrefix).toBe("as-needed");
    expect(routing.localeDetection).toBe(false);
    expect(buildAlternates("es", "/")).toEqual({canonical: "/", languages: {es: "/", en: "/en"}});
    expect(buildAlternates("en", "/projects/alpha")).toEqual({
      canonical: "/en/projects/alpha",
      languages: {es: "/projects/alpha", en: "/en/projects/alpha"},
    });
  });

  it("redirects a first English-preferring document and preserves its query", async () => {
    const response = await proxy(request("/projects?tag=pg", {"accept-language": "fr;q=.9, en-US;q=.8, es;q=.7"}));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://portfolio.test/en/projects?tag=pg");
    const cookie = response.cookies.get("NEXT_LOCALE");
    expect(cookie?.value).toBe("en");
    expect(cookie?.path).toBe("/");
    expect(cookie?.sameSite).toBe("lax");
    expect(cookie?.maxAge).toBe(31_536_000);
  });

  it("serves Spanish unprefixed, remembers URL locales, and honors an existing cookie", async () => {
    const spanish = await proxy(request("/about", {"accept-language": "es-AR,en;q=.5"}));
    expect(spanish.status).toBe(200);
    expect(spanish.headers.get("x-middleware-rewrite")).toContain("/es/about");
    expect(spanish.cookies.get("NEXT_LOCALE")?.value).toBe("es");

    const english = await proxy(request("/en/about"));
    expect(english.status).toBe(200);
    expect(english.cookies.get("NEXT_LOCALE")?.value).toBe("en");

    const cookieWins = await proxy(request("/about", {
      "accept-language": "en", cookie: "NEXT_LOCALE=es",
    }));
    expect(cookieWins.status).toBe(200);
    expect(cookieWins.headers.get("location")).toBeNull();
    expect(cookieWins.cookies.get("NEXT_LOCALE")).toBeUndefined();
  });

  it("does not mutate locale cookies for assets and bypasses localization for admin", async () => {
    const fetch = new NextRequest("https://portfolio.test/about", {headers: {"sec-fetch-dest": "image"}});
    const response = await proxy(fetch);
    expect(response.cookies.get("NEXT_LOCALE")).toBeUndefined();

    const admin = await proxy(request("/admin/projects?x=1"));
    expect(admin.status).toBe(307);
    expect(admin.headers.get("location")).toBe("https://portfolio.test/admin/login");
    expect(admin.cookies.get("NEXT_LOCALE")).toBeUndefined();
  });
});
