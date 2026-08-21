import type { ContactInput } from "@/lib/contactSchema";
import { contactRepository, type ContactRepository } from "@/lib/contactRepository";

export interface ContactEmailSender {
  send(contact: ContactInput): Promise<void>;
}

interface SesClient {
  send(command: unknown): Promise<unknown>;
}

export interface ContactServiceDependencies {
  repository?: ContactRepository;
  emailSender?: ContactEmailSender;
}

const destination = "simosa37@gmail.com";
const senderAddress = "doxacontacts01@gmail.com";

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character
  );
}

export function createSesEmailSender(
  injectedClient?: SesClient
): ContactEmailSender {
  return {
    async send(contact) {
      const { SESv2Client, SendEmailCommand } = await import(
        "@aws-sdk/client-sesv2"
      );
      const client =
        injectedClient ??
        new SESv2Client({
          region: "us-east-2",
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
          },
        });
      const name = escapeHtml(contact.name);
      const email = escapeHtml(contact.email);
      const message = escapeHtml(contact.message);
      const text = `Recibiste un contacto desde el portafolio\n\nDe: ${contact.name}\nEmail: ${contact.email}\nMensaje: ${contact.message}`;
      const html = `<div><h1>Recibiste un contacto desde el portafolio</h1><ul><li>De: ${name}</li><li>Email: ${email}</li><li>${message}</li></ul></div>`;

      await client.send(
        new SendEmailCommand({
          Destination: { ToAddresses: [destination] },
          Content: {
            Simple: {
              Subject: { Data: "Test Email", Charset: "UTF-8" },
              Body: {
                Text: { Data: text, Charset: "UTF-8" },
                Html: { Data: html, Charset: "UTF-8" },
              },
            },
          },
          FromEmailAddress: senderAddress,
        })
      );
    },
  };
}

export function createContactService({
  repository = contactRepository,
  emailSender = createSesEmailSender(),
}: ContactServiceDependencies = {}) {
  return {
    async submit(contact: ContactInput) {
      const savedContact = await repository.insertContact(contact);
      await emailSender.send(contact);
      return savedContact;
    },
  };
}
