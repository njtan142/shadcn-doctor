import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnProgress } from './prefer-shadcn-progress.js';

describe('prefer-shadcn-progress rule', () => {
  const project = new Project();

  it('should detect raw <progress> elements', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_progress_native__.tsx',
      `export const Test = () => (
  <div>
    <progress value={60} max={100} />
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnProgress], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-progress',
      replacement: 'Progress',
      element: 'progress',
    });
  });

  it('should detect <div role="progressbar">', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_progress_role__.tsx',
      `export const Test = () => (
  <div role="progressbar" aria-valuenow={60} aria-valuemin={0} aria-valuemax={100} />
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnProgress], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-progress',
      replacement: 'Progress',
      element: 'div',
    });
  });

  it('should detect <div> with progress className and styling', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_progress_class__.tsx',
      `export const Test = () => (
  <div className="progress-bar h-2 bg-blue-500 rounded-full" />
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnProgress], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-progress',
      replacement: 'Progress',
      element: 'div',
    });
  });

  it('should not flag <div> with progress keyword but no styling', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_progress_no_styling__.tsx',
      `export const Test = () => (
  <div className="progress-label">50%</div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnProgress], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag shadcn/ui Progress component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_progress_clean__.tsx',
      `import { Progress } from '@/components/ui/progress';
export const Clean = () => <Progress value={60} />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnProgress], process.cwd());
    expect(findings).toHaveLength(0);
  });
});
