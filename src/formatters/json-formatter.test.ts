import { describe, expect, it } from 'vitest';
import type { AnalysisResult, Finding } from '../types.js';
import { formatJson } from './json-formatter.js';

// Helper to detect ANSI escape sequences (ESC = char code 27)
const ESC = String.fromCharCode(27);
function hasAnsi(str: string): boolean {
  return str.includes(`${ESC}[`);
}

// Factory helpers
function makeFinding(overrides: Partial<Finding> = {}): Finding {
  return {
    file: 'src/foo.tsx',
    line: 10,
    column: 3,
    rule: 'prefer-shadcn-button',
    violation: 'Raw <button> detected. Use <Button> from shadcn/ui.',
    suggestion: 'Use <Button> from shadcn/ui.',
    element: 'button',
    replacement: 'Button',
    sourceLine: '<button onClick={handleClick}>Click</button>',
    suggestedLine: '<Button onClick={handleClick}>',
    ...overrides,
  };
}

function makeResult(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    pass: true,
    summary: { total: 0, filesScanned: 5 },
    findings: [],
    warnings: [],
    ...overrides,
  };
}

describe('formatJson', () => {
  describe('findings present', () => {
    it('returns a parseable JSON string with pass: false and correct summary counts', () => {
      const result = makeResult({
        pass: false,
        summary: { total: 1, filesScanned: 5 },
        findings: [makeFinding()],
        warnings: [],
      });

      const output = formatJson(result);
      const parsed = JSON.parse(output); // must not throw

      expect(parsed.pass).toBe(false);
      expect(parsed.summary.total).toBe(1);
      expect(parsed.summary.filesScanned).toBe(5);
      expect(parsed.findings).toHaveLength(1);
      expect(parsed.warnings).toEqual([]);
    });

    it('includes all Finding fields in each findings entry', () => {
      const finding = makeFinding({
        file: 'src/pages/settings.tsx',
        line: 24,
        column: 5,
        rule: 'prefer-shadcn-select',
        violation: 'Raw <select> detected. Use <Select> from shadcn/ui.',
        suggestion: 'Use <Select> from shadcn/ui.',
        element: 'select',
        replacement: 'Select',
      });
      const result = makeResult({
        pass: false,
        summary: { total: 1, filesScanned: 42 },
        findings: [finding],
      });

      const output = formatJson(result);
      const parsed = JSON.parse(output);
      const f = parsed.findings[0];

      expect(f.file).toBe('src/pages/settings.tsx');
      expect(f.line).toBe(24);
      expect(f.column).toBe(5);
      expect(f.rule).toBe('prefer-shadcn-select');
      expect(f.violation).toBe('Raw <select> detected. Use <Select> from shadcn/ui.');
      expect(f.suggestion).toBe('Use <Select> from shadcn/ui.');
      expect(f.element).toBe('select');
      expect(f.replacement).toBe('Select');
    });
  });

  describe('no findings', () => {
    it('returns valid JSON with pass: true, total: 0, findings: [], warnings: []', () => {
      const result = makeResult({
        pass: true,
        summary: { total: 0, filesScanned: 10 },
        findings: [],
        warnings: [],
      });

      const output = formatJson(result);
      const parsed = JSON.parse(output); // must not throw

      expect(parsed.pass).toBe(true);
      expect(parsed.summary.total).toBe(0);
      expect(parsed.summary.filesScanned).toBe(10);
      expect(parsed.findings).toEqual([]);
      expect(parsed.warnings).toEqual([]);
    });
  });

  describe('warnings', () => {
    it('maps Warning objects to plain string messages in the warnings array', () => {
      const result = makeResult({
        pass: false,
        summary: { total: 1, filesScanned: 5 },
        findings: [makeFinding()],
        warnings: [
          { message: 'Skipped: bad.tsx (parse error)' },
          { message: 'Skipped: other.tsx (rule error)' },
        ],
      });

      const output = formatJson(result);
      const parsed = JSON.parse(output);

      expect(parsed.warnings).toEqual([
        'Skipped: bad.tsx (parse error)',
        'Skipped: other.tsx (rule error)',
      ]);
      // Must be strings, not objects
      for (const w of parsed.warnings) {
        expect(typeof w).toBe('string');
      }
    });
  });

  describe('no ANSI codes', () => {
    it('output contains no ANSI escape sequences (\\x1b[ pattern)', () => {
      const result = makeResult({
        pass: false,
        summary: { total: 1, filesScanned: 3 },
        findings: [makeFinding()],
        warnings: [{ message: 'Some warning' }],
      });

      const output = formatJson(result);

      expect(hasAnsi(output)).toBe(false);
      // Also check for raw \x1b character
      expect(output.includes('\x1b')).toBe(false);
    });
  });

  describe('JSON validity', () => {
    it('JSON.parse(formatJson(result)) does not throw', () => {
      const result = makeResult({
        pass: false,
        summary: { total: 2, filesScanned: 8 },
        findings: [
          makeFinding({ file: 'a.tsx', line: 1, column: 1 }),
          makeFinding({ file: 'b.tsx', line: 5, column: 2 }),
        ],
        warnings: [{ message: 'Warning msg' }],
      });

      expect(() => JSON.parse(formatJson(result))).not.toThrow();
    });

    it('produces pretty-printed JSON (2-space indent)', () => {
      const result = makeResult();
      const output = formatJson(result);

      // JSON.stringify with null, 2 produces lines indented with 2 spaces
      expect(output).toContain('  "pass"');
    });
  });

  describe('schema shape', () => {
    it('output matches the architecture schema exactly (pass, summary, findings, warnings keys)', () => {
      const result = makeResult({
        pass: false,
        summary: { total: 1, filesScanned: 7 },
        findings: [makeFinding()],
        warnings: [{ message: 'warn' }],
      });

      const parsed = JSON.parse(formatJson(result));

      expect(Object.keys(parsed)).toEqual(['pass', 'summary', 'findings', 'warnings']);
      expect(Object.keys(parsed.summary)).toEqual(['total', 'filesScanned']);
    });
  });
});
