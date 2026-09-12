import {spawn} from "node:child_process";

const names = ["TEST_DATABASE_URL", "DATABASE_URL", "DB_URL"];
const configured = names.filter((name) => process.env[name]);

if (configured.length === 0) {
  console.error(`Missing test database configuration: set one of ${names.join(", ")}.`);
  process.exit(1);
}

const values = new Set(configured.map((name) => process.env[name]));
if (values.size !== 1) {
  console.error(`Conflicting test database configuration: ${configured.join(", ")} must identify the same database.`);
  process.exit(1);
}

const databaseUrl = process.env[configured[0]];
const vitestBin = new URL("../node_modules/vitest/vitest.mjs", import.meta.url);
const child = spawn(process.execPath, [vitestBin.pathname, "run", ...process.argv.slice(2)], {
  cwd: process.cwd(),
  env: {...process.env, DB_URL: databaseUrl, NODE_ENV: "test"},
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(`Unable to start the test runner: ${error.message}`);
  process.exit(1);
});
child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
