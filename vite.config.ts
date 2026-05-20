import { defineConfig } from 'vite';

export default defineConfig({
  base: '/phonetic-to-hangul/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
