import { FaGithub, FaLinkedinIn, FaEnvelope } from "react-icons/fa";
import React from "react";
import { getTranslations } from "next-intl/server";
import ContactLink from "./ContactLink";

const ContactSection = async () => {
  const t = await getTranslations("contact");

  return (
    <section className="w-full bg-white dark:bg-violet-950 border-black p-4 rounded-3xl shadow-md mb-4">
      <div className="flex justify-between mb-2">
        <div>
          <h2 className="text-slate-500 text-sm">{t("links")}</h2>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <ContactLink
          primaryIcon={FaGithub}
          href="https://github.com/luissimosa199"
        />
        <ContactLink
          primaryIcon={FaEnvelope}
          href="mailto:simosa37@gmail.com"
        />
        <ContactLink
          primaryIcon={FaLinkedinIn}
          href="https://www.linkedin.com/in/luis-simosa-43b860112/"
        />
      </div>
    </section>
  );
};

export default ContactSection;
