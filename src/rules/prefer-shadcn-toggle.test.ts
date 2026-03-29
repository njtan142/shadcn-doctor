import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnToggle } from './prefer-shadcn-toggle.js';

describe('prefer-shadcn-toggle rule', () => {
  const project = new Project();

  it('should detect <button aria-pressed="true">', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_toggle_pressed_true__.tsx',
      `export const Test = () => <button aria-pressed="true">Bold</button>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnToggle], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-toggle',
      replacement: 'Toggle',
      element: 'button',
    });
  });

  it('should detect <button aria-pressed="false">', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_toggle_pressed_false__.tsx',
      `export const Test = () => <button aria-pressed="false">Italic</button>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnToggle], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-toggle',
      replacement: 'Toggle',
      element: 'button',
    });
  });

  it('should detect self-closing <button aria-pressed={isActive} />', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_toggle_self_closing__.tsx',
      `export const Test = ({ isActive }: { isActive: boolean }) => <button aria-pressed={isActive} />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnToggle], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-toggle', replacement: 'Toggle' });
  });

  it('should not flag a plain <button> without aria-pressed', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_toggle_plain__.tsx',
      `export const Test = () => <button onClick={() => {}}>Click me</button>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnToggle], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag shadcn/ui Toggle component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_toggle_clean__.tsx',
      `import { Toggle } from '@/components/ui/toggle';
export const Clean = () => <Toggle aria-label="Toggle italic">Italic</Toggle>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnToggle], process.cwd());
    expect(findings).toHaveLength(0);
  });
});
