import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Only tag components during dev-server sessions (avoids heavy work during builds)
    command === "serve" && mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Properly stub the Node.js crypto modules used by @turnkey
      "node:crypto": path.resolve(__dirname, "./src/stubs/node-crypto.ts"),
    },
  },
  optimizeDeps: {
    include: ['thirdweb', 'thirdweb/react'],
    exclude: ['@turnkey/api-key-stamper', '@turnkey/viem'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    target: "esnext",
    cssCodeSplit: false,
    modulePreload: false,
    assetsInlineLimit: 0,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // Keep dev builds lightweight to avoid Node OOM in constrained environments
    reportCompressedSize: false,
    chunkSizeWarningLimit: 5000,
    minify: false, // Disable minification entirely to reduce memory
    sourcemap: false,
    // Reduce memory during chunk rendering
    rollupOptions: {
      treeshake: false, // Disable tree-shaking to reduce memory
      maxParallelFileOps: 1, // Single file at a time
      cache: false, // Disable caching to reduce memory
      external: [
        // Externalize Node.js-only @turnkey modules
        /node_modules\/\@turnkey\/.*\/dist\/nodecrypto\.mjs/,
      ],
      onwarn(warning, warn) {
        // Suppress various warnings from thirdweb and dependencies
        if (
          warning.code === "ANNOTATION" ||
          warning.code === "MODULE_LEVEL_DIRECTIVE" ||
          warning.message?.includes("@__PURE__") ||
          warning.message?.includes("#__PURE__") ||
          warning.message?.includes("externalized for browser compatibility") ||
          warning.message?.includes("createPrivateKey") ||
          warning.message?.includes("createSign")
        ) {
          return;
        }
        warn(warning);
      },
      output: {
        // Aggressive chunk splitting to reduce memory during rendering
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            // Split thirdweb into smaller chunks
            if (id.includes("thirdweb/dist/esm/wallets")) return "vendor-tw-wallets";
            if (id.includes("thirdweb/dist/esm/react")) return "vendor-tw-react";
            if (id.includes("thirdweb")) return "vendor-tw-core";
            if (id.includes("wagmi")) return "vendor-wagmi";
            if (id.includes("viem")) return "vendor-viem";
            if (id.includes("react-dom")) return "vendor-react-dom";
            if (id.includes("react-router")) return "vendor-react-router";
            if (id.includes("@radix-ui")) return "vendor-radix";
            if (id.includes("framer-motion")) return "vendor-motion";
            if (id.includes("@tanstack")) return "vendor-tanstack";
            if (id.includes("recharts") || id.includes("d3")) return "vendor-charts";
            if (id.includes("@supabase")) return "vendor-supabase";
            if (id.includes("lucide")) return "vendor-icons";
            return "vendor-misc";
          }
        },
      },
    },
  },
  define: {
    // Polyfill for Node.js globals
    'process.env': {},
    global: 'globalThis',
  },
}));
