import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * `routing.localeDetection` is deliberately `false` so next-intl never
 * re-derives the locale from its `NEXT_LOCALE` cookie or `accept-language`
 * on every request (that would fight the "es is always unprefixed" URL
 * model). We still want a first-touch redirect for english-preferring
 * visitors, so it is handled explicitly here, once, only for unprefixed
 * paths with no `NEXT_LOCALE` cookie yet, before delegating to next-intl.
 *
 * The cookie gate matters: next-intl's `Link` forces an explicit `/es/...`
 * hop when switching locale (even though es is normally unprefixed), which
 * itself redirects down to the canonical unprefixed URL. Without the gate,
 * that second, unprefixed hop would re-trigger this same accept-language
 * redirect and bounce an english-preferring visitor straight back to /en
 * every time they tried to switch to Spanish.
 */
const LOCALE_COOKIE_NAME = "NEXT_LOCALE";
function negotiateLocale(
  acceptLanguage: string,
  locales: readonly string[]
): string | undefined {
  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, qPart] = part.trim().split(";q=");
      const q = qPart ? Number.parseFloat(qPart) : 1;
      return { tag: tag?.trim().toLowerCase() ?? "", q: Number.isNaN(q) ? 0 : q };
    })
    .filter((entry) => entry.tag.length > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    const match = locales.find(
      (locale) => locale.toLowerCase() === tag || locale.toLowerCase() === base
    );
    if (match) return match;
  }

  return undefined;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocalePrefix = routing.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  const hasLocaleCookie = request.cookies.has(LOCALE_COOKIE_NAME);

  if (!hasLocalePrefix && !hasLocaleCookie) {
    const acceptLanguage = request.headers.get("accept-language");
    const preferred = acceptLanguage
      ? negotiateLocale(acceptLanguage, routing.locales)
      : undefined;

    if (preferred && preferred !== routing.defaultLocale) {
      const url = request.nextUrl.clone();
      url.pathname = `/${preferred}${pathname === "/" ? "" : pathname}`;
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
