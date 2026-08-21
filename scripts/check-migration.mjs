import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const sourceRoot = join(root, "src");
const manifestPaths = ["package.json", "package-lock.json"];
const legacyFiles = [
  "src/lib/dbConnect.ts",
  "src/lib/projectModel.ts",
  "src/lib/contactFormModel.ts",
  "src/utils/mongoDbPromise.ts",
];
const forbiddenSymbols = [
  "MONGODB_URL",
  "MONGODB_URI",
  "mongoose",
  "@typegoose/typegoose",
  "mongodb",
  "MongoDB",
  "MongoClient",
  "Typegoose",
];
const sourceExtensions = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"]);

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => (left.name < right.name ? -1 : left.name > right.name ? 1 : 0))
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        return sourceFiles(path);
      }

      const extension = entry.name.slice(entry.name.lastIndexOf("."));
      return sourceExtensions.has(extension) ? [path] : [];
    });
}

function lineNumberAt(text, index) {
  return text.slice(0, index).split("\n").length;
}

const errors = [];
if (!existsSync(sourceRoot)) {
  errors.push("src must exist");
}

const applicationFiles = existsSync(sourceRoot) ? sourceFiles(sourceRoot) : [];
const manifestFiles = manifestPaths.map((path) => join(root, path));
for (const file of manifestFiles) {
  if (!existsSync(file)) {
    errors.push(`${relative(root, file)} must exist`);
  }
}
const scannedFiles = [
  ...applicationFiles,
  ...manifestFiles.filter((file) => existsSync(file)),
];

for (const file of scannedFiles) {
  const contents = readFileSync(file, "utf8");
  const displayPath = relative(root, file);
  const normalizedContents = contents.toLowerCase();

  for (const symbol of forbiddenSymbols) {
    const index = normalizedContents.indexOf(symbol.toLowerCase());
    if (index !== -1) {
      errors.push(`${displayPath}:${lineNumberAt(contents, index)} contains ${symbol}`);
    }
  }
}

for (const file of legacyFiles) {
  if (existsSync(join(root, file))) {
    errors.push(`${file} must be removed`);
  }
}

if (!applicationFiles.some((file) => /\bDB_URL\b/.test(readFileSync(file, "utf8")))) {
  errors.push("application source must reference DB_URL");
}

if (errors.length > 0) {
  console.error("Migration check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Migration check passed: scanned ${applicationFiles.length} source files and ${manifestFiles.length} manifests.`
  );
}
