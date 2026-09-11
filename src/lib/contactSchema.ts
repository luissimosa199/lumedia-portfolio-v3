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

export function isContactInput(value: unknown): value is ContactInput {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.name === "string" &&
    candidate.name.trim().length > 0 &&
    typeof candidate.email === "string" &&
    candidate.email.trim().length > 0 &&
    typeof candidate.message === "string" &&
    candidate.message.trim().length > 0 &&
    typeof candidate.origin === "string" &&
    candidate.origin.trim().length > 0
  );
}
