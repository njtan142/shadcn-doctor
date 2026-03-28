import fs from 'node:fs/promises';
import path from 'node:path';

export async function discoverFiles(targetPath: string): Promise<string[]> {
  const stat = await fs.stat(targetPath);

  if (stat.isFile()) {
    // If it's a single file, just return its basename if it's TS/TSX
    const ext = path.extname(targetPath);
    if (ext === '.ts' || ext === '.tsx') {
      return [path.basename(targetPath)];
    }
    return [];
  }

  // If directory, use recursive readdir
  const entries = await fs.readdir(targetPath, { recursive: true, withFileTypes: true });

  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => {
      // Relative path from the targetPath (the scan root)
      // readdir with recursive: true returns paths relative to the directory passed to it in node 20+
      // Actually, entry.parentPath is available in newer node versions, but let's just use path.relative
      // In node > 18.17, fs.readdir with { recursive: true } returns paths in `entry.name` if string,
      // but withFileTypes: true returns Dirent. `entry.path` or `entry.parentPath` might be available.
      // To be safe and compatible, we can just use path.join and path.relative.
      const fullPath = path.join(
        'parentPath' in entry
          ? ((entry as Record<string, unknown>).parentPath as string)
          : entry.path,
        entry.name,
      );
      return path.relative(targetPath, fullPath);
    })
    .filter((relativePath) => {
      const ext = path.extname(relativePath);
      return ext === '.ts' || ext === '.tsx';
    });

  // Convert to posix and sort
  const normalized = files.map((p) => p.split(path.sep).join(path.posix.sep)).sort();

  return normalized;
}
