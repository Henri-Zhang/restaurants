import { defineConfig } from "astro/config";

import { defineConfig } from "astro/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL(".", import.meta.url));
const restaurants = JSON.parse(
  readFileSync(join(root, "src/data/restaurants.json"), "utf8"),
);

// In `pnpm dev:all`, each demo runs on its own port and the gallery proxies
// /demos/{slug}/* to it. DEMO_PORTS is a JSON map of slug -> port.
const demoPorts = (() => {
  try {
    return JSON.parse(process.env.DEMO_PORTS ?? "{}");
  } catch {
    return {};
  }
})();

const proxy = {};
for (const r of restaurants) {
  const port = demoPorts[r.slug];
  if (!port) continue;
  const prefix = `/demos/${r.slug}`;
  proxy[`${prefix}`] = {
    target: `http://localhost:${port}`,
    changeOrigin: true,
    rewrite: (path) => path.replace(new RegExp(`^${prefix}`), ""),
  };
}

export default defineConfig({
  site: "https://restaurants.demos",
  devToolbar: { enabled: false },
  vite: { server: { proxy } },
});
