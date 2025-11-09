import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import UnocssPlugin from "@unocss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    solidPlugin(),
    UnocssPlugin({
      // your config or in uno.config.ts
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
    rollupOptions: {},
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../core/src/shared"),
      "@articles": path.resolve(__dirname, "../core/src/modules/articles"),
      "@authors": path.resolve(__dirname, "../core/src/modules/authors"),
      "@chapters": path.resolve(__dirname, "../core/src/modules/chapters"),
    },
  },
});
