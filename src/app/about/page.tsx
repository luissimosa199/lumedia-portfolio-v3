import ContactLink from "@/components/ContactLink";
import TechStack from "@/components/TechStack";
import { faGithub, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

const About = () => {
  return (
    <div>
      <section className="w-full bg-white dark:bg-violet-950 border-black p-12 rounded-3xl shadow-md mb-4">
        <h2 className="text-slate-500 text-sm">Luis Simosa</h2>
        <div className="border-2 rounded-full w-48 h-48 mx-auto mb-4">
          <Image
            src="/lumedia-logo.png"
            className="object-cover"
            alt="logo"
            width={192}
            height={192}
          />
        </div>
        <div className="flex justify-between">
          <div>
            <h3 className="text-4xl font-semibold text-center my-8 dark:text-slate-200">
              Apasionado por construir herramientas{" "}
              <span className="underline">útiles.</span>
            </h3>
          </div>
        </div>
        <p className=" dark:text-slate-300 text-lg text-center">
          Desarrollador de software interesado en crear, construir y mejorar.
        </p>
      </section>

      <div className="flex gap-2">
        <section className="w-fit bg-white dark:bg-violet-950 border-black p-4 rounded-3xl shadow-md mb-4">
          <div className="flex justify-between mb-2">
            <div>
              <h2 className="text-slate-500 text-sm">Contactame</h2>
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
        <section className="w-full bg-white dark:bg-violet-950 border-black p-4 rounded-3xl shadow-md mb-4">
          <div className="flex justify-between mb-2">
            <div>
              <h2 className="text-slate-500 text-sm">Familiarizado con:</h2>
            </div>
          </div>
          <div>
            <TechStack />
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
