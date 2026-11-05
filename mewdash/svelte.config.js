import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    adapter: adapter({ out: "out" }),
    version: { pollInterval: 60000 },
    prerender: {
      handleHttpError: "warn"
    }
  },
  preprocess: vitePreprocess(),
};
