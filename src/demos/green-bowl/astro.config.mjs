import { defineConfig } from "astro/config";

export default defineConfig({
  devToolbar: { enabled: false },
  // 推荐 always：统一所有路由带末尾 /，避免路径匹配混乱
  trailingSlash: "always",
});
