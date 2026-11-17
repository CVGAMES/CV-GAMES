import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ command }) => {
  if (command === 'build') {
    process.env.NODE_ENV = 'production';
  }
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      outDir: 'public-build',
      emptyOutDir: true,
      target: 'es2022',
      chunkSizeWarningLimit: 650,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'react-vendor',
                test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
                priority: 20,
              },
              {
                name: 'three-vendor',
                test: /[\\/]node_modules[\\/]three[\\/]/,
                priority: 15,
              },
              {
                name: 'chess-vendor',
                test: /[\\/]node_modules[\\/]chess\.js[\\/]/,
                priority: 10,
              },
            ],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
