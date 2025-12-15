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
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    chunkSizeWarningLimit: 3000,
    minify: mode === 'production' ? 'esbuild' : false,
    sourcemap: mode !== 'production',
    rollupOptions: {
      external: [
        // Externalize Node.js-only @turnkey modules
        /node_modules\/@turnkey\/.*\/dist\/nodecrypto\.mjs/,
      ],
      onwarn(warning, warn) {
        // Suppress various warnings from thirdweb and dependencies
        if (
          warning.code === 'ANNOTATION' ||
          warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
          warning.message?.includes('@__PURE__') ||
          warning.message?.includes('#__PURE__') ||
          warning.message?.includes('externalized for browser compatibility') ||
          warning.message?.includes('createPrivateKey') ||
          warning.message?.includes('createSign')
        ) {
          return;
        }
        warn(warning);
      },
      output: {
        manualChunks(id) {
          // Split large dependencies into chunks
          if (id.includes('node_modules')) {
            if (id.includes('thirdweb')) return 'vendor-thirdweb';
            if (id.includes('wagmi') || id.includes('viem')) return 'vendor-wagmi';
            if (id.includes('react-dom')) return 'vendor-react-dom';
            if (id.includes('react-router')) return 'vendor-react-router';
            if (id.includes('@radix-ui')) return 'vendor-radix';
            if (id.includes('framer-motion')) return 'vendor-motion';
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
