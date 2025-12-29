
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // نتحقق من وجود المفتاح تحت مسمى API_KEY أو api لضمان عمل تطبيق المستخدم
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || process.env.api || "")
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
  }
});
