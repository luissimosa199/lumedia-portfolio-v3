import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "./lib/adminSession";

const intlMiddleware = createMiddleware(routing);

type SiteLocale = (typeof routing.locales)[number];

/**
 * `routing.localeDetection` is deliberately `false` so next-intl never
 * re-derives the locale from its `NEXT_LOCALE` cookie or `accept-language`
 * on every request (that would fight the "es is always unprefixed" URL
 * model). We still want a first-touch redirect for english-preferring
 * visitors, so it is handled explicitly here, once, only for unprefixed
 * paths with no `NEXT_LOCALE` cookie yet, before delegating to next-intl.
 *
 * The cookie gate is what makes "once" true, so this proxy owns the cookie
 * instead of relying on next-intl to write it. next-intl only sets
 * `NEXT_LOCALE` when the resolved locale differs from what `accept-language`
 * would have picked - so for an english-preferring browser, visiting /en
 * never set a cookie, and clicking the "ES" switcher (which targets the
 * unprefixed URL) re-triggered this same redirect and bounced the visitor
 * straight back to /en. The switcher label therefore never changed. Every
 * document response now records the locale of the URL it was served for.
 */
const LOCALE_COOKIE_NAME = "NEXT_LOCALE";
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const ADMIN_PREFIX = "/admin";
const ADMIN_LOGIN_PATH = "/admin/login";

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

function getLocaleFromPathname(pathname: string): SiteLocale | undefined {
  return routing.locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
}

/** Only real page navigations should touch the locale cookie (mirrors next-intl). */
function isDocumentRequest(request: NextRequest): boolean {
  const destination = request.headers.get("sec-fetch-dest");
  return destination === null || destination === "document";
}

function rememberLocale(
  request: NextRequest,
  response: NextResponse,
  locale: SiteLocale
) {
  if (!isDocumentRequest(request)) return;
  if (request.cookies.get(LOCALE_COOKIE_NAME)?.value === locale) return;
  // next-intl may already have written the same cookie on this response.
  if (response.cookies.get(LOCALE_COOKIE_NAME)?.value === locale) return;

  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: LOCALE_COOKIE_MAX_AGE,
  });
}

/**
 * /admin lives outside the `[locale]` segment and is never localized, so it
 * bypasses next-intl entirely. Everything except the login page requires a
 * valid session cookie; the pages/actions re-check it too (src/lib/adminAuth.ts),
 * this is just the first line of defense.
 */
async function handleAdmin(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = await verifyAdminSessionToken(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  );

  if (pathname === ADMIN_LOGIN_PATH) {
    if (isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_PREFIX;
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_LOGIN_PATH;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`)) {
    return handleAdmin(request);
  }

  const prefixLocale = getLocaleFromPathname(pathname);
  const hasLocaleCookie = request.cookies.has(LOCALE_COOKIE_NAME);

  if (!prefixLocale && !hasLocaleCookie) {
    const acceptLanguage = request.headers.get("accept-language");
    const preferred = acceptLanguage
      ? negotiateLocale(acceptLanguage, routing.locales)
      : undefined;

    if (preferred && preferred !== routing.defaultLocale) {
      const url = request.nextUrl.clone();
      url.pathname = `/${preferred}${pathname === "/" ? "" : pathname}`;
      const response = NextResponse.redirect(url);
      rememberLocale(request, response, preferred as SiteLocale);
      return response;
    }
  }

  const response = intlMiddleware(request);
  rememberLocale(request, response, prefixLocale ?? routing.defaultLocale);
  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
