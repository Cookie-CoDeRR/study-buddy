import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // Determine if building for GitHub Pages
  const isGitHubPages = process.env.GITHUB_PAGES === 'true' || process.env.VITE_GITHUB_PAGES === 'true';
  
  return {
    base: isGitHubPages ? '/study-buddy/' : '/',
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
