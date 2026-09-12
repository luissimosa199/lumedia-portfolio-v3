/** Resolve the database reserved for destructive integration-test setup. */
export function getTestDatabaseUrl(env = process.env) {
  const value = env.TEST_DATABASE_URL?.trim();
  if (!value) {
    throw new Error("Missing TEST_DATABASE_URL; refusing to use DATABASE_URL or DB_URL for tests.");
  }
  return value;
}
