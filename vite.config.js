import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  publicDir: false,
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 've-chung-toi/index.html'),
        services: resolve(__dirname, 'dich-vu/index.html'),
      },
    },
  },
});
