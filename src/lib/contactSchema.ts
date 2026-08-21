export const CONTACT_ORIGIN = "portfolio";

export interface ContactInput {
  name: string;
  email: string;
  message: string;
  origin: string;
}

export interface ContactRow extends ContactInput {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export function isContactInput(value: ContactInput): boolean {
  return (
    value.name.trim().length > 0 &&
    value.email.trim().length > 0 &&
    value.message.trim().length > 0 &&
    value.origin.trim().length > 0
  );
}
