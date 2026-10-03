"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const Footer = () => {
  const t = useTranslations("footer");
  const [year, setYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    const interval = setInterval(() => {
      setYear(new Date().getFullYear());
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full bg-white dark:bg-violet-950 border-black p-4 rounded-full shadow-md mt-4">
      <p className="text-slate-500 text-center dark:text-slate-200" suppressHydrationWarning>
        {t("copyright", { year })}
      </p>
    </footer>
  );
};

export default Footer;
