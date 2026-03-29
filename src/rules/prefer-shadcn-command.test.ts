import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnCommand } from './prefer-shadcn-command.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

describe('prefer-shadcn-command rule', () => {
  const project = new Project();

  it('should detect <div data-cmdk-root> (cmdk library pattern)', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_command_cmdk__.tsx',
      `export const Test = () => <div data-cmdk-root>Command menu</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCommand], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-command', replacement: 'Command' });
  });

  it('should detect <div> with className containing "command" and "palette"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_command_palette__.tsx',
      `export const Test = () => <div className="command-palette">...</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCommand], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-command', replacement: 'Command' });
  });

  it('should detect <div> with className containing "command" and "search"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_command_search__.tsx',
      `export const Test = () => <div className="command-search-bar">...</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCommand], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-command', replacement: 'Command' });
  });

  it('should detect <div role="combobox"> with className containing "command"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_command_combobox__.tsx',
      `export const Test = () => <div role="combobox" className="command-input">...</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCommand], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-command', replacement: 'Command' });
  });

  it('should not flag shadcn/ui Command component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_command_clean__.tsx',
      `import { Command } from '@/components/ui/command';
export const Clean = () => <Command />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCommand], rootDir);
    expect(findings).toHaveLength(0);
  });

  it('should not flag a plain <div> without command-related attributes', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_command_nodiv__.tsx',
      `export const Clean = () => <div className="sidebar-menu">Menu</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCommand], rootDir);
    expect(findings).toHaveLength(0);
  });
});
