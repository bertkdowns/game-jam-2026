import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: true,
    port: 5173,
  },


  build: {
    target: 'esnext',
    commonjsOptions: {
      include: [],
      transformMixedEsModules: false
    },
    rollupOptions: {
      treeshake: {
      moduleSideEffects: id =>
        id.includes("inkjs") || id.includes("src")
    }
  }
  },
  optimizeDeps: {
    //include: ["inkjs", "inkjs/compiler/Compiler", "inkjs/engine/Choice"], 

    esbuildOptions: {
      target: 'esnext',
    }
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
   base: './',
});
