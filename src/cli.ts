import { fileURLToPath } from 'node:url';

export function run() {
  console.log('shadcn-doctor CLI');
}

const isMain =
  import.meta.url.startsWith('file:') && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  run();
}
