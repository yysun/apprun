/**
 * GitHub Pages runtime asset publisher.
 *
 * Copies only browser bundles and source maps required by the deployed
 * documentation and Play surfaces from ignored build output into the tracked
 * Pages asset directory.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const assetsDir = path.join(root, 'docs', 'assets');
const assets = [
  'apprun-html.js',
  'apprun-html.js.map',
  'apprun-dev-tools.js',
  'apprun-dev-tools.js.map',
  'apprun-play.js',
  'apprun-play.js.map',
];

fs.mkdirSync(assetsDir, { recursive: true });

for (const asset of assets) {
  const source = path.join(root, 'dist', asset);
  const target = path.join(assetsDir, asset);

  if (!fs.existsSync(source)) {
    throw new Error(`Cannot sync GitHub Pages asset. Missing ${source}`);
  }

  fs.copyFileSync(source, target);
}
