#!/usr/bin/env node

'use strict';

import toYaml from './cli/export.js';
import fromYaml from './cli/import.js';

const cmd = process.argv[2];
const file = process.argv[3];

if (cmd === 'export') {
  toYaml(file);
}
else if (cmd === 'import') {
  fromYaml(file);
} else {
  console.log('Usage: apprun-cli <export|import> <file>');
  console.log('> If you want to create an AppRun project. Please use npm create apprun-app instead.');
}