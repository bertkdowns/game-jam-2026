import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    viteStaticCopy({
      targets: [
        {
          src: "build/module.wasm",
          dest: "build",
        },
        {
          src: "build/module.wasm.map",
          dest: "build",
        },
      ],
    }),
  ],
  server: {
    open: true,
    port: 5173,
  },

  build: {
    target: "esnext",
    commonjsOptions: {
      include: [],
      transformMixedEsModules: false,
    },
    rollupOptions: {
      treeshake: {
        moduleSideEffects: (id) => id.includes("inkjs") || id.includes("src"),
      },
    },
  },
  optimizeDeps: {
    include: ["inkjs/full"],

    esbuildOptions: {
      target: "esnext",
    },
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
  base: "./",
});
