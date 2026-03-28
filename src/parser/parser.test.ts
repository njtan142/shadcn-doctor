import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseFile } from './parser.js';

describe('AST Parser Module', () => {
  it('should parse a valid TypeScript file and return a SourceFile', async () => {
    const validFile = path.join(process.cwd(), 'src', 'types.ts');
    const result = parseFile(validFile);

    // We expect it to not be a warning and to have ts-morph SourceFile properties
    expect(result).toBeDefined();
    if (result && 'message' in result) {
      throw new Error('Expected SourceFile, got Warning');
    }
    expect(typeof result?.getFilePath).toBe('function'); // Is a SourceFile
  });

  it('should handle malformed files and return a Warning', async () => {
    // Create a temporary malformed file
    const malformedFile = path.join(process.cwd(), 'malformed.ts');
    await fs.writeFile(malformedFile, 'const x = ;;; syntax error //');

    try {
      const result = parseFile(malformedFile);
      expect(result).toBeDefined();
      if (!result) throw new Error('Result is undefined');
      expect('message' in result).toBe(true);
      expect((result as { message: string }).message).toContain(
        '⚠ Skipped: malformed.ts (parse error)',
      );
    } finally {
      await fs.unlink(malformedFile);
    }
  });
});
