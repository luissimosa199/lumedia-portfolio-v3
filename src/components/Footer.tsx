import React from "react";
import { getTranslations } from "next-intl/server";

const Footer = async () => {
  const t = await getTranslations("footer");

  return (
    <footer className="w-full bg-white dark:bg-violet-950 border-black p-4 rounded-full shadow-md mt-4">
      <p className="text-slate-500 text-center dark:text-slate-200">
        {t("copyright")}
      </p>
    </footer>
  );
};

export default Footer;
