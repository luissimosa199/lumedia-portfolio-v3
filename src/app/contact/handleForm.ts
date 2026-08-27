"use server";

import { CONTACT_ORIGIN, isContactInput, type ContactInput } from "@/lib/contactSchema";
import {
  createContactService,
  type ContactEmailSender,
} from "@/lib/contactService";
import type { ContactRepository } from "@/lib/contactRepository";

export interface HandleFormMessages {
  success?: string;
  failure?: string;
}

export interface HandleFormDependencies {
  repository?: ContactRepository;
  emailSender?: ContactEmailSender;
  messages?: HandleFormMessages;
}

export interface ContactFormResult {
  ok: boolean;
  message: string;
}

const defaultSuccessMessage = "Mensaje enviado correctamente.";
const defaultFailureMessage = "No se pudo enviar el mensaje. Inténtalo de nuevo.";

function getText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

export const handleForm = async (
  formData: FormData,
  dependencies?: HandleFormDependencies
): Promise<ContactFormResult> => {
  const successMessage = dependencies?.messages?.success ?? defaultSuccessMessage;
  const failureMessage = dependencies?.messages?.failure ?? defaultFailureMessage;

  const contact: ContactInput = {
    name: getText(formData, "name"),
    email: getText(formData, "email"),
    message: getText(formData, "message"),
    origin: CONTACT_ORIGIN,
  };

  if (!isContactInput(contact)) {
    return { ok: false, message: failureMessage };
  }

  try {
    await createContactService(dependencies).submit(contact);
    return { ok: true, message: successMessage };
  } catch {
    return { ok: false, message: failureMessage };
  }
};
