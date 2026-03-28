import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { Command, Option } from 'commander';
import { analyze } from './analyzer.js';
import { formatHuman } from './formatters/human-formatter.js';
import { formatJson } from './formatters/json-formatter.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

export async function run(targetPath = '.', format = 'human') {
  try {
    const result = await analyze(targetPath);

    // Warnings always go to stderr
    for (const warning of result.warnings) {
      process.stderr.write(`\u26a0 ${warning.message}\n`);
    }

    // Findings output to stdout
    if (format === 'json') {
      process.stdout.write(formatJson(result));
    } else {
      process.stdout.write(formatHuman(result));
    }

    // Exit code: 0 = pass, 1 = findings found
    process.exitCode = result.pass ? 0 : 1;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Error: ${message}\n`);
    process.exitCode = 2;
  }
}

export function createProgram() {
  const program = new Command();
  program
    .name('shadcn-doctor')
    .description('Detect missed shadcn/ui component adoption in TypeScript/TSX files')
    .version(version)
    .argument('[path]', 'File or directory to scan', '.')
    .addOption(
      new Option('--format <format>', 'Output format: human or json')
        .default('human')
        .choices(['human', 'json']),
    )
    .addHelpText(
      'after',
      '\nExit codes:\n  0  No findings (pass)\n  1  Findings detected\n  2  Fatal error',
    );
  return program;
}

const isMain =
  import.meta.url.startsWith('file:') && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  const program = createProgram();
  program.action(async (targetPath: string, options: { format: string }) => {
    await run(targetPath, options.format);
  });

  program.parse(process.argv);
}
