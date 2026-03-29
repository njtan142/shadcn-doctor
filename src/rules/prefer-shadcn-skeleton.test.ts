import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnSkeleton } from './prefer-shadcn-skeleton.js';

describe('prefer-shadcn-skeleton rule', () => {
  const project = new Project();

  it('should detect <div> with animate-pulse className', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_skeleton_pulse__.tsx',
      `export const Test = () => (
  <div className="animate-pulse rounded-md bg-muted h-4 w-full" />
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSkeleton], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-skeleton',
      replacement: 'Skeleton',
      element: 'div',
    });
  });

  it('should detect <div> with only animate-pulse (strong signal, no extra styling required)', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_skeleton_pulse_only__.tsx',
      `export const Test = () => (
  <div className="animate-pulse" />
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSkeleton], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-skeleton',
      replacement: 'Skeleton',
      element: 'div',
    });
  });

  it('should detect <div> with skeleton className and styling', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_skeleton_class__.tsx',
      `export const Test = () => (
  <div className="skeleton rounded h-4 w-32" />
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSkeleton], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-skeleton',
      replacement: 'Skeleton',
      element: 'div',
    });
  });

  it('should not flag <div> with skeleton keyword but no styling', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_skeleton_no_styling__.tsx',
      `export const Test = () => (
  <div className="skeleton-label">Loading...</div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSkeleton], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag shadcn/ui Skeleton component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_skeleton_clean__.tsx',
      `import { Skeleton } from '@/components/ui/skeleton';
export const Clean = () => <Skeleton className="h-4 w-full" />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSkeleton], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag plain <div> without skeleton signals', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_skeleton_nodiv__.tsx',
      `export const Test = () => (
  <div className="flex flex-col gap-4">
    <p>Some content</p>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSkeleton], process.cwd());
    expect(findings).toHaveLength(0);
  });
});
