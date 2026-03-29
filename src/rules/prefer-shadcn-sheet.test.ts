import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnSheet } from './prefer-shadcn-sheet.js';

describe('prefer-shadcn-sheet rule', () => {
  const project = new Project();

  it('should detect <div> with className containing "sheet" and "fixed"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_sheet_fixed__.tsx',
      `export const Test = () => (
  <div className="sheet fixed inset-y-0 right-0">
    <p>Sheet content</p>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSheet], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-sheet',
      replacement: 'Sheet',
      element: 'div',
    });
  });

  it('should detect <div> with className containing "sheet" and "absolute"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_sheet_absolute__.tsx',
      `export const Test = () => (
  <div className="sheet absolute side">
    <p>Sheet content</p>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSheet], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-sheet',
      replacement: 'Sheet',
      element: 'div',
    });
  });

  it('should detect <div role="dialog"> with className containing "sheet"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_sheet_dialog__.tsx',
      `export const Test = () => (
  <div role="dialog" className="sheet-panel">
    <p>Sheet content</p>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSheet], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-sheet',
      replacement: 'Sheet',
      element: 'div',
    });
  });

  it('should detect <div role="dialog"> with className containing "slide-in"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_sheet_slide__.tsx',
      `export const Test = () => (
  <div role="dialog" className="slide-in-panel">
    <p>Side panel content</p>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSheet], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-sheet',
      replacement: 'Sheet',
      element: 'div',
    });
  });

  it('should not flag shadcn/ui Sheet component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_sheet_clean__.tsx',
      `import { Sheet } from '@/components/ui/sheet';
export const Clean = () => <Sheet />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSheet], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag a plain <div> without sheet indicators', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_sheet_plain__.tsx',
      `export const Clean = () => (
  <div className="fixed inset-0 bg-black/50">
    <p>Overlay</p>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSheet], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag <div> with "sheet" className but no positioning keyword', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_sheet_no_position__.tsx',
      `export const Clean = () => (
  <div className="sheet-music-display">
    <p>Music sheet</p>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSheet], process.cwd());
    expect(findings).toHaveLength(0);
  });
});
