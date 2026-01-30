import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: true,
    port: 5173,
  },
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    }
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
   base: './',
});
