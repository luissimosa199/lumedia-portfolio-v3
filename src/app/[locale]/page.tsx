import { setRequestLocale } from "next-intl/server";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import ProjectsSection from "@/components/ProjectsSection";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen">
      <h2 className="ml-4 mb-1 font-semibold text-sm dark:text-slate-100">
        Sobre mi
      </h2>
      <AboutSection />

      <h2 className="ml-4 mb-1 font-semibold text-sm dark:text-slate-100">
        Contacto
      </h2>
      <ContactSection />

      <h2 className="ml-4 mb-1 font-semibold text-sm dark:text-slate-100">
        Mis proyectos
      </h2>
      <ProjectsSection />
    </main>
  );
}
