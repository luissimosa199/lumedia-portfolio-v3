const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (testDatabaseUrl) {
  const parsed = new URL(testDatabaseUrl);
  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("TEST_DATABASE_URL must be a PostgreSQL URL.");
  }

  const databaseName = parsed.pathname.slice(1).toLowerCase();
  if (!databaseName || !/(^|[_-])test(s|ing)?($|[_-])/.test(databaseName)) {
    throw new Error(
      `Refusing to run against database "${databaseName || "(missing)"}"; its name must explicitly contain test.`
    );
  }

  process.env.DB_URL = testDatabaseUrl;
  delete process.env.DEV_DATABASE_URL;
}
