import fs from 'node:fs/promises';
import path from 'node:path';
import { clearCache, getCachedResults, getModifiedFiles, updateCache } from './cache.js';
import { runRules } from './engine/rule-engine.js';
import { parseFile, resetParser } from './parser/parser.js';
import { ALL_RULES } from './rules/index.js';
import { discoverFiles } from './scanner/scanner.js';
import type { AnalysisResult, Finding, Warning } from './types.js';
import { validateGenuineComponents } from './validator/genuine.js';

export interface AnalyzeOptions {
  bail?: boolean;
  cache?: boolean;
  clearCache?: boolean;
}

export async function analyze(
  targetPath: string,
  options: AnalyzeOptions = {},
): Promise<AnalysisResult> {
  const useCache = options.cache ?? true;
  const shouldClearCache = options.clearCache ?? false;

  if (shouldClearCache && useCache) {
    const absoluteRootPath = path.resolve(targetPath);
    await clearCache(absoluteRootPath);
    console.error('\u2714 Cache cleared.\n');
  }

  resetParser();
  const absoluteRootPath = path.resolve(targetPath);

  if (!targetPath.trim()) {
    throw new Error('Path cannot be empty');
  }

  try {
    await fs.stat(absoluteRootPath);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      throw new Error(`Path not found: ${targetPath}`);
    }
    if (code === 'EACCES') {
      throw new Error(`Permission denied: ${targetPath}`);
    }
    throw err;
  }

  const { fakeComponents, genuinePaths } = await validateGenuineComponents(absoluteRootPath);
  if (fakeComponents.length > 0) {
    console.error(
      '⚠️ Warning: The following components in your ui directory do not appear to be genuine shadcn/ui installations:',
    );
    for (const comp of fakeComponents) {
      console.error(`  - ${comp} (Missing standard shadcn imports/structure)`);
    }
    console.error(''); // empty line
  }

  console.error(`⚡ Scanning ${absoluteRootPath}...`);

  const allFiles = await discoverFiles(absoluteRootPath);
  const files = genuinePaths.size > 0 ? allFiles.filter((f) => !genuinePaths.has(f)) : allFiles;
  console.error(`Found ${files.length} TypeScript files\n`);

  if (files.length === 0) {
    throw new Error(`No TypeScript files found in: ${targetPath}`);
  }

  let filesToScan = files;
  let cachedFindings: Finding[] = [];
  let cachedWarnings: Warning[] = [];
  let cachedFilesCount = 0;
  let usedCache = false;

  if (useCache) {
    const { modified, unchanged, cache } = await getModifiedFiles(absoluteRootPath, files);
    filesToScan = modified;
    usedCache = true;

    if (cache && unchanged.length > 0) {
      const cached = getCachedResults(cache, unchanged);
      cachedFindings = cached.findings;
      cachedWarnings = cached.warnings;
      cachedFilesCount = cached.cachedFiles;
      console.error(`\u2714 Using cached results for ${cachedFilesCount} unchanged file(s)\n`);
    }

    if (modified.length === 0) {
      console.error(`\u2714 No modified files since last scan\n`);
      const allFindings = [...cachedFindings];
      const allWarnings = [...cachedWarnings];

      allFindings.sort((a, b) => {
        if (a.file !== b.file) {
          return a.file.localeCompare(b.file);
        }
        if (a.line !== b.line) {
          return (a.line ?? 0) - (b.line ?? 0);
        }
        return (a.column ?? 0) - (b.column ?? 0);
      });

      return {
        pass: allFindings.length === 0,
        summary: {
          total: allFindings.length,
          filesScanned: cachedFilesCount,
        },
        findings: allFindings,
        warnings: allWarnings,
      };
    }

    console.error(`Scanning ${modified.length} modified file(s), ${unchanged.length} unchanged\n`);
  }

  const allFindings: Finding[] = [...cachedFindings];
  const allWarnings: Warning[] = [...cachedWarnings];
  let filesScanned = cachedFilesCount;

  const BATCH_SIZE = 20;
  for (let i = 0; i < filesToScan.length; i += BATCH_SIZE) {
    const batch = filesToScan.slice(i, i + BATCH_SIZE);
    const batchDirs = new Set(batch.map((f) => path.dirname(f)));
    for (const dir of batchDirs) {
      console.error(`  \u2192 ${dir}`);
    }

    const results = await Promise.all(
      batch.map(async (file) => {
        const sourceFileOrWarning = parseFile(file);
        if ('message' in sourceFileOrWarning) {
          return { findings: [] as Finding[], warnings: [sourceFileOrWarning as Warning], file };
        }
        const { findings, warnings } = runRules(sourceFileOrWarning, ALL_RULES, absoluteRootPath);
        return { findings, warnings, file };
      }),
    );

    for (const result of results) {
      allFindings.push(...result.findings);
      allWarnings.push(...result.warnings);
      filesScanned++;

      if (useCache && result.file) {
        try {
          const stat = await fs.stat(result.file.replace(/\//g, path.sep));
          await updateCache(
            absoluteRootPath,
            result.file,
            stat.mtimeMs,
            result.findings,
            result.warnings,
          );
        } catch {
          // Ignore cache update errors
        }
      }
    }

    if (options.bail && allFindings.length > 0) {
      break;
    }
  }

  if (filesToScan.length > 0 && filesScanned === cachedFilesCount) {
    throw new Error(`No TypeScript files could be successfully parsed in: ${targetPath}`);
  }

  allFindings.sort((a, b) => {
    if (a.file !== b.file) {
      return a.file.localeCompare(b.file);
    }
    if (a.line !== b.line) {
      return (a.line ?? 0) - (b.line ?? 0);
    }
    return (a.column ?? 0) - (b.column ?? 0);
  });

  return {
    pass: allFindings.length === 0,
    summary: {
      total: allFindings.length,
      filesScanned,
    },
    findings: allFindings,
    warnings: allWarnings,
  };
}
