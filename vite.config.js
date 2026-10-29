import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'out',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 've-chung-toi/index.html'),
        services: resolve(__dirname, 'dich-vu/index.html'),
        serviceWebsite: resolve(__dirname, 'dich-vu/thiet-ke-website/index.html'),
        serviceGoogleAds: resolve(__dirname, 'dich-vu/google-ads/index.html'),
        serviceMetaAds: resolve(__dirname, 'dich-vu/meta-ads/index.html'),
        serviceFanpage: resolve(__dirname, 'dich-vu/cham-soc-fanpage/index.html'),
        serviceBrandIdentity: resolve(__dirname, 'dich-vu/nhan-dien-thuong-hieu/index.html'),
        serviceGoogleBusiness: resolve(__dirname, 'dich-vu/google-business/index.html'),
        serviceSeoGoogle: resolve(__dirname, 'dich-vu/seo-google/index.html'),
        privacyPolicy: resolve(__dirname, 'chinh-sach-bao-mat/index.html'),
        careers: resolve(__dirname, 'tuyen-dung/index.html'),
        contact: resolve(__dirname, 'lien-he/index.html'),
        blog: resolve(__dirname, 'blog/index.html'),
      },
    },
  },
});
