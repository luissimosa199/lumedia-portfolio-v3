import { faGithub, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import ContactLink from "./ContactLink";

const ContactSection = () => {
  return (
    <section className="w-full bg-white dark:bg-violet-950 border-black p-4 rounded-3xl shadow-md mb-4">
      <div className="flex justify-between mb-2">
        <div>
          <h2 className="text-slate-500 text-sm">Links</h2>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <ContactLink
          primaryIcon={faGithub}
          href="https://github.com/luissimosa199"
        />
        <ContactLink
          primaryIcon={faEnvelope}
          href="mailto:simosa37@gmail.com"
        />
        <ContactLink
          primaryIcon={faLinkedinIn}
          href="https://www.linkedin.com/in/luis-simosa-43b860112/"
        />
      </div>
    </section>
  );
};

export default ContactSection;
