import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['thirdweb', 'thirdweb/react'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress annotation warnings from thirdweb
        if (warning.code === 'ANNOTATION' || warning.message?.includes('@__PURE__')) {
          return;
        }
        warn(warning);
      },
    },
  },
  define: {
    // Polyfill for Node.js globals
    'process.env': {},
  },
}));
