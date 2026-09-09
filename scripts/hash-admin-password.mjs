// Generates the value for the ADMIN_PASSWORD_HASH environment variable.
//
// Usage:
//   npm run admin:hash-password                (prompts, input hidden)
//   npm run admin:hash-password -- "secret"    (from the command line)
//
// Output format: scrypt.v1.<salt base64url>.<hash base64url>, using scrypt
// N=16384, r=8, p=1 and a 64-byte key - must stay in sync with
// src/lib/adminAuth.ts. The dot/base64url format is safe in dotenv files and
// shell environments because it contains no `$` expansion characters.

import { randomBytes, scryptSync } from "node:crypto";
import { stdin, stdout } from "node:process";
import readline from "node:readline";

function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt.v1.${salt.toString("base64url")}.${derived.toString("base64url")}`;
}

function promptHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: stdin, output: stdout, terminal: true });
    stdout.write(question);
    let muted = true;
    // readline echoes typed characters through _writeToOutput; keep the
    // password off the terminal while it is being typed.
    rl._writeToOutput = (text) => {
      if (!muted) stdout.write(text);
    };
    rl.question("", (answer) => {
      muted = false;
      rl.close();
      stdout.write("\n");
      resolve(answer);
    });
  });
}

const password = process.argv[2] ?? (await promptHidden("Admin password: "));

if (!password || password.length < 8) {
  console.error("Password must be at least 8 characters long.");
  process.exit(1);
}

console.log(`ADMIN_PASSWORD_HASH=${hashPassword(password)}`);
