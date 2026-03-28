import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { discoverFiles } from './scanner.js';

describe('File Discovery Module', () => {
  it('should find all .ts and .tsx files recursively and alphabetically, excluding others', async () => {
    // We can test against our own src and __fixtures__ directories
    const fixturesDir = path.join(process.cwd(), 'src', '__fixtures__');
    const files = await discoverFiles(fixturesDir);

    // We expect it to find index.ts at least.
    expect(Array.isArray(files)).toBe(true);
    expect(files.every((f) => f.endsWith('.ts') || f.endsWith('.tsx'))).toBe(true);
    // Now expecting absolute paths, converted to posix
    const expectedFile = path.join(fixturesDir, 'index.ts').split(path.sep).join(path.posix.sep);
    expect(files).toContain(expectedFile);

    // Check sorting
    const sortedFiles = [...files].sort();
    expect(files).toEqual(sortedFiles);
  });

  it('should return a single file if a .tsx file path is provided', async () => {
    const singleFile = path.join(process.cwd(), 'src', 'types.ts');
    const files = await discoverFiles(singleFile);

    expect(files.length).toBe(1);
    const expectedFile = singleFile.split(path.sep).join(path.posix.sep);
    expect(files[0]).toBe(expectedFile);
  });

  it('should use forward slashes and return absolute paths', async () => {
    const targetDir = path.join(process.cwd(), 'src');
    const files = await discoverFiles(targetDir);

    expect(files.length).toBeGreaterThan(0);
    expect(files.every((f) => !f.includes('\\'))).toBe(true); // No backslashes
    expect(files.every((f) => path.isAbsolute(f) || f.startsWith('/'))).toBe(true); // Absolute paths
  });
});
