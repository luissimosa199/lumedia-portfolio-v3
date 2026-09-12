import {beforeEach, describe, expect, it} from "vitest";
import "@aws-sdk/client-sesv2";
import {getPostgresPool} from "@/lib/postgresPool";
import {CONTACT_ORIGIN, isContactInput, type ContactInput} from "@/lib/contactSchema";
import {contactRepository, createContactRepository} from "@/lib/contactRepository";
import {createContactService, createSesEmailSender, type ContactEmailSender} from "@/lib/contactService";
import {handleForm} from "@/app/contact/handleForm";

class RecordingSender implements ContactEmailSender {
  contacts: ContactInput[] = [];
  async send(contact: ContactInput) { this.contacts.push({...contact}); }
}

function form(values: Record<string, string | Blob | undefined>) {
  const result = new FormData();
  for (const [key, value] of Object.entries(values)) if (value !== undefined) result.set(key, value);
  return result;
}

describe("contact submission", () => {
  beforeEach(() => getPostgresPool().query(`TRUNCATE contactforms`));

  it("validates every required field and rejects invalid forms before side effects", async () => {
    expect(isContactInput({name: " N ", email: " e ", message: " m ", origin: CONTACT_ORIGIN})).toBe(true);
    for (const contact of [
      {name: "", email: "e", message: "m", origin: CONTACT_ORIGIN},
      {name: "n", email: "   ", message: "m", origin: CONTACT_ORIGIN},
      {name: "n", email: "e", message: "\t", origin: CONTACT_ORIGIN},
      {name: "n", email: "e", message: "m", origin: ""},
    ]) expect(isContactInput(contact)).toBe(false);

    const invalidForms = [
      form({email: "e@example.test", message: "hello"}),
      form({name: "   ", email: "e@example.test", message: "hello"}),
      form({name: "Name", email: "", message: "hello"}),
      form({name: "Name", email: "e@example.test", message: "\n"}),
      form({name: new Blob(["Name"]), email: "e@example.test", message: "hello"}),
    ];
    for (const invalid of invalidForms) {
      const sender = new RecordingSender();
      expect(await handleForm(invalid, {
        repository: createContactRepository(getPostgresPool()), emailSender: sender,
        messages: {failure: "EXACT FAILURE"},
      })).toEqual({ok: false, message: "EXACT FAILURE"});
      expect(sender.contacts).toEqual([]);
    }
    expect((await getPostgresPool().query(`SELECT count(*)::int count FROM contactforms`)).rows[0].count).toBe(0);
  });

  it("persists submitted values before calling email and returns the exact success result", async () => {
    const observations: {contact: ContactInput; countAtSend: number}[] = [];
    const sender: ContactEmailSender = {async send(contact) {
      const {rows: [{count}]} = await getPostgresPool().query(`SELECT count(*)::int count FROM contactforms`);
      observations.push({contact: {...contact}, countAtSend: count});
    }};
    const result = await handleForm(form({name: "  Ada  ", email: "ada@example.test", message: " Hello <world> "}), {
      repository: createContactRepository(getPostgresPool()), emailSender: sender,
      messages: {success: "EXACT SUCCESS", failure: "EXACT FAILURE"},
    });
    expect(result).toEqual({ok: true, message: "EXACT SUCCESS"});
    const expected = {name: "  Ada  ", email: "ada@example.test", message: " Hello <world> ", origin: "portfolio"};
    expect(observations).toEqual([{contact: expected, countAtSend: 1}]);
    const {rows} = await getPostgresPool().query(`SELECT id, name, email, message, origin, created_at, updated_at FROM contactforms`);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject(expected);
    expect(rows[0].id).toMatch(/^[0-9a-f-]{36}$/);
    expect(rows[0].created_at).toBeInstanceOf(Date);
    expect(rows[0].updated_at).toBeInstanceOf(Date);
  });

  it("repository returns the persisted row and email failure leaves it persisted", async () => {
    const input = {name: "Grace", email: "grace@example.test", message: "Hi", origin: "portfolio"};
    const repository = createContactRepository(getPostgresPool());
    const saved = await contactRepository.insertContact(input);
    const queried = (await getPostgresPool().query(`SELECT * FROM contactforms WHERE id=$1`, [saved.id])).rows[0];
    expect(saved).toEqual(queried);
    expect(saved.created_at).toBeInstanceOf(Date);
    await getPostgresPool().query(`TRUNCATE contactforms`);

    const result = await handleForm(form({name: input.name, email: input.email, message: input.message}), {
      repository, emailSender: {async send() { throw new Error("email unavailable"); }},
      messages: {failure: "SEND FAILED"},
    });
    expect(result).toEqual({ok: false, message: "SEND FAILED"});
    expect((await getPostgresPool().query(`SELECT name, email, message, origin FROM contactforms`)).rows)
      .toEqual([input]);
  });

  it("constructs the exact SES envelope while escaping only HTML", async () => {
    const commands: unknown[] = [];
    const sender = createSesEmailSender({async send(command) { commands.push(command); return {}; }});
    const input = {name: `A&B <C> "D" 'E'`, email: "a&b@example.test", message: `<script>"x" & 'y'</script>`, origin: "portfolio"};
    await sender.send(input);
    expect(commands).toHaveLength(1);
    const envelope = (commands[0] as {input: Record<string, any>}).input;
    expect(envelope.Destination).toEqual({ToAddresses: ["simosa37@gmail.com"]});
    expect(envelope.FromEmailAddress).toBe("doxacontacts01@gmail.com");
    expect(envelope.Content.Simple.Subject).toEqual({Data: "Test Email", Charset: "UTF-8"});
    expect(envelope.Content.Simple.Body.Text).toEqual({
      Data: `Recibiste un contacto desde el portafolio\n\nDe: ${input.name}\nEmail: ${input.email}\nMensaje: ${input.message}`,
      Charset: "UTF-8",
    });
    expect(envelope.Content.Simple.Body.Html).toEqual({
      Data: `<div><h1>Recibiste un contacto desde el portafolio</h1><ul><li>De: A&amp;B &lt;C&gt; &quot;D&quot; &#39;E&#39;</li><li>Email: a&amp;b@example.test</li><li>&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;</li></ul></div>`,
      Charset: "UTF-8",
    });
  });
});

describe("contact service failure ordering", () => {
  it("does not call email when the real repository insert fails", async () => {
    const pool = getPostgresPool();
    await pool.query(`TRUNCATE contactforms`);
    await pool.query(`ALTER TABLE contactforms ADD CONSTRAINT contact_name_test_check CHECK (name <> 'reject-me')`);
    const sender = new RecordingSender();
    try {
      await expect(createContactService({repository: createContactRepository(pool), emailSender: sender})
        .submit({name: "reject-me", email: "e@example.test", message: "m", origin: "portfolio"})).rejects.toThrow();
      expect(sender.contacts).toEqual([]);
      expect((await pool.query(`SELECT count(*)::int count FROM contactforms`)).rows[0].count).toBe(0);
    } finally {
      await pool.query(`ALTER TABLE contactforms DROP CONSTRAINT contact_name_test_check`);
    }
  });
});
