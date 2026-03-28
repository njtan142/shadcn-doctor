import fs from 'node:fs';
import path from 'node:path';

export type StylePreset = 'compact' | 'expanded' | 'prettier';
export type QuoteStyle = 'single' | 'double';

export type Config = {
  style: StylePreset;
  indent: number;
  quotes: QuoteStyle;
  printWidth: number;
};

const defaultConfig: Config = {
  style: 'compact',
  indent: 2,
  quotes: 'double',
  printWidth: 80,
};

function getConfigPath(): string {
  const cwd = process.cwd();
  return path.join(cwd, '.shadcn-doctorrc.json');
}

export function resolveConfig(): Config {
  const configPath = getConfigPath();

  if (!fs.existsSync(configPath)) {
    return { ...defaultConfig };
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(content);

    const config: Config = { ...defaultConfig };

    if (parsed.style === 'compact' || parsed.style === 'expanded' || parsed.style === 'prettier') {
      config.style = parsed.style;
    }

    if (typeof parsed.indent === 'number' && [2, 4].includes(parsed.indent)) {
      config.indent = parsed.indent;
    }

    if (parsed.quotes === 'single' || parsed.quotes === 'double') {
      config.quotes = parsed.quotes;
    }

    if (typeof parsed.printWidth === 'number' && parsed.printWidth > 0) {
      config.printWidth = parsed.printWidth;
    }

    return config;
  } catch {
    console.error('⚠ Invalid config: .shadcn-doctorrc.json (using defaults)');
    return { ...defaultConfig };
  }
}

export function getDefaultConfig(): Config {
  return { ...defaultConfig };
}
