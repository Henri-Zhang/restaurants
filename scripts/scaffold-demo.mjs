import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(import.meta.url), "../..");
const data = JSON.parse(
  await readFile(join(root, "src/data/restaurants.json"), "utf8"),
);
const demosDir = join(root, "src", "demos");

function pkgJson(r) {
  return (
    JSON.stringify(
      {
        name: `demo-${r.slug}`,
        type: "module",
        version: "0.0.1",
        private: true,
        scripts: {
          dev: "astro dev",
          build: "astro build",
          preview: "astro preview",
          astro: "astro",
        },
        dependencies: { astro: "^5.13.0" },
      },
      null,
      2,
    ) + "\n"
  );
}

function astroConfig() {
  return `import { defineConfig } from "astro/config";

export default defineConfig({
  devToolbar: { enabled: false },
});
`;
}

function tsconfig() {
  return (
    JSON.stringify(
      {
        extends: "astro/tsconfigs/strict",
        include: [".astro/types.d.ts", "**/*"],
        exclude: ["dist"],
      },
      null,
      2,
    ) + "\n"
  );
}

function gitignore() {
  return "dist/\n.astro/\nnode_modules/\n";
}

function demoPage(r) {
  return `---
// ${r.name} — standalone demo (placeholder)
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${r.name}</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .wrap { text-align: center; padding: 40px; }
      .emoji { font-size: 88px; }
      h1 { margin: 16px 0 8px; font-size: 40px; }
      p { margin: 0; opacity: 0.85; font-size: 18px; }
      .back {
        display: inline-block;
        margin-top: 28px;
        padding: 10px 20px;
        border: 1px solid rgba(255, 255, 255, 0.6);
        border-radius: 999px;
        color: #fff;
        text-decoration: none;
        font-size: 14px;
      }
      .back:hover { background: rgba(255, 255, 255, 0.15); }
    </style>
  </head>
  <body style="background:${r.gradient};">
    <div class="wrap">
      <div class="emoji">${r.emoji}</div>
      <h1>${r.name}</h1>
      <p>This demo is a standalone Astro project. Edit the files here, then copy this folder out to deliver.</p>
      <a class="back" href="/">← Back to gallery</a>
    </div>
  </body>
</html>
`;
}

for (const r of data) {
  const dir = join(demosDir, r.slug);
  if (existsSync(dir)) {
    console.log(`skip   ${r.slug} (already exists)`);
    continue;
  }
  await mkdir(join(dir, "src/pages"), { recursive: true });
  await writeFile(join(dir, "package.json"), pkgJson(r));
  await writeFile(join(dir, "astro.config.mjs"), astroConfig());
  await writeFile(join(dir, "tsconfig.json"), tsconfig());
  await writeFile(join(dir, ".gitignore"), gitignore());
  await writeFile(join(dir, "src/pages/index.astro"), demoPage(r));
  console.log(`create ${r.slug}`);
}

console.log("\nDone. Demos live in src/demos/{slug}/ — each is an independent Astro project.");
