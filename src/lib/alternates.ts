import type { Metadata } from "next";

export type SiteLocale = "es" | "en";

/**
 * Builds `alternates` metadata for a route given its locale-agnostic
 * pathname (e.g. "/", "/about", "/projects/foo"). Spanish is the default
 * locale and is served unprefixed; English is served under /en. Paths are
 * relative and resolved against `metadataBase` (set on the root layout) so
 * the emitted <link rel="alternate"> tags carry absolute hrefs.
 *
 * Invariant: every page has exactly one es and one en alternate, each
 * pointing at the correct locale counterpart - never a self-referencing or
 * duplicate entry.
 */
export function buildAlternates(
  locale: SiteLocale,
  pathname: string
): Metadata["alternates"] {
  const suffix = pathname === "/" ? "" : pathname;
  const esPath = pathname === "/" ? "/" : suffix;
  const enPath = `/en${suffix}` || "/en";

  return {
    canonical: locale === "en" ? enPath : esPath,
    languages: {
      es: esPath,
      en: enPath,
    },
  };
}
