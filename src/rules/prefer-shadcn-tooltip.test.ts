import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnTooltip } from './prefer-shadcn-tooltip.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

describe('prefer-shadcn-tooltip rule', () => {
  const project = new Project();

  it('should detect <div role="tooltip">', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_tooltip_role__.tsx',
      `export const Test = () => (
  <div>
    <div role="tooltip">Hover info</div>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnTooltip], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-tooltip',
      replacement: 'Tooltip',
      element: 'div',
    });
  });

  it('should detect <span> with className containing "tooltip"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_tooltip_span__.tsx',
      `export const Test = () => (
  <span className="tooltip-text">Hover me</span>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnTooltip], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-tooltip',
      replacement: 'Tooltip',
      element: 'span',
    });
  });

  it('should detect <div> with className containing "tooltip"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_tooltip_div_class__.tsx',
      `export const Test = () => (
  <div className="custom-tooltip">Hover info</div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnTooltip], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-tooltip',
      replacement: 'Tooltip',
      element: 'div',
    });
  });

  it('should not flag shadcn/ui Tooltip component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_tooltip_clean__.tsx',
      `import { Tooltip } from '@/components/ui/tooltip';
export const Clean = () => <Tooltip />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnTooltip], rootDir);
    expect(findings).toHaveLength(0);
  });
});
