import filesize from 'rollup-plugin-filesize';
import { terser } from 'rollup-plugin-terser';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
  input: 'esm/apprun.js',
  output: {
    file: 'dist/apprun.esm.js',
    format: 'esm',
    sourcemap: true
  },
  plugins: [
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
      showBrotliSize: true,
    }),
    sourcemaps()
  ]
}