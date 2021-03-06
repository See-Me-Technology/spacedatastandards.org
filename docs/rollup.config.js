import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import json from "@rollup/plugin-json";
import { string } from "rollup-plugin-string";
import copy from 'rollup-plugin-copy';

import { terser } from "rollup-plugin-terser";
import fs from "fs";
import path from "path";

const production = !process.env.ROLLUP_WATCH;
const writePath = !production ? "dev/build/" : "";

export default {
  external: "./workers/worker.js",
  input: "src/main.js",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: `${writePath}bundle.js`
  },
  plugins: [

    json(),
    copy({
      targets: [
        { src: 'schemas', dest: './dev/' },
        { src: './src/workers/**/*', dest: !production ? "./dev/workers" : "./workers" },
        { src: './src/lib/**/*', dest: !production ? "./dev/lib" : "./lib" },
        { src: './src/test/**/*', dest: !production ? "./dev/test" : "./test" }
      ]
    }),
    string({
      include: ["**/*.fbs", "**/*.xsd", "lib/flatbuffers.js", "src/components/Main/background.html.txt", "src/lib/workerShim.js"]
    }),
    {
      name: "rollup-plugin-svelte-css-replace",
      transform(code, id) {
        if (id.slice(id.lastIndexOf(".")) !== ".svelte") return;
        if (code.match(/@import[^;]{1,};/)) {
          let matches = code.match(/@import[^;]{1,};/g);
          for (let m = 0; m < matches.length; m++) {
            let _path = matches[m].replace(/@import|;/g, "");
            if (_path) {
              _path = JSON.parse(_path);
              let _file = path.resolve(id, _path);
              let _src = fs.readFileSync(_file, { encoding: "utf8" });
              code = code.replace(matches[m], _src);
            }
          }
        }
        return { code, map: this.getCombinedSourcemap() };
      },
      generateBundle(opts) { }
    },
    svelte({
      // enable run-time checks when not in production
      dev: !production
      // we'll extract any component CSS out into
      // a separate file - better for performance
      /*css: css => {
        css.write(`${writePath}bundle.css`);
      }*/
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ["svelte"]
    }),
    commonjs(),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `dev` directory and refresh the
    // browser on changes when not in production
    !production && livereload(),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
};

function serve() {
  let started = false;

  return {
    writeBundle() {
      if (!started) {
        started = true;

        require("child_process").spawn("npm", ["run", "start", "--", "--dev"], {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true
        });
      }
    }
  };
}
