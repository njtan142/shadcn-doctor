import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { analyze } from './analyzer.js';
import { formatHuman } from './formatters/human-formatter.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

export async function run(targetPath = '.', _format = 'human') {
  try {
    const result = await analyze(targetPath);

    // Warnings always go to stderr
    for (const warning of result.warnings) {
      process.stderr.write(`\u26a0 ${warning.message}\n`);
    }

    // Findings output to stdout
    // format is stored for future Epic 2 JSON formatter; currently always human
    process.stdout.write(formatHuman(result));

    // Exit code: 0 = pass, 1 = findings found
    process.exitCode = result.pass ? 0 : 1;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Error: ${message}\n`);
    process.exitCode = 2;
  }
}

const isMain =
  import.meta.url.startsWith('file:') && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  const program = new Command();
  program
    .name('shadcn-doctor')
    .description('Detect missed shadcn/ui component adoption in TypeScript/TSX files')
    .version(version)
    .argument('[path]', 'File or directory to scan', '.')
    .option('--format <format>', 'Output format: human or json', 'human')
    .addHelpText(
      'after',
      '\nExit codes:\n  0  No findings (pass)\n  1  Findings detected\n  2  Fatal error',
    )
    .action(async (targetPath: string, options: { format: string }) => {
      await run(targetPath, options.format);
    });

  program.parse(process.argv);
}
