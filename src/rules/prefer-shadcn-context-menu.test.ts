import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnContextMenu } from './prefer-shadcn-context-menu.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

describe('prefer-shadcn-context-menu rule', () => {
  const project = new Project();

  it('should detect raw <menu> HTML element', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_context_menu_tag__.tsx',
      `export const Test = () => (
  <menu>
    <li>Cut</li>
    <li>Copy</li>
  </menu>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnContextMenu], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-context-menu',
      replacement: 'ContextMenu',
      element: 'menu',
    });
  });

  it('should detect <div> with role="menu" and data-context attribute', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_context_menu_role_data__.tsx',
      `export const Test = () => (
  <div role="menu" data-context="true">
    <button>Cut</button>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnContextMenu], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-context-menu',
      replacement: 'ContextMenu',
      element: 'div',
    });
  });

  it('should detect <div> with className containing "context-menu"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_context_menu_class_hyphen__.tsx',
      `export const Test = () => (
  <div className="context-menu">
    <button>Cut</button>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnContextMenu], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-context-menu',
      replacement: 'ContextMenu',
      element: 'div',
    });
  });

  it('should detect <ul> with className containing "contextmenu"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_context_menu_class_joined__.tsx',
      `export const Test = () => (
  <ul className="contextmenu-items">
    <li>Paste</li>
  </ul>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnContextMenu], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-context-menu',
      replacement: 'ContextMenu',
      element: 'ul',
    });
  });

  it('should not flag <div role="menu"> without context signals (leave for DropdownMenu)', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_context_menu_no_context__.tsx',
      `export const Test = () => (
  <div role="menu">
    <button>Item 1</button>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnContextMenu], rootDir);
    expect(findings).toHaveLength(0);
  });

  it('should not flag shadcn/ui ContextMenu component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_context_menu_clean__.tsx',
      `import { ContextMenu } from '@/components/ui/context-menu';
export const Clean = () => <ContextMenu />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnContextMenu], rootDir);
    expect(findings).toHaveLength(0);
  });
});
