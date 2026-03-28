import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('Config Resolver', () => {
  const testConfigPath = path.join(process.cwd(), '.shadcn-doctorrc.json');

  beforeEach(() => {
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
  });

  afterEach(() => {
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
  });

  it('should return default config when no config file exists', async () => {
    const { resolveConfig, getDefaultConfig } = await import('./config-resolver.js');
    const config = resolveConfig();
    const defaults = getDefaultConfig();

    expect(config.style).toBe('compact');
    expect(config.indent).toBe(2);
    expect(config.quotes).toBe('double');
    expect(config.printWidth).toBe(80);
    expect(config).toEqual(defaults);
  });

  it('should apply valid config settings', async () => {
    const { resolveConfig } = await import('./config-resolver.js');
    fs.writeFileSync(
      testConfigPath,
      JSON.stringify({
        style: 'expanded',
        indent: 4,
        quotes: 'single',
        printWidth: 100,
      }),
    );

    const config = resolveConfig();

    expect(config.style).toBe('expanded');
    expect(config.indent).toBe(4);
    expect(config.quotes).toBe('single');
    expect(config.printWidth).toBe(100);
  });

  it('should use defaults for invalid config values', async () => {
    const { resolveConfig } = await import('./config-resolver.js');
    fs.writeFileSync(
      testConfigPath,
      JSON.stringify({
        style: 'invalid-style',
        indent: 99,
        quotes: 'invalid-quotes',
        printWidth: -1,
      }),
    );

    const config = resolveConfig();

    expect(config.style).toBe('compact');
    expect(config.indent).toBe(2);
    expect(config.quotes).toBe('double');
    expect(config.printWidth).toBe(80);
  });

  it('should partially apply valid config values', async () => {
    const { resolveConfig } = await import('./config-resolver.js');
    fs.writeFileSync(
      testConfigPath,
      JSON.stringify({
        style: 'prettier',
      }),
    );

    const config = resolveConfig();

    expect(config.style).toBe('prettier');
    expect(config.indent).toBe(2);
    expect(config.quotes).toBe('double');
    expect(config.printWidth).toBe(80);
  });
});
