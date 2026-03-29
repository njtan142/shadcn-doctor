import path from 'node:path';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnNavigationMenu } from './prefer-shadcn-navigation-menu.js';

describe('prefer-shadcn-navigation-menu rule', () => {
  const project = new Project();
  const rootPath = process.cwd();

  it('should detect <nav role="navigation">', () => {
    const sourceFile = project.createSourceFile(
      path.join(rootPath, '__test_prefer_shadcn_nav_menu__.tsx'),
      `export const Test = () => (
  <nav role="navigation">
    <ul>
      <li>Home</li>
    </ul>
  </nav>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnNavigationMenu], rootPath);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-navigation-menu',
      replacement: 'NavigationMenu',
      element: 'nav',
    });
  });

  it('should detect <nav> with className containing "nav-menu"', () => {
    const sourceFile = project.createSourceFile(
      path.join(rootPath, '__test_prefer_shadcn_nav_menu_class__.tsx'),
      `export const Test = () => (
  <nav className="nav-menu">
    <ul>
      <li>Home</li>
    </ul>
  </nav>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnNavigationMenu], rootPath);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-navigation-menu',
      replacement: 'NavigationMenu',
      element: 'nav',
    });
  });

  it('should detect <nav> with className containing "navigation-menu"', () => {
    const sourceFile = project.createSourceFile(
      path.join(rootPath, '__test_prefer_shadcn_nav_menu_full__.tsx'),
      `export const Test = () => (
  <nav className="navigation-menu-wrapper">
    <ul>
      <li>Home</li>
    </ul>
  </nav>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnNavigationMenu], rootPath);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-navigation-menu',
      replacement: 'NavigationMenu',
      element: 'nav',
    });
  });

  it('should detect <ul> with className containing "nav-menu"', () => {
    const sourceFile = project.createSourceFile(
      path.join(rootPath, '__test_prefer_shadcn_nav_menu_ul__.tsx'),
      `export const Test = () => (
  <ul className="nav-menu-list">
    <li>Home</li>
  </ul>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnNavigationMenu], rootPath);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-navigation-menu',
      replacement: 'NavigationMenu',
      element: 'ul',
    });
  });

  it('should not flag shadcn/ui NavigationMenu component', () => {
    const sourceFile = project.createSourceFile(
      path.join(rootPath, '__test_prefer_shadcn_nav_menu_clean__.tsx'),
      `import { NavigationMenu } from '@/components/ui/navigation-menu';
export const Clean = () => <NavigationMenu />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnNavigationMenu], rootPath);
    expect(findings).toHaveLength(0);
  });

  it('should not flag a plain <nav> without role or nav-menu className', () => {
    const sourceFile = project.createSourceFile(
      path.join(rootPath, '__test_prefer_shadcn_nav_menu_plain__.tsx'),
      `export const Clean = () => (
  <nav className="site-header">
    <ul>
      <li>Home</li>
    </ul>
  </nav>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnNavigationMenu], rootPath);
    expect(findings).toHaveLength(0);
  });
});
