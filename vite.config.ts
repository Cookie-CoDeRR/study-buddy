import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// Custom plugin to copy 404.html to dist
const copy404Plugin = {
  name: 'copy-404',
  apply: 'build',
  generateBundle() {
    const source = fs.readFileSync(path.resolve(__dirname, 'public/404.html'), 'utf-8');
    this.emitFile({
      type: 'asset',
      fileName: '404.html',
      source,
    });
  },
};

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  return {
    base: '/study-buddy/',
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger(), copy404Plugin].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
