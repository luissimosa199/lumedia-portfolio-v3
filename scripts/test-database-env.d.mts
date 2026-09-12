export function getTestDatabaseUrl(env?: {
  TEST_DATABASE_URL?: string;
  [name: string]: string | undefined;
}): string;
