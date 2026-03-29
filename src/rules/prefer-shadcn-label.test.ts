import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnLabel } from './prefer-shadcn-label.js';

describe('prefer-shadcn-label rule', () => {
  const project = new Project();

  it('should detect <label> with className containing "text-sm"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_label_text_sm__.tsx',
      `export const Test = () => <label className="text-sm">Name</label>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnLabel], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-label',
      replacement: 'Label',
      element: 'label',
    });
  });

  it('should detect <label> with className containing "font-medium"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_label_font_medium__.tsx',
      `export const Test = () => <label className="block font-medium text-gray-700">Email</label>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnLabel], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-label', replacement: 'Label' });
  });

  it('should detect <label> with className containing "text-xs"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_label_text_xs__.tsx',
      `export const Test = () => <label className="text-xs uppercase tracking-wide">Username</label>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnLabel], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-label', replacement: 'Label' });
  });

  it('should detect <label> with className containing "font-semibold"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_label_font_semibold__.tsx',
      `export const Test = () => <label className="font-semibold">Password</label>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnLabel], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-label', replacement: 'Label' });
  });

  it('should detect <label> with className containing "label" keyword', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_label_keyword__.tsx',
      `export const Test = () => <label className="form-label required">Field</label>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnLabel], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-label', replacement: 'Label' });
  });

  it('should not flag a plain <label> without className', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_label_plain__.tsx',
      `export const Test = () => <label htmlFor="name">Name</label>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnLabel], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag <label> with unrelated className', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_label_unrelated__.tsx',
      `export const Test = () => <label className="sr-only">Hidden label</label>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnLabel], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag shadcn/ui Label component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_label_clean__.tsx',
      `import { Label } from '@/components/ui/label';
export const Clean = () => <Label htmlFor="email">Email</Label>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnLabel], process.cwd());
    expect(findings).toHaveLength(0);
  });
});
