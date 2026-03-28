import fs from 'node:fs/promises';
import path from 'node:path';

const IGNORED_DIRS = new Set(['node_modules', 'dist', '.git', '.next', 'coverage']);

export async function discoverFiles(targetPath: string): Promise<string[]> {
  const absoluteTargetPath = path.resolve(targetPath);
  const stat = await fs.stat(absoluteTargetPath);

  if (stat.isFile()) {
    const ext = path.extname(absoluteTargetPath);
    if (ext === '.ts' || ext === '.tsx') {
      return [absoluteTargetPath.split(path.sep).join(path.posix.sep)];
    }
    return [];
  }

  const files: string[] = [];

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) {
          await walk(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (ext === '.ts' || ext === '.tsx') {
          files.push(fullPath);
        }
      }
    }
  }

  await walk(absoluteTargetPath);

  return files.map((p) => p.split(path.sep).join(path.posix.sep)).sort();
}
