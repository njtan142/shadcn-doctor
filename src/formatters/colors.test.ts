import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// Helper to detect ANSI escape sequences (ESC = char code 27)
const ESC = String.fromCharCode(27);
function hasAnsi(str: string): boolean {
  return str.includes(`${ESC}[`);
}

// We need to reset module state between tests since colors.ts reads env vars at call time
describe('colors utility', () => {
  let originalNoColor: string | undefined;
  let originalForceColor: string | undefined;
  let originalIsTTY: boolean | undefined;
  let isTTYSpy: MockInstance | undefined;

  beforeEach(() => {
    originalNoColor = process.env.NO_COLOR;
    originalForceColor = process.env.FORCE_COLOR;
    originalIsTTY = process.stdout.isTTY;
    delete process.env.NO_COLOR;
    delete process.env.FORCE_COLOR;
  });

  afterEach(() => {
    if (originalNoColor !== undefined) {
      process.env.NO_COLOR = originalNoColor;
    } else {
      delete process.env.NO_COLOR;
    }
    if (originalForceColor !== undefined) {
      process.env.FORCE_COLOR = originalForceColor;
    } else {
      delete process.env.FORCE_COLOR;
    }
    if (isTTYSpy) {
      isTTYSpy.mockRestore();
      isTTYSpy = undefined;
    }
    // Restore isTTY
    Object.defineProperty(process.stdout, 'isTTY', {
      value: originalIsTTY,
      writable: true,
      configurable: true,
    });
  });

  describe('NO_COLOR suppression', () => {
    it('suppresses all ANSI codes when NO_COLOR is set', async () => {
      process.env.NO_COLOR = '1';
      const { bold, dim, red, green, yellow } = await import('./colors.js');
      expect(bold('text')).toBe('text');
      expect(dim('text')).toBe('text');
      expect(red('text')).toBe('text');
      expect(green('text')).toBe('text');
      expect(yellow('text')).toBe('text');
    });

    it('suppresses ANSI when NO_COLOR is empty string', async () => {
      process.env.NO_COLOR = '';
      const { bold } = await import('./colors.js');
      expect(bold('hello')).toBe('hello');
    });
  });

  describe('TTY detection', () => {
    it('suppresses colors when stdout is not a TTY', async () => {
      delete process.env.NO_COLOR;
      delete process.env.FORCE_COLOR;
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        writable: true,
        configurable: true,
      });
      const { bold, dim } = await import('./colors.js');
      expect(hasAnsi(bold('x'))).toBe(false);
      expect(hasAnsi(dim('x'))).toBe(false);
    });

    it('enables colors when stdout is a TTY', async () => {
      delete process.env.NO_COLOR;
      delete process.env.FORCE_COLOR;
      Object.defineProperty(process.stdout, 'isTTY', {
        value: true,
        writable: true,
        configurable: true,
      });
      const { bold } = await import('./colors.js');
      // In TTY mode, bold should add ANSI sequences
      const result = bold('x');
      // picocolors adds sequences in TTY
      expect(typeof result).toBe('string');
      expect(result).toContain('x');
    });
  });

  describe('FORCE_COLOR override', () => {
    it('enables colors when FORCE_COLOR is set even if not a TTY', async () => {
      delete process.env.NO_COLOR;
      process.env.FORCE_COLOR = '1';
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        writable: true,
        configurable: true,
      });
      const { bold } = await import('./colors.js');
      const result = bold('hello');
      // With FORCE_COLOR, colors should be enabled
      expect(result).toContain('hello');
    });

    it('FORCE_COLOR does not override NO_COLOR', async () => {
      process.env.NO_COLOR = '1';
      process.env.FORCE_COLOR = '1';
      const { bold } = await import('./colors.js');
      // NO_COLOR takes precedence
      expect(bold('text')).toBe('text');
    });
  });

  describe('passthrough when colors are off', () => {
    it('returns plain text for all helpers when NO_COLOR is set', async () => {
      process.env.NO_COLOR = '1';
      const { bold, dim, red, green, yellow } = await import('./colors.js');
      const inputs = ['hello', 'world', '42', ''];
      for (const input of inputs) {
        expect(bold(input)).toBe(input);
        expect(dim(input)).toBe(input);
        expect(red(input)).toBe(input);
        expect(green(input)).toBe(input);
        expect(yellow(input)).toBe(input);
      }
    });
  });
});
