import { readdir, rm, cp } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = resolve(fileURLToPath(import.meta.url), "../..");
const demosDir = join(root, "src", "demos");
const outRoot = join(root, "dist");

let slugs = [];
try {
  slugs = (await readdir(demosDir, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => !name.startsWith("_"));
} catch {
  console.log("No demos directory found, skipping demo builds.");
  process.exit(0);
}

if (slugs.length === 0) {
  console.log("No demos found, skipping demo builds.");
  process.exit(0);
}

for (const slug of slugs) {
  const base = `/demos/${slug}/`;
  console.log(`\nBuilding demo: ${slug} (base ${base})`);
  execSync(`pnpm --filter demo-${slug} exec astro build --base ${base}`, {
    stdio: "inherit",
    cwd: root,
  });
  const from = join(demosDir, slug, "dist");
  const to = join(outRoot, "demos", slug);
  await rm(to, { recursive: true, force: true });
  await cp(from, to, { recursive: true });
  console.log(`  collected → dist/demos/${slug}/`);
}

console.log("\nAll demos built and collected into dist/demos/.");
