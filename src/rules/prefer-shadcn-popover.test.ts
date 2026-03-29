import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnPopover } from './prefer-shadcn-popover.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

describe('prefer-shadcn-popover rule', () => {
  const project = new Project();

  it('should detect <div> with className containing "popover"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_popover_class__.tsx',
      `export const Test = () => (
  <div className="popover-content">Content here</div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnPopover], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-popover',
      replacement: 'Popover',
      element: 'div',
    });
  });

  it('should detect <div> with data-popover attribute', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_popover_data__.tsx',
      `export const Test = () => (
  <div data-popover="true">Content here</div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnPopover], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-popover',
      replacement: 'Popover',
      element: 'div',
    });
  });

  it('should detect <div> with data-popper attribute', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_popover_popper__.tsx',
      `export const Test = () => (
  <div data-popper="placement">Content here</div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnPopover], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-popover',
      replacement: 'Popover',
      element: 'div',
    });
  });

  it('should not flag shadcn/ui Popover component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_popover_clean__.tsx',
      `import { Popover } from '@/components/ui/popover';
export const Clean = () => <Popover />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnPopover], rootDir);
    expect(findings).toHaveLength(0);
  });
});
