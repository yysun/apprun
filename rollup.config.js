import filesize from 'rollup-plugin-filesize';
import { terser } from 'rollup-plugin-terser';
import sourcemaps from 'rollup-plugin-sourcemaps';
import resolve from 'rollup-plugin-node-resolve';

const plugins = [
  resolve(),
  terser({
    warnings: true,
    module: true,
    mangle: {
      properties: {
        regex: /^__/,
      },
    },
  }),
  filesize({
    // showBrotliSize: true,
  }),
  sourcemaps()
];

export default [{
  input: 'esm/apprun.js',
  output: {
    file: 'dist/apprun.esm.js',
    format: 'esm',
    sourcemap: true
  },
  plugins,
}, {
  input: 'esm/apprun-html.js',
  output: {
    file: 'dist/apprun-html.esm.js',
    format: 'esm',
    sourcemap: true
    },
  plugins
}]