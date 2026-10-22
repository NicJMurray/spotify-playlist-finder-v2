import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.resolve(root, "dist");

if (path.relative(root, output) !== "dist") {
  throw new Error("Build output must be the repository's dist directory.");
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

// Only browser assets are public. Wrangler compiles root functions separately.
for (const entry of ["index.html", "styles.css", "src"]) {
  await cp(path.join(root, entry), path.join(output, entry), { recursive: true });
}

console.log("Built public browser assets in dist/.");
