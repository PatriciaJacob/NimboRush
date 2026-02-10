import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname),
  publicDir: resolve(__dirname, '../public'),
  server: {
    port: 8081,
    open: true,
    fs: {
      // Allow serving files from the parent src folder
      allow: [resolve(__dirname, '..')],
    },
  },
  build: {
    outDir: resolve(__dirname, '../dist-editor'),
    emptyOutDir: true,
  },
});
