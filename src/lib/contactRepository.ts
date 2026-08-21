import type { Pool } from "pg";
import { getPostgresPool } from "@/lib/postgresPool";
import type { ContactInput, ContactRow } from "@/lib/contactSchema";

export interface ContactRepository {
  insertContact(contact: ContactInput): Promise<ContactRow>;
}

export function createContactRepository(pool: Pool = getPostgresPool()): ContactRepository {
  return {
    async insertContact(contact) {
      const result = await pool.query<ContactRow>(
        `INSERT INTO contactforms (name, email, message, origin)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, message, origin, created_at, updated_at`,
        [contact.name, contact.email, contact.message, contact.origin]
      );

      return result.rows[0];
    },
  };
}

export const contactRepository: ContactRepository = {
  insertContact(contact) {
    return createContactRepository().insertContact(contact);
  },
};
