import { fileURLToPath } from 'node:url';
import { analyze } from './analyzer.js';
import { formatHuman } from './formatters/human-formatter.js';

export async function run(targetPath = '.') {
  try {
    const result = await analyze(targetPath);

    // Warnings always go to stderr
    for (const warning of result.warnings) {
      process.stderr.write(`\u26a0 ${warning.message}\n`);
    }

    // Findings output to stdout
    process.stdout.write(formatHuman(result));

    // Exit code: 0 = pass, 1 = findings found
    process.exitCode = result.pass ? 0 : 1;
  } catch (err: unknown) {
    const description = err instanceof Error ? err.message : String(err);
    const detail = err instanceof Error ? (err.stack ?? err.message) : String(err);
    process.stderr.write(`Error: ${description}: ${detail}\n`);
    process.exitCode = 2;
  }
}

const isMain =
  import.meta.url.startsWith('file:') && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  const targetPath = process.argv[2] ?? '.';
  run(targetPath).catch((err) => {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exitCode = 2;
  });
}
