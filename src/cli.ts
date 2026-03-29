import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { select } from '@inquirer/prompts';
import { Command, Option } from 'commander';
import { type AnalyzeOptions, analyze } from './analyzer.js';
import { formatHuman } from './formatters/human-formatter.js';
import { formatJson } from './formatters/json-formatter.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

export async function run(targetPath = '.', format = 'human', options: AnalyzeOptions = {}) {
  try {
    const result = await analyze(targetPath, options);

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
    .addOption(new Option('--bail', 'Stop at first file suggestion').default(false))
    .addHelpText(
      'after',
      '\nExit codes:\n  0  No findings (pass)\n  1  Findings detected\n  2  Fatal error',
    );

  program
    .command('setup')
    .description('Interactive setup for shadcn-doctor configuration')
    .action(async () => {
      try {
        const style = await select({
          message: 'Formatting style:',
          choices: [
            { name: 'Compact', value: 'compact' },
            { name: 'Expanded', value: 'expanded' },
            { name: 'Prettier', value: 'prettier' },
          ],
        });

        const indent = await select<number | string>({
          message: 'Indent style:',
          choices: [
            { name: '2-space', value: 2 },
            { name: '4-space', value: 4 },
            { name: 'Tabs', value: 'tab' },
          ],
        });

        const quotes = await select({
          message: 'Quote style:',
          choices: [
            { name: 'Single quotes', value: 'single' },
            { name: 'Double quotes', value: 'double' },
          ],
        });

        const config = {
          style,
          indent,
          quotes,
        };

        await fs.writeFile('.shadcn-doctorrc.json', JSON.stringify(config, null, 2), 'utf-8');
        process.stdout.write('\u2714 Created .shadcn-doctorrc.json successfully.\n');
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'ExitPromptError') {
          process.stdout.write('\u2718 Setup cancelled.\n');
          process.exitCode = 1;
          return;
        }
        const message = err instanceof Error ? err.message : String(err);
        process.stderr.write(`Error during setup: ${message}\n`);
        process.exitCode = 2;
      }
    });

  return program;
}

const isMain =
  import.meta.url.startsWith('file:') && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  const program = createProgram();
  program.action(async (targetPath: string, options: { format: string; bail: boolean }) => {
    await run(targetPath, options.format, { bail: options.bail });
  });

  program.parse(process.argv);
}
