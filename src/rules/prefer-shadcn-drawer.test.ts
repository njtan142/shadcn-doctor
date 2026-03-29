import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnDrawer } from './prefer-shadcn-drawer.js';

describe('prefer-shadcn-drawer rule', () => {
  const project = new Project();

  it('should detect <div> with className containing "drawer"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_drawer__.tsx',
      `export const Test = () => (
  <div className="drawer">
    <p>Drawer content</p>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnDrawer], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-drawer',
      replacement: 'Drawer',
      element: 'div',
    });
  });

  it('should detect <div> with className containing "drawer" as part of a compound class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_drawer_compound__.tsx',
      `export const Test = () => (
  <div className="drawer-container fixed bottom-0">
    <p>Drawer content</p>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnDrawer], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-drawer',
      replacement: 'Drawer',
      element: 'div',
    });
  });

  it('should detect <div role="dialog"> with className containing "drawer"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_drawer_dialog__.tsx',
      `export const Test = () => (
  <div role="dialog" className="drawer-panel">
    <p>Drawer content</p>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnDrawer], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-drawer',
      replacement: 'Drawer',
      element: 'div',
    });
  });

  it('should detect <div role="dialog"> with className containing "bottom-sheet"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_drawer_bottom_sheet__.tsx',
      `export const Test = () => (
  <div role="dialog" className="bottom-sheet">
    <p>Bottom sheet content</p>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnDrawer], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-drawer',
      replacement: 'Drawer',
      element: 'div',
    });
  });

  it('should not flag shadcn/ui Drawer component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_drawer_clean__.tsx',
      `import { Drawer } from '@/components/ui/drawer';
export const Clean = () => <Drawer />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnDrawer], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag a plain <div> without drawer indicators', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_drawer_plain__.tsx',
      `export const Clean = () => (
  <div className="flex flex-col items-center p-4">
    <p>Some content</p>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnDrawer], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag <div role="dialog"> without drawer className', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_drawer_dialog_no_class__.tsx',
      `export const Clean = () => (
  <div role="dialog" className="modal-overlay">
    <p>Modal content</p>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnDrawer], process.cwd());
    expect(findings).toHaveLength(0);
  });
});
