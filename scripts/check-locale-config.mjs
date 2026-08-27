import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf8");

const [packageJson, nextConfig, routing, request, navigation, proxy] =
  await Promise.all([
    read("package.json"),
    read("next.config.js"),
    read("src/i18n/routing.ts"),
    read("src/i18n/request.ts"),
    read("src/i18n/navigation.ts"),
    read("src/proxy.ts"),
  ]);

const packageData = JSON.parse(packageJson);

assert.ok(packageData.dependencies?.["next-intl"], "next-intl must be a runtime dependency");
assert.match(nextConfig, /require\("next-intl\/plugin"\)/);
assert.match(nextConfig, /createNextIntlPlugin\("\.\/src\/i18n\/request\.ts"\)/);

assert.match(routing, /locales:\s*\[\s*["']es["']\s*,\s*["']en["']\s*\]/);
assert.match(routing, /defaultLocale:\s*["']es["']/);
assert.match(routing, /localePrefix:\s*["']as-needed["']/);
assert.match(routing, /localeDetection:\s*false/);

assert.match(request, /getRequestConfig/);
assert.match(request, /requestLocale/);
assert.match(request, /routing\.locales\.includes/);
assert.match(request, /notFound\(\)/);
assert.match(request, /import\(`\.\/messages\/\$\{locale\}\.json`\)/);

assert.match(navigation, /createNavigation\(routing\)/);
assert.match(proxy, /next-intl\/middleware/);
assert.match(proxy, /createMiddleware\(routing\)/);
assert.match(proxy, /matcher:/);

console.log("Locale routing configuration is valid.");
