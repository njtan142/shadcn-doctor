import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnScrollArea } from './prefer-shadcn-scroll-area.js';

describe('prefer-shadcn-scroll-area rule', () => {
  const project = new Project();

  it('should detect <div> with overflow-auto class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_scroll_area_auto__.tsx',
      `export const Test = () => <div className="overflow-auto h-64">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnScrollArea], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-scroll-area',
      replacement: 'ScrollArea',
      element: 'div',
    });
  });

  it('should detect <div> with overflow-scroll class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_scroll_area_scroll__.tsx',
      `export const Test = () => <div className="overflow-scroll h-64">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnScrollArea], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-scroll-area',
      replacement: 'ScrollArea',
    });
  });

  it('should detect <div> with overflow-y-auto class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_scroll_area_y_auto__.tsx',
      `export const Test = () => <div className="h-64 overflow-y-auto">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnScrollArea], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-scroll-area',
      replacement: 'ScrollArea',
    });
  });

  it('should detect <div> with overflow-x-auto class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_scroll_area_x_auto__.tsx',
      `export const Test = () => <div className="overflow-x-auto w-full">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnScrollArea], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-scroll-area',
      replacement: 'ScrollArea',
    });
  });

  it('should detect <div> with overflow-y-scroll class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_scroll_area_y_scroll__.tsx',
      `export const Test = () => <div className="overflow-y-scroll">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnScrollArea], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-scroll-area',
      replacement: 'ScrollArea',
    });
  });

  it('should detect <div> with overflow-x-scroll class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_scroll_area_x_scroll__.tsx',
      `export const Test = () => <div className="overflow-x-scroll">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnScrollArea], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-scroll-area',
      replacement: 'ScrollArea',
    });
  });

  it('should not flag <div> with unrelated overflow class like overflow-hidden', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_scroll_area_hidden__.tsx',
      `export const Test = () => <div className="overflow-hidden">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnScrollArea], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag <div> with no className', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_scroll_area_no_class__.tsx',
      `export const Test = () => <div>content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnScrollArea], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag shadcn/ui ScrollArea component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_scroll_area_clean__.tsx',
      `import { ScrollArea } from '@/components/ui/scroll-area';
export const Clean = () => <ScrollArea className="h-64"><p>content</p></ScrollArea>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnScrollArea], process.cwd());
    expect(findings).toHaveLength(0);
  });
});
