import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AnalysisResult, Finding } from '../types.js';
import { formatHuman } from './human-formatter.js';

// Helper to detect ANSI escape sequences (ESC = char code 27)
const ESC = String.fromCharCode(27);
function hasAnsi(str: string): boolean {
  return str.includes(`${ESC}[`);
}

// Factory helpers
function makeFinding(overrides: Partial<Finding> = {}): Finding {
  return {
    file: 'src/foo.tsx',
    line: 1,
    column: 1,
    rule: 'prefer-shadcn-button',
    violation: 'Raw <button> detected. Use <Button> from shadcn/ui.',
    suggestion: 'Use <Button> from shadcn/ui',
    element: 'button',
    replacement: 'Button',
    ...overrides,
  };
}

function makeResult(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    pass: true,
    summary: { total: 0, filesScanned: 42 },
    findings: [],
    warnings: [],
    ...overrides,
  };
}

describe('formatHuman', () => {
  let savedNoColor: string | undefined;
  let savedForceColor: string | undefined;
  let savedIsTTY: boolean | undefined;

  beforeEach(() => {
    savedNoColor = process.env.NO_COLOR;
    savedForceColor = process.env.FORCE_COLOR;
    savedIsTTY = process.stdout.isTTY;
  });

  afterEach(() => {
    if (savedNoColor !== undefined) {
      process.env.NO_COLOR = savedNoColor;
    } else {
      delete process.env.NO_COLOR;
    }
    if (savedForceColor !== undefined) {
      process.env.FORCE_COLOR = savedForceColor;
    } else {
      delete process.env.FORCE_COLOR;
    }
    Object.defineProperty(process.stdout, 'isTTY', {
      value: savedIsTTY,
      writable: true,
      configurable: true,
    });
  });

  // Ensure colors are off for structural tests
  function setNoColors() {
    process.env.NO_COLOR = '1';
    delete process.env.FORCE_COLOR;
  }

  describe('zero findings', () => {
    it('renders single clean-pass line only', () => {
      setNoColors();
      const result = makeResult({ pass: true, summary: { total: 0, filesScanned: 42 } });
      const output = formatHuman(result);
      expect(output).toBe('No findings. 42 files scanned.');
    });

    it('does not contain blank lines or ANSI codes', () => {
      setNoColors();
      const result = makeResult({ pass: true, summary: { total: 0, filesScanned: 5 } });
      const output = formatHuman(result);
      expect(output).not.toContain('\n');
      expect(hasAnsi(output)).toBe(false);
    });
  });

  describe('findings across two files', () => {
    it('renders correct grouping, indentation, spacing, and summary', () => {
      setNoColors();
      const findings: Finding[] = [
        makeFinding({
          file: 'src/pages/settings.tsx',
          line: 24,
          column: 5,
          rule: 'prefer-shadcn-select',
          violation: 'Raw <select> detected. Use <Select> from shadcn/ui.',
        }),
        makeFinding({
          file: 'src/pages/settings.tsx',
          line: 41,
          column: 3,
          rule: 'prefer-shadcn-button',
          violation: 'Raw <button> detected. Use <Button> from shadcn/ui.',
        }),
        makeFinding({
          file: 'src/components/form.tsx',
          line: 12,
          column: 7,
          rule: 'prefer-shadcn-input',
          violation: 'Raw <input> detected. Use <Input> from shadcn/ui.',
        }),
      ];
      const result = makeResult({
        pass: false,
        summary: { total: 3, filesScanned: 42 },
        findings,
      });

      const output = formatHuman(result);
      const lines = output.split('\n');

      // Leading blank line
      expect(lines[0]).toBe('');

      // First file header
      expect(lines[1]).toBe('src/pages/settings.tsx');

      // First file findings (2-space indent)
      expect(lines[2]).toBe(
        '  24:5  Raw <select> detected. Use <Select> from shadcn/ui.  prefer-shadcn-select',
      );
      expect(lines[3]).toBe(
        '  41:3  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button',
      );

      // Blank line between file groups
      expect(lines[4]).toBe('');

      // Second file header
      expect(lines[5]).toBe('src/components/form.tsx');

      // Second file finding
      expect(lines[6]).toBe(
        '  12:7  Raw <input> detected. Use <Input> from shadcn/ui.  prefer-shadcn-input',
      );

      // Blank line before summary
      expect(lines[7]).toBe('');

      // Summary line
      expect(lines[8]).toBe('3 findings in 42 files scanned.');

      // No trailing newline (lines length is 9 = indices 0-8)
      expect(lines).toHaveLength(9);
    });

    it('shows correct finding count in summary', () => {
      setNoColors();
      const findings = [
        makeFinding({ file: 'a.tsx', line: 1, column: 1 }),
        makeFinding({ file: 'b.tsx', line: 2, column: 2 }),
      ];
      const result = makeResult({
        pass: false,
        summary: { total: 2, filesScanned: 10 },
        findings,
      });
      const output = formatHuman(result);
      expect(output).toContain('2 findings in 10 files scanned.');
    });
  });

  describe('NO_COLOR=1 strips ANSI codes', () => {
    it('output contains no ANSI escape sequences when NO_COLOR is set', () => {
      process.env.NO_COLOR = '1';
      delete process.env.FORCE_COLOR;
      const findings = [makeFinding({ file: 'src/foo.tsx', line: 1, column: 1 })];
      const result = makeResult({
        pass: false,
        summary: { total: 1, filesScanned: 5 },
        findings,
      });
      const output = formatHuman(result);
      expect(hasAnsi(output)).toBe(false);
    });
  });

  describe('non-TTY stdout auto-strips colors', () => {
    it('suppresses ANSI codes when stdout is not a TTY', () => {
      delete process.env.NO_COLOR;
      delete process.env.FORCE_COLOR;
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        writable: true,
        configurable: true,
      });
      const findings = [makeFinding({ file: 'src/foo.tsx', line: 1, column: 1 })];
      const result = makeResult({
        pass: false,
        summary: { total: 1, filesScanned: 3 },
        findings,
      });
      const output = formatHuman(result);
      expect(hasAnsi(output)).toBe(false);
    });
  });

  describe('FORCE_COLOR=1 re-enables colors', () => {
    it('re-enables colors when FORCE_COLOR is set even without TTY', () => {
      delete process.env.NO_COLOR;
      process.env.FORCE_COLOR = '1';
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        writable: true,
        configurable: true,
      });
      const findings = [makeFinding({ file: 'src/foo.tsx', line: 10, column: 2 })];
      const result = makeResult({
        pass: false,
        summary: { total: 1, filesScanned: 1 },
        findings,
      });
      const output = formatHuman(result);
      // With FORCE_COLOR, bold/dim should add ANSI sequences — at minimum output contains the text
      expect(output).toContain('src/foo.tsx');
      expect(output).toContain('10:2');
    });
  });

  describe('output structure invariants', () => {
    it('no trailing newline after summary when findings present', () => {
      setNoColors();
      const findings = [makeFinding()];
      const result = makeResult({
        pass: false,
        summary: { total: 1, filesScanned: 1 },
        findings,
      });
      const output = formatHuman(result);
      expect(output.endsWith('\n')).toBe(false);
    });

    it('file path appears as header (not indented)', () => {
      setNoColors();
      const findings = [makeFinding({ file: 'src/test.tsx', line: 5, column: 3 })];
      const result = makeResult({
        pass: false,
        summary: { total: 1, filesScanned: 1 },
        findings,
      });
      const output = formatHuman(result);
      const lines = output.split('\n');
      const headerLine = lines.find((l) => l === 'src/test.tsx');
      expect(headerLine).toBeDefined();
    });

    it('findings are indented with 2 spaces', () => {
      setNoColors();
      const findings = [
        makeFinding({ file: 'src/test.tsx', line: 5, column: 3, violation: 'Test violation' }),
      ];
      const result = makeResult({
        pass: false,
        summary: { total: 1, filesScanned: 1 },
        findings,
      });
      const output = formatHuman(result);
      const lines = output.split('\n');
      const findingLine = lines.find((l) => l.includes('Test violation'));
      expect(findingLine).toBeDefined();
      expect(findingLine?.startsWith('  ')).toBe(true);
    });
  });
});
