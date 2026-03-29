import fs from 'node:fs/promises';
import path from 'node:path';
import { runRules } from './engine/rule-engine.js';
import { parseFile } from './parser/parser.js';
import { ALL_RULES } from './rules/index.js';
import { discoverFiles } from './scanner/scanner.js';
import type { AnalysisResult, Finding, Warning } from './types.js';

export async function analyze(targetPath: string): Promise<AnalysisResult> {
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

  const files = await discoverFiles(absoluteRootPath);

  if (files.length === 0) {
    throw new Error(`No TypeScript files found in: ${targetPath}`);
  }

  const allFindings: Finding[] = [];
  const allWarnings: Warning[] = [];
  let filesScanned = 0;

  for (const file of files) {
    const sourceFileOrWarning = parseFile(file);

    if ('message' in sourceFileOrWarning) {
      allWarnings.push(sourceFileOrWarning as Warning);
      continue;
    }

    filesScanned++;
    const { findings, warnings } = runRules(sourceFileOrWarning, ALL_RULES, absoluteRootPath);

    allFindings.push(...findings);
    allWarnings.push(...warnings);
  }

  if (files.length > 0 && filesScanned === 0) {
    throw new Error(`No TypeScript files could be successfully parsed in: ${targetPath}`);
  }

  // Sort findings by file path then line then column for determinism
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
