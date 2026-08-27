import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import ProjectsSection from "@/components/ProjectsSection";
import { buildAlternates, type SiteLocale } from "@/lib/alternates";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale as SiteLocale, "/"),
  };
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <main className="min-h-screen">
      <h2 className="ml-4 mb-1 font-semibold text-sm dark:text-slate-100">
        {t("about")}
      </h2>
      <AboutSection />

      <h2 className="ml-4 mb-1 font-semibold text-sm dark:text-slate-100">
        {t("contact")}
      </h2>
      <ContactSection />

      <h2 className="ml-4 mb-1 font-semibold text-sm dark:text-slate-100">
        {t("projects")}
      </h2>
      <ProjectsSection />
    </main>
  );
}
