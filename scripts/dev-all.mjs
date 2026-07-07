import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(import.meta.url), "../..");
const restaurants = JSON.parse(
  await readFile(join(root, "src/data/restaurants.json"), "utf8"),
);

const galleryPort = 4321;
const demoPorts = {};
restaurants.forEach((r, i) => {
  demoPorts[r.slug] = galleryPort + 1 + i;
});

const procs = [];
let shuttingDown = false;

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const p of procs) {
    try {
      p.kill("SIGTERM");
    } catch {}
  }
  process.exit(code ?? 0);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

// Start each demo on its own port.
for (const r of restaurants) {
  const port = demoPorts[r.slug];
  const cwd = join(root, "src/demos", r.slug);
  const p = spawn("pnpm", ["exec", "astro", "dev", "--port", String(port), "--host"], {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, FORCE_COLOR: "1" },
  });
  procs.push(p);
  p.stdout.on("data", (d) => process.stdout.write(`[${r.slug}] ${d}`));
  p.stderr.on("data", (d) => process.stderr.write(`[${r.slug}] ${d}`));
  p.on("exit", (code) => {
    if (!shuttingDown) {
      console.error(`[${r.slug}] exited (code ${code})`);
      shutdown(code ?? 1);
    }
  });
}

// Start the gallery with proxy env so cards resolve to the demo dev servers.
const env = {
  ...process.env,
  DEMO_PORTS: JSON.stringify(demoPorts),
};
const gallery = spawn("pnpm", ["exec", "astro", "dev", "--port", String(galleryPort), "--host"], {
  cwd: root,
  stdio: ["ignore", "pipe", "pipe"],
  env,
});
procs.push(gallery);
gallery.stdout.on("data", (d) => process.stdout.write(`[gallery] ${d}`));
gallery.stderr.on("data", (d) => process.stderr.write(`[gallery] ${d}`));
gallery.on("exit", (code) => {
  if (!shuttingDown) {
    console.error(`[gallery] exited (code ${code})`);
    shutdown(code ?? 1);
  }
});

console.log("Starting gallery + demos. Gallery: http://localhost:4321");
for (const r of restaurants) {
  console.log(`  ${r.slug}: http://localhost:${demoPorts[r.slug]} (proxied at /demos/${r.slug}/)`);
}
console.log("Ctrl+C to stop all.\n");
