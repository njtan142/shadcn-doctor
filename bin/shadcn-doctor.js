#!/usr/bin/env node
import { createProgram, run } from '../dist/cli.js';

const program = createProgram();
program.action(async (path, opts) => {
  await run(path, opts.format, { bail: opts.bail });
});
program.parse(process.argv);
