"use client";
import React, { useRef } from "react";
import { useFormStatus } from "react-dom";
import { handleForm } from "./handleForm";

const Contact = () => {
  const { pending } = useFormStatus();
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <section className="w-full bg-white dark:bg-violet-950 border-black p-4 rounded-3xl shadow-md mb-4">
      <div className="flex flex-col justify-between p-4">
        <div>
          <h2 className="text-slate-500 text-sm">Contacto</h2>
          <h3 className="text-lg font-semibold my-4 dark:text-slate-200">
            Puedes contactarme a través de este formulario o enviando un correo
            a <b>simosa37@gmail.com</b>
          </h3>
        </div>
        <form
          ref={formRef}
          action={async (formData) => {
            const response = await handleForm(formData);
            if (response) {
              formRef.current?.reset();
            }
          }}
          className="flex flex-col gap-6"
        >
          <input
            type="text"
            name="name"
            placeholder="Tu nombre"
            className="rounded-lg border p-4 w-full bg-slate-100"
          />
          <input
            type="email"
            name="email"
            placeholder="Tu email"
            className="rounded-lg border p-4 w-full bg-slate-100"
          />
          <textarea
            rows={5}
            name="message"
            placeholder="Tu mensaje"
            className="rounded-lg border p-4 w-full bg-slate-100"
          />
          <button
            type="submit"
            className="shadow-sm md:w-1/4 md:self-center rounded-full bg-violet-700 py-4 px-8 text-md text-white uppercase lg:hover:scale-105 transition-all active:opacity-75"
          >
            {pending ? "Enviando..." : "Enviar"}{" "}
            <span className="text-xl">→</span>
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
