"use client";

import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";

const LABELS: Record<"es" | "en", string> = {
  es: "ES",
  en: "EN",
};

const ARIA_LABELS: Record<"es" | "en", string> = {
  es: "Cambiar a español",
  en: "Switch to English",
};

/**
 * A plain <a>, deliberately NOT next-intl's <Link>/next's <Link>. Switching
 * locale must always be a full browser navigation: the outer app/layout.tsx
 * only resolves its `lang` attribute (and other locale-derived state) at
 * request time via getLocale(), and Next's App Router persists that root
 * layout's DOM across client-side transitions - so a client-routed locale
 * switch leaves a stale `<html lang>` behind even once the routed content
 * has updated. A hard navigation re-renders the whole document and avoids
 * that mismatch entirely.
 */
const LanguageSwitcher = () => {
  const locale = useLocale() as "es" | "en";
  const pathname = usePathname();
  const nextLocale: "es" | "en" = locale === "es" ? "en" : "es";

  const suffix = pathname === "/" ? "" : pathname;
  const targetHref =
    nextLocale === "es" ? (pathname === "/" ? "/" : pathname) : `/en${suffix}`;

  return (
    <a
      href={targetHref}
      hrefLang={nextLocale}
      data-testid="language-switcher"
      aria-label={ARIA_LABELS[nextLocale]}
      className="text-sm font-semibold dark:text-slate-200 md:hover:text-violet-700 transition-all"
    >
      {LABELS[nextLocale]}
    </a>
  );
};

export default LanguageSwitcher;
