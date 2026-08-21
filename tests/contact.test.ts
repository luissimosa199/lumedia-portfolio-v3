import assert from "node:assert/strict";
import { handleForm } from "../src/app/contact/handleForm";
import { createContactRepository } from "../src/lib/contactRepository";
import { createSesEmailSender } from "../src/lib/contactService";
import { getPostgresPool } from "../src/lib/postgresPool";

const pool = getPostgresPool();
const repository = createContactRepository(pool);
const testEmail = `contact-test-${Date.now()}@example.com`;
const testContact = {
  name: "Ada Lovelace",
  email: testEmail,
  message: "PostgreSQL contact integration test",
};

function createFormData() {
  const formData = new FormData();
  formData.set("name", testContact.name);
  formData.set("email", testContact.email);
  formData.set("message", testContact.message);
  return formData;
}

async function persistsContactInPostgres() {
  const result = await handleForm(createFormData(), {
    repository,
    emailSender: { send: async () => undefined },
  });

  assert.deepEqual(result, {
    ok: true,
    message: "Mensaje enviado correctamente.",
  });

  const saved = await pool.query<{
    name: string;
    email: string;
    message: string;
    origin: string;
  }>(
    `SELECT name, email, message, origin
     FROM contactforms
     WHERE email = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [testContact.email]
  );

  assert.equal(saved.rows.length, 1);
  assert.deepEqual(saved.rows[0], {
    ...testContact,
    origin: "portfolio",
  });
}

async function sendsSesEmail() {
  let sentCommand: { input?: Record<string, unknown> } | undefined;
  const result = await handleForm(createFormData(), {
    repository,
    emailSender: createSesEmailSender({
      send: async (command) => {
        sentCommand = command as { input?: Record<string, unknown> };
      },
    }),
  });

  assert.equal(result.ok, true);
  assert.ok(sentCommand);
  assert.deepEqual(sentCommand.input, {
    Destination: { ToAddresses: ["simosa37@gmail.com"] },
    Content: {
      Simple: {
        Subject: { Data: "Test Email", Charset: "UTF-8" },
        Body: {
          Text: {
            Data: `Recibiste un contacto desde el portafolio\n\nDe: ${testContact.name}\nEmail: ${testContact.email}\nMensaje: ${testContact.message}`,
            Charset: "UTF-8",
          },
          Html: {
            Data: `<div><h1>Recibiste un contacto desde el portafolio</h1><ul><li>De: ${testContact.name}</li><li>Email: ${testContact.email}</li><li>${testContact.message}</li></ul></div>`,
            Charset: "UTF-8",
          },
        },
      },
    },
    FromEmailAddress: "doxacontacts01@gmail.com",
  });
}

const tests: Record<string, () => Promise<void>> = {
  "persists contact in PostgreSQL": persistsContactInPostgres,
  "sends SES email": sendsSesEmail,
};

async function main() {
  const patternArgument = process.argv.find((argument) =>
    argument.startsWith("--test-name-pattern=")
  );
  const pattern = patternArgument?.slice("--test-name-pattern=".length);
  const selectedTests = Object.entries(tests).filter(([name]) =>
    pattern ? new RegExp(pattern).test(name) : true
  );

  try {
    for (const [name, test] of selectedTests) {
      await test();
      console.log(`passed: ${name}`);
    }
    console.log(`Contact tests passed (${selectedTests.length}).`);
  } finally {
    await pool.query("DELETE FROM contactforms WHERE email = $1", [testEmail]);
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Contact tests failed");
  process.exitCode = 1;
});
