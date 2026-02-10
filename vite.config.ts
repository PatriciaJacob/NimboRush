import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  root: '.',
  plugins: [tailwindcss()],
  server: {
    port: 8080,
    open: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
