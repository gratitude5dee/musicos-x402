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
      // Stub Node.js crypto modules for browser compatibility
      "@turnkey/api-key-stamper/dist/nodecrypto.mjs": path.resolve(__dirname, "./src/stubs/turnkey-nodecrypto.ts"),
      "@turnkey/viem/node_modules/@turnkey/api-key-stamper/dist/nodecrypto.mjs": path.resolve(__dirname, "./src/stubs/turnkey-nodecrypto.ts"),
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
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress annotation warnings from thirdweb and other packages
        if (
          warning.code === 'ANNOTATION' ||
          warning.message?.includes('@__PURE__') ||
          warning.message?.includes('#__PURE__') ||
          warning.message?.includes('externalized for browser compatibility')
        ) {
          return;
        }
        warn(warning);
      },
      output: {
        manualChunks: {
          'vendor-thirdweb': ['thirdweb'],
          'vendor-wagmi': ['wagmi', 'viem'],
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
        },
      },
    },
  },
  define: {
    // Polyfill for Node.js globals
    'process.env': {},
  },
}));
