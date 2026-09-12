import {describe, expect, it} from "vitest";
import {getTestDatabaseUrl} from "../scripts/test-database-env.mjs";

describe("test database environment", () => {
  it("uses the explicit test database only", () => {
    expect(getTestDatabaseUrl({TEST_DATABASE_URL: "postgres://test-db"})).toBe("postgres://test-db");
    expect(getTestDatabaseUrl({TEST_DATABASE_URL: " postgres://test-db "})).toBe("postgres://test-db");
  });

  it("refuses application database variables when TEST_DATABASE_URL is absent", () => {
    expect(() => getTestDatabaseUrl({DATABASE_URL: "postgres://app"})).toThrow("TEST_DATABASE_URL");
    expect(() => getTestDatabaseUrl({DB_URL: "postgres://app"})).toThrow("TEST_DATABASE_URL");
  });

  it("ignores fallback variables when the explicit test database is present", () => {
    expect(getTestDatabaseUrl({TEST_DATABASE_URL: "postgres://test-db", DATABASE_URL: "postgres://app", DB_URL: "postgres://other"})).toBe("postgres://test-db");
  });
});
