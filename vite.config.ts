import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/highschool/',  // Docker 배포 시 서브 경로 설정

  build: {
    // Generate hashed filenames for cache busting
    rollupOptions: {
      output: {
        // Add hash to all asset filenames
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Always generate manifest for tracking file changes
    manifest: true,
    // Clear output directory before build
    emptyOutDir: true,
  },
});

