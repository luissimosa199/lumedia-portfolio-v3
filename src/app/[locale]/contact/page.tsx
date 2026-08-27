import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ContactForm from "@/components/ContactForm";
import { buildAlternates, type SiteLocale } from "@/lib/alternates";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return {
    title: t("title"),
    alternates: buildAlternates(locale as SiteLocale, "/contact"),
  };
}

const Contact = async ({ params }: PageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ContactForm />;
};

export default Contact;
