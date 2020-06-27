import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "index.js",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "dist/index.js",
  },
  plugins: [
    replace({
      __SHEETS_API_URL__: process.env.ROLLUP_WATCH
        ? "https://api.tridnguyen.com/sheets"
        : "https://sheets.cloud.tridnguyen.com",
      __THIRDPARTY_API_URL__: process.env.ROLLUP_WATCH
        ? "https://api.tridnguyen.com/thirdparty"
        : "https://thirdparty.cloud.tridnguyen.com",
    }),
    svelte({
      dev: !production,
      css: (css) => {
        css.write("dist/app.css");
      },
    }),
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),

    production && terser(),
  ],
};
