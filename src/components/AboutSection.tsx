import React from "react";
import Button from "./Button";

const AboutSection = () => {
  return (
    <section className="w-full bg-white dark:bg-violet-950 border-black p-4 rounded-3xl shadow-md mb-4">
      <div className="flex justify-between">
        <div>
          <h2 className="text-slate-500 text-sm">Luis Simosa</h2>
          <h3 className="text-2xl font-semibold my-4 dark:text-slate-200">
            Hola, me llamo Luis
          </h3>
        </div>
        <div className="border-2 rounded-full w-24 h-24"></div>
      </div>
      <p className=" dark:text-slate-300 ">
        Desarrollador de software interesado en aprender, construir y mejorar.
      </p>
      <Button href="/about" />
    </section>
  );
};

export default AboutSection;
