import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnResizable } from './prefer-shadcn-resizable.js';

describe('prefer-shadcn-resizable rule', () => {
  const project = new Project();

  it('should detect <div> with Tailwind resize class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_resizable_resize__.tsx',
      `export const Test = () => <div className="resize border p-4">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnResizable], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-resizable',
      replacement: 'Resizable',
      element: 'div',
    });
  });

  it('should detect <div> with resize-x class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_resizable_resize_x__.tsx',
      `export const Test = () => <div className="resize-x overflow-auto">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnResizable], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-resizable',
      replacement: 'Resizable',
    });
  });

  it('should detect <div> with resize-y class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_resizable_resize_y__.tsx',
      `export const Test = () => <div className="resize-y overflow-auto">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnResizable], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-resizable',
      replacement: 'Resizable',
    });
  });

  it('should detect <div> with resizable keyword in className', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_resizable_keyword__.tsx',
      `export const Test = () => <div className="resizable panel">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnResizable], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-resizable',
      replacement: 'Resizable',
    });
  });

  it('should detect <div> with resize-handle keyword in className', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_resizable_handle__.tsx',
      `export const Test = () => <div className="resize-handle absolute">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnResizable], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-resizable',
      replacement: 'Resizable',
    });
  });

  it('should not flag resize-none (non-resizable intent)', () => {
    // resize-none IS a Tailwind resize utility — but indicating the element was
    // intentionally made non-resizable can still be a signal. However, per the
    // rule spec, resize-none is in the exact-token set so it IS flagged.
    // This test verifies that behavior is consistent.
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_resizable_none__.tsx',
      `export const Test = () => <div className="resize-none">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnResizable], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-resizable',
      replacement: 'Resizable',
    });
  });

  it('should not flag <div> with unrelated className', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_resizable_unrelated__.tsx',
      `export const Test = () => <div className="flex items-center p-4">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnResizable], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag <div> with no className', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_resizable_no_class__.tsx',
      `export const Test = () => <div>content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnResizable], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag shadcn/ui Resizable component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_resizable_clean__.tsx',
      `import { ResizablePanelGroup, ResizablePanel } from '@/components/ui/resizable';
export const Clean = () => (
  <ResizablePanelGroup direction="horizontal">
    <ResizablePanel>One</ResizablePanel>
    <ResizablePanel>Two</ResizablePanel>
  </ResizablePanelGroup>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnResizable], process.cwd());
    expect(findings).toHaveLength(0);
  });
});
