import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnSeparator } from './prefer-shadcn-separator.js';

describe('prefer-shadcn-separator rule', () => {
  const project = new Project();

  it('should detect raw <hr> elements', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_separator_hr__.tsx',
      `export const Test = () => (
  <div>
    <p>Above</p>
    <hr />
    <p>Below</p>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSeparator], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-separator',
      replacement: 'Separator',
      element: 'hr',
    });
  });

  it('should detect <div role="separator">', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_separator_role_div__.tsx',
      `export const Test = () => (
  <div>
    <div role="separator" />
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSeparator], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-separator',
      replacement: 'Separator',
      element: 'div',
    });
  });

  it('should detect <span role="separator">', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_separator_role_span__.tsx',
      `export const Test = () => (
  <div>
    <span role="separator" />
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSeparator], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-separator',
      replacement: 'Separator',
      element: 'span',
    });
  });

  it('should detect <div> with divider className and border styling', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_separator_divider_class__.tsx',
      `export const Test = () => (
  <div>
    <div className="divider border-t my-4" />
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSeparator], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-separator',
      replacement: 'Separator',
      element: 'div',
    });
  });

  it('should detect <div> with separator className and h-px styling', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_separator_sep_class__.tsx',
      `export const Test = () => (
  <div>
    <div className="separator h-px bg-gray-200 my-2" />
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSeparator], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-separator',
      replacement: 'Separator',
      element: 'div',
    });
  });

  it('should not flag <div> with divider keyword but no styling signal', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_separator_no_styling__.tsx',
      `export const Test = () => (
  <div className="divider my-4">Content</div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSeparator], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag shadcn/ui Separator component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_separator_clean__.tsx',
      `import { Separator } from '@/components/ui/separator';
export const Clean = () => <Separator />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSeparator], process.cwd());
    expect(findings).toHaveLength(0);
  });
});
