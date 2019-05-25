import filesize from 'rollup-plugin-filesize';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'dist/es6/apprun.js',
  output: {
    file: 'dist/apprun.esm.js',
    format: 'esm',
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
    })
  ]
}