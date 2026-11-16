import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Disable HMR and Vite WebSocket server to prevent port 24678 binding/collisions
      hmr: false as const,
      ws: false as const,
      allowedHosts: true as const,
      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : { ignored: ['**/dist/**', '**/node_modules/**', '**/.git/**', '**/*.tar.gz'] },
    },
  };
});
