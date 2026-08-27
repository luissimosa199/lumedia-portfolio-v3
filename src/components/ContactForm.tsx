"use client";

import React, { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { handleForm } from "@/app/contact/handleForm";

const SubmitButton = () => {
  const { pending } = useFormStatus();
  const t = useTranslations("contact");

  return (
    <button
      type="submit"
      className="shadow-sm md:w-1/4 md:self-center rounded-full bg-violet-700 py-4 px-8 text-md text-white uppercase lg:hover:scale-105 transition-all active:opacity-75"
      disabled={pending}
    >
      {pending ? t("sending") : t("send")} <span className="text-xl">→</span>
    </button>
  );
};

const ContactForm = () => {
  const t = useTranslations("contact");
  const formRef = useRef<HTMLFormElement | null>(null);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof handleForm>
  > | null>(null);

  return (
    <section className="w-full bg-white dark:bg-violet-950 border-black p-4 rounded-3xl shadow-md mb-4">
      <div className="flex flex-col justify-between p-4">
        <div>
          <h2 className="text-slate-500 text-sm">{t("title")}</h2>
          <h3 className="text-lg font-semibold my-4 dark:text-slate-200">
            {t("intro")}
          </h3>
        </div>
        <form
          ref={formRef}
          action={async (formData) => {
            const response = await handleForm(formData, {
              messages: {
                success: t("success"),
                failure: t("failure"),
              },
            });
            setResult(response);
            if (response) {
              if (response.ok) {
                formRef.current?.reset();
              }
            }
          }}
          className="flex flex-col gap-6"
        >
          <input
            type="text"
            name="name"
            placeholder={t("namePlaceholder")}
            className="rounded-lg border p-4 w-full bg-slate-100"
          />
          <input
            type="email"
            name="email"
            placeholder={t("emailPlaceholder")}
            className="rounded-lg border p-4 w-full bg-slate-100"
          />
          <textarea
            rows={5}
            name="message"
            placeholder={t("messagePlaceholder")}
            className="rounded-lg border p-4 w-full bg-slate-100"
          />
          <SubmitButton />
          {result ? (
            <p role="alert" className="text-center" aria-live="polite">
              {result.message}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
};

export default ContactForm;
