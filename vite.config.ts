import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/highschool/',  // Docker 배포 시 서브 경로 설정
});

