import fs from 'node:fs/promises';
import path from 'node:path';
import type { Finding, Warning } from './types.js';

export interface CacheEntry {
  mtime: number;
  findingsCount: number;
  findings: Finding[];
  warnings: Warning[];
}

export interface ScanCache {
  version: number;
  rootPath: string;
  lastScan: string;
  entries: Record<string, CacheEntry>;
}

const CACHE_VERSION = 1;
const CACHE_FILE = '.shadcn-doctor-cache.json';

function getCachePath(rootPath: string): string {
  return path.join(rootPath, CACHE_FILE);
}

export async function loadCache(rootPath: string): Promise<ScanCache | null> {
  const cachePath = getCachePath(rootPath);
  try {
    const content = await fs.readFile(cachePath, 'utf-8');
    const cache: ScanCache = JSON.parse(content);
    if (cache.version !== CACHE_VERSION || cache.rootPath !== rootPath) {
      return null;
    }
    return cache;
  } catch {
    return null;
  }
}

export async function saveCache(
  rootPath: string,
  entries: Record<string, CacheEntry>,
): Promise<void> {
  const cachePath = getCachePath(rootPath);
  const cache: ScanCache = {
    version: CACHE_VERSION,
    rootPath,
    lastScan: new Date().toISOString(),
    entries,
  };
  await fs.writeFile(cachePath, JSON.stringify(cache, null, 2), 'utf-8');
}

export async function getModifiedFiles(
  rootPath: string,
  allFiles: string[],
): Promise<{ modified: string[]; unchanged: string[]; cache: ScanCache | null }> {
  const cache = await loadCache(rootPath);

  if (!cache) {
    return { modified: allFiles, unchanged: [], cache: null };
  }

  const modified: string[] = [];
  const unchanged: string[] = [];

  for (const file of allFiles) {
    try {
      const stat = await fs.stat(file.replace(/\//g, path.sep));
      const fileMtime = stat.mtimeMs;

      const cached = cache.entries[file];
      if (!cached || cached.mtime !== fileMtime) {
        modified.push(file);
      } else {
        unchanged.push(file);
      }
    } catch {
      modified.push(file);
    }
  }

  return { modified, unchanged, cache };
}

export function getCachedResults(
  cache: ScanCache,
  files: string[],
): { findings: Finding[]; warnings: Warning[]; cachedFiles: number } {
  const findings: Finding[] = [];
  const warnings: Warning[] = [];
  let cachedFiles = 0;

  for (const file of files) {
    const cached = cache.entries[file];
    if (cached) {
      findings.push(...cached.findings);
      warnings.push(...cached.warnings);
      cachedFiles++;
    }
  }

  return { findings, warnings, cachedFiles };
}

export async function updateCache(
  rootPath: string,
  file: string,
  mtime: number,
  findings: Finding[],
  warnings: Warning[],
): Promise<void> {
  const cache = await loadCache(rootPath);
  const entries = cache?.entries ?? {};

  entries[file] = {
    mtime,
    findingsCount: findings.length,
    findings,
    warnings,
  };

  await saveCache(rootPath, entries);
}

export async function clearCache(rootPath: string): Promise<void> {
  const cachePath = getCachePath(rootPath);
  try {
    await fs.unlink(cachePath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw err;
    }
  }
}
