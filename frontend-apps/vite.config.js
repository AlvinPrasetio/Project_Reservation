import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/layanan': 'http://localhost:5000',
      // add other API routes if needed
    }
  }
});
