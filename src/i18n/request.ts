import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  // Routes that live outside the `[locale]` segment (the /admin panel) are
  // never touched by the next-intl middleware, so they arrive here without a
  // locale. They still render under the shared root layout (which calls
  // getLocale() for <html lang>), so fall back to the default locale instead
  // of 404ing. Anything that IS under `[locale]` is validated again by
  // src/app/[locale]/layout.tsx, so an unknown prefix still 404s there.
  const locale = requested ?? routing.defaultLocale;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
