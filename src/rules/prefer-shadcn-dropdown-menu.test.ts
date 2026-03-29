import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnDropdownMenu } from './prefer-shadcn-dropdown-menu.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

describe('prefer-shadcn-dropdown-menu rule', () => {
  const project = new Project();

  it('should detect <ul> with role="menu"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_dropdown_menu_ul_role__.tsx',
      `export const Test = () => (
  <ul role="menu">
    <li>Item 1</li>
  </ul>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnDropdownMenu], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-dropdown-menu',
      replacement: 'DropdownMenu',
    });
  });

  it('should detect <div> with role="menu"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_dropdown_menu_div_role__.tsx',
      `export const Test = () => (
  <div role="menu">
    <button>Item 1</button>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnDropdownMenu], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-dropdown-menu',
      replacement: 'DropdownMenu',
    });
  });

  it('should detect <ul> with className containing "dropdown" and "menu"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_dropdown_menu_class_ul__.tsx',
      `export const Test = () => (
  <ul className="dropdown-menu">
    <li>Item 1</li>
  </ul>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnDropdownMenu], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-dropdown-menu',
      replacement: 'DropdownMenu',
      element: 'ul',
    });
  });

  it('should detect <div> with className containing "dropdown" and "list"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_dropdown_menu_class_list__.tsx',
      `export const Test = () => (
  <div className="dropdown-list">
    <button>Item 1</button>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnDropdownMenu], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-dropdown-menu',
      replacement: 'DropdownMenu',
      element: 'div',
    });
  });

  it('should not flag when className has "dropdown" but no "menu" or "list"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_dropdown_menu_no_signal__.tsx',
      `export const Test = () => (
  <div className="dropdown-wrapper">Content</div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnDropdownMenu], rootDir);
    expect(findings).toHaveLength(0);
  });

  it('should not flag shadcn/ui DropdownMenu component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_dropdown_menu_clean__.tsx',
      `import { DropdownMenu } from '@/components/ui/dropdown-menu';
export const Clean = () => <DropdownMenu />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnDropdownMenu], rootDir);
    expect(findings).toHaveLength(0);
  });
});
