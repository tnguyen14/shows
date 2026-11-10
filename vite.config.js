import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

function apiProxy(target, prefix) {
  return {
    target,
    changeOrigin: true,
    rewrite: (path) => path.replace(prefix, ""),
    configure: (proxy) => {
      // the APIs reject unknown origins; drop the localhost Origin header
      proxy.on("proxyReq", (proxyReq) => proxyReq.removeHeader("origin"));
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [svelte()],
  server: {
    proxy: {
      "/api/sheets": apiProxy(
        "https://sheets.cloud.tridnguyen.com",
        /^\/api\/sheets/,
      ),
      "/api/thirdparty": apiProxy(
        "https://thirdparty.cloud.tridnguyen.com",
        /^\/api\/thirdparty/,
      ),
    },
  },
});
