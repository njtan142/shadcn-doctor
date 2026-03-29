import path from 'node:path';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnMenubar } from './prefer-shadcn-menubar.js';

describe('prefer-shadcn-menubar rule', () => {
  const project = new Project();
  const rootPath = process.cwd();

  it('should detect <div role="menubar">', () => {
    const sourceFile = project.createSourceFile(
      path.join(rootPath, '__test_prefer_shadcn_menubar_div__.tsx'),
      `export const Test = () => (
  <div role="menubar">
    <button>File</button>
    <button>Edit</button>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnMenubar], rootPath);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-menubar',
      replacement: 'Menubar',
      element: 'div',
    });
  });

  it('should detect <nav role="menubar">', () => {
    const sourceFile = project.createSourceFile(
      path.join(rootPath, '__test_prefer_shadcn_menubar_nav__.tsx'),
      `export const Test = () => (
  <nav role="menubar">
    <button>File</button>
  </nav>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnMenubar], rootPath);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-menubar',
      replacement: 'Menubar',
      element: 'nav',
    });
  });

  it('should detect <div> with className containing "menubar"', () => {
    const sourceFile = project.createSourceFile(
      path.join(rootPath, '__test_prefer_shadcn_menubar_class__.tsx'),
      `export const Test = () => (
  <div className="menubar-container">
    <button>File</button>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnMenubar], rootPath);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-menubar',
      replacement: 'Menubar',
      element: 'div',
    });
  });

  it('should detect <div> with className containing "menu-bar"', () => {
    const sourceFile = project.createSourceFile(
      path.join(rootPath, '__test_prefer_shadcn_menubar_hyphen__.tsx'),
      `export const Test = () => (
  <div className="menu-bar flex">
    <button>Edit</button>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnMenubar], rootPath);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-menubar',
      replacement: 'Menubar',
      element: 'div',
    });
  });

  it('should not flag shadcn/ui Menubar component', () => {
    const sourceFile = project.createSourceFile(
      path.join(rootPath, '__test_prefer_shadcn_menubar_clean__.tsx'),
      `import { Menubar } from '@/components/ui/menubar';
export const Clean = () => <Menubar />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnMenubar], rootPath);
    expect(findings).toHaveLength(0);
  });

  it('should not flag a plain <div> without menubar role or className', () => {
    const sourceFile = project.createSourceFile(
      path.join(rootPath, '__test_prefer_shadcn_menubar_plain__.tsx'),
      `export const Clean = () => (
  <div className="flex items-center gap-2">
    <button>Click me</button>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnMenubar], rootPath);
    expect(findings).toHaveLength(0);
  });
});
