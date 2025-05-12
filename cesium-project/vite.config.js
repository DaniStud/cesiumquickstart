import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000, // Optional: Set a specific port
  },
  base: '/', // Ensure correct base path for assets
});