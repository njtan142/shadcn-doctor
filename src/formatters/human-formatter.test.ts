import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
    sourceLine: '<button onClick={handleClick}>Click</button>',
    suggestedLine: '<Button onClick={handleClick}>',
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
          sourceLine: '<select className="border rounded">{options}</select>',
          suggestedLine: '<Select>{options}</Select>',
        }),
        makeFinding({
          file: 'src/pages/settings.tsx',
          line: 41,
          column: 3,
          rule: 'prefer-shadcn-button',
          violation: 'Raw <button> detected. Use <Button> from shadcn/ui.',
          sourceLine: '<button className="bg-blue-500" onClick={save}>Save</button>',
          suggestedLine: '<Button onClick={save}>Save</Button>',
        }),
        makeFinding({
          file: 'src/components/form.tsx',
          line: 12,
          column: 7,
          rule: 'prefer-shadcn-input',
          violation: 'Raw <input> detected. Use <Input> from shadcn/ui.',
          sourceLine: '<input type="text" className="border px-3 py-2" />',
          suggestedLine: '<Input type="text" />',
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

      // First finding (line, diff lines, blank)
      expect(lines[2]).toBe(
        '  24:5  Raw <select> detected. Use <Select> from shadcn/ui.  prefer-shadcn-select',
      );
      expect(lines[3]).toBe('- <select className="border rounded">{options}</select>');
      expect(lines[4]).toBe('+ <Select>{options}</Select>');
      expect(lines[5]).toBe('');

      // Second finding in same file
      expect(lines[6]).toBe(
        '  41:3  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button',
      );
      expect(lines[7]).toBe('- <button className="bg-blue-500" onClick={save}>Save</button>');
      expect(lines[8]).toBe('+ <Button onClick={save}>Save</Button>');
      expect(lines[9]).toBe('');

      // Blank line between file groups
      expect(lines[10]).toBe('');

      // Second file header
      expect(lines[11]).toBe('src/components/form.tsx');

      // Third finding (diff lines, blank before summary)
      expect(lines[12]).toBe(
        '  12:7  Raw <input> detected. Use <Input> from shadcn/ui.  prefer-shadcn-input',
      );
      expect(lines[13]).toBe('- <input type="text" className="border px-3 py-2" />');
      expect(lines[14]).toBe('+ <Input type="text" />');

      // Summary line (no extra blank line before it)
      expect(lines[15]).toBe('3 findings in 42 files scanned.');

      // No trailing newline (lines length is 16 = indices 0-15)
      expect(lines).toHaveLength(16);
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
    it('re-enables colors when FORCE_COLOR is set even without TTY', async () => {
      delete process.env.NO_COLOR;
      process.env.FORCE_COLOR = '1';
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        writable: true,
        configurable: true,
      });

      // COLORS_ENABLED is memoized at module load time, so we must reload the
      // module with FORCE_COLOR already set to get colored output.
      vi.resetModules();
      const { formatHuman: formatHumanForced } = await import('./human-formatter.js');

      const findings = [makeFinding({ file: 'src/foo.tsx', line: 10, column: 2 })];
      const result = makeResult({
        pass: false,
        summary: { total: 1, filesScanned: 1 },
        findings,
      });
      const output = formatHumanForced(result);
      // With FORCE_COLOR, bold/dim must add ANSI escape sequences
      expect(hasAnsi(output)).toBe(true);
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
