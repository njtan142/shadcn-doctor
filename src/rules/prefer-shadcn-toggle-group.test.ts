import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnToggleGroup } from './prefer-shadcn-toggle-group.js';

describe('prefer-shadcn-toggle-group rule', () => {
  const project = new Project();

  it('should detect <div role="group"> with className containing "toggle"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_toggle_group_role__.tsx',
      `export const Test = () => (
  <div role="group" className="toggle-buttons">
    <button>A</button>
    <button>B</button>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnToggleGroup], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-toggle-group',
      replacement: 'ToggleGroup',
      element: 'div',
    });
  });

  it('should detect <div> with className containing "toggle-group"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_toggle_group_class__.tsx',
      `export const Test = () => (
  <div className="toggle-group flex">
    <button>Left</button>
    <button>Right</button>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnToggleGroup], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-toggle-group',
      replacement: 'ToggleGroup',
    });
  });

  it('should detect <div> with className containing "togglegroup"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_toggle_group_camel__.tsx',
      `export const Test = () => (
  <div className="togglegroup-container">
    <button>A</button>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnToggleGroup], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-toggle-group',
      replacement: 'ToggleGroup',
    });
  });

  it('should not flag <div role="group"> without toggle className', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_toggle_group_no_class__.tsx',
      `export const Test = () => (
  <div role="group" className="button-group">
    <button>A</button>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnToggleGroup], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag a plain <div> without toggle-related className', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_toggle_group_plain__.tsx',
      `export const Test = () => <div className="flex gap-2"><button>A</button></div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnToggleGroup], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag shadcn/ui ToggleGroup component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_toggle_group_clean__.tsx',
      `import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
export const Clean = () => (
  <ToggleGroup type="single">
    <ToggleGroupItem value="a">A</ToggleGroupItem>
  </ToggleGroup>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnToggleGroup], process.cwd());
    expect(findings).toHaveLength(0);
  });
});
