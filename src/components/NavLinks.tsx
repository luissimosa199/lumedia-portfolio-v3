import React from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const NavLinks = async () => {
  const t = await getTranslations("navigation");

  return (
    <div className="hidden md:block w-8">
      <ul className="flex gap-4 p-4">
        <li className="md:hover:scale-105 dark:text-slate-200 md:hover:opacity-75 md:hover:text-violet-700 md:hover:border-violet-700 active:border-violet-700 active:text-violet-700 active:opacity-75 active:scale-105 transition-all">
          <Link href="/about" className="truncate">
            {t("about")}
          </Link>
        </li>
        <li className="md:hover:scale-105 dark:text-slate-200 md:hover:opacity-75 md:hover:text-violet-700 md:hover:border-violet-700 active:border-violet-700 active:text-violet-700 active:opacity-75 active:scale-105 transition-all">
          <Link href="/contact">{t("contact")}</Link>
        </li>
        <li className="md:hover:scale-105 dark:text-slate-200 md:hover:opacity-75 md:hover:text-violet-700 md:hover:border-violet-700 active:border-violet-700 active:text-violet-700 active:opacity-75 active:scale-105 transition-all">
          <Link href="/projects">{t("projects")}</Link>
        </li>
      </ul>
    </div>
  );
};

export default NavLinks;
