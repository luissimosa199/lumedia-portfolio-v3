import {spawn} from "node:child_process";
import {getTestDatabaseUrl} from "./test-database-env.mjs";

let databaseUrl;
try {
  databaseUrl = getTestDatabaseUrl();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
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
