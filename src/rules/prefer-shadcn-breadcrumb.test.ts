import path from 'node:path';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnBreadcrumb } from './prefer-shadcn-breadcrumb.js';

describe('prefer-shadcn-breadcrumb rule', () => {
  const project = new Project();
  const rootPath = process.cwd();

  it('should detect <nav aria-label="breadcrumb">', () => {
    const sourceFile = project.createSourceFile(
      path.join(rootPath, '__test_prefer_shadcn_breadcrumb__.tsx'),
      `export const Test = () => (
  <nav aria-label="breadcrumb">
    <ol>
      <li>Home</li>
      <li>About</li>
    </ol>
  </nav>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnBreadcrumb], rootPath);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-breadcrumb',
      replacement: 'Breadcrumb',
      element: 'nav',
    });
  });

  it('should detect <nav aria-label="Breadcrumb"> (capitalized)', () => {
    const sourceFile = project.createSourceFile(
      path.join(rootPath, '__test_prefer_shadcn_breadcrumb_caps__.tsx'),
      `export const Test = () => (
  <nav aria-label="Breadcrumb">
    <ol>
      <li>Home</li>
    </ol>
  </nav>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnBreadcrumb], rootPath);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-breadcrumb',
      replacement: 'Breadcrumb',
      element: 'nav',
    });
  });

  it('should detect <ol> with className containing "breadcrumb"', () => {
    const sourceFile = project.createSourceFile(
      path.join(rootPath, '__test_prefer_shadcn_breadcrumb_ol__.tsx'),
      `export const Test = () => (
  <ol className="breadcrumb-list">
    <li>Home</li>
    <li>About</li>
  </ol>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnBreadcrumb], rootPath);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-breadcrumb',
      replacement: 'Breadcrumb',
      element: 'ol',
    });
  });

  it('should detect <ul> with className containing "breadcrumb"', () => {
    const sourceFile = project.createSourceFile(
      path.join(rootPath, '__test_prefer_shadcn_breadcrumb_ul__.tsx'),
      `export const Test = () => (
  <ul className="breadcrumb">
    <li>Home</li>
  </ul>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnBreadcrumb], rootPath);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-breadcrumb',
      replacement: 'Breadcrumb',
      element: 'ul',
    });
  });

  it('should not flag shadcn/ui Breadcrumb component', () => {
    const sourceFile = project.createSourceFile(
      path.join(rootPath, '__test_prefer_shadcn_breadcrumb_clean__.tsx'),
      `import { Breadcrumb } from '@/components/ui/breadcrumb';
export const Clean = () => <Breadcrumb />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnBreadcrumb], rootPath);
    expect(findings).toHaveLength(0);
  });

  it('should not flag <nav> without aria-label="breadcrumb"', () => {
    const sourceFile = project.createSourceFile(
      path.join(rootPath, '__test_prefer_shadcn_breadcrumb_no_flag__.tsx'),
      `export const Clean = () => (
  <nav aria-label="main navigation">
    <ul>
      <li>Home</li>
    </ul>
  </nav>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnBreadcrumb], rootPath);
    expect(findings).toHaveLength(0);
  });
});
