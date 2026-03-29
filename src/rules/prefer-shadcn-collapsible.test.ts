import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnCollapsible } from './prefer-shadcn-collapsible.js';

describe('prefer-shadcn-collapsible rule', () => {
  const project = new Project();

  it('should detect <div> with aria-expanded attribute', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_collapsible_aria__.tsx',
      `export const Test = () => (
  <div aria-expanded="false">
    <p>Collapsible content</p>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCollapsible], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-collapsible',
      replacement: 'Collapsible',
      element: 'div',
    });
  });

  it('should detect <div> with aria-expanded set to a dynamic value', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_collapsible_aria_dynamic__.tsx',
      `export const Test = ({ open }: { open: boolean }) => (
  <div aria-expanded={open}>
    <p>Collapsible content</p>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCollapsible], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-collapsible',
      replacement: 'Collapsible',
      element: 'div',
    });
  });

  it('should detect <div> with collapsible className', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_collapsible_class__.tsx',
      `export const Test = () => (
  <div className="collapsible-panel">
    <p>Content</p>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCollapsible], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-collapsible',
      replacement: 'Collapsible',
      element: 'div',
    });
  });

  it('should not flag shadcn/ui Collapsible component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_collapsible_clean__.tsx',
      `import { Collapsible } from '@/components/ui/collapsible';
export const Clean = () => <Collapsible />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCollapsible], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag plain <div> without aria-expanded or collapsible class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_collapsible_nodiv__.tsx',
      `export const Test = () => (
  <div className="flex flex-col">
    <p>Some content</p>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnCollapsible], process.cwd());
    expect(findings).toHaveLength(0);
  });
});
