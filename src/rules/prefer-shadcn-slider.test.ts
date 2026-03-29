import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnSlider } from './prefer-shadcn-slider.js';

describe('prefer-shadcn-slider rule', () => {
  const project = new Project();

  it('should detect raw <input type="range"> self-closing element', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_slider_self_closing__.tsx',
      `export const Test = () => <input type="range" min={0} max={100} />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSlider], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-slider',
      replacement: 'Slider',
      element: 'input',
    });
  });

  it('should detect raw <input type="range"> opening element', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_slider_opening__.tsx',
      `export const Test = () => <div><input type="range"></input></div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSlider], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-slider',
      replacement: 'Slider',
      element: 'input',
    });
  });

  it('should not flag <input type="text">', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_slider_text__.tsx',
      `export const Test = () => <input type="text" />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSlider], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag shadcn/ui Slider component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_slider_clean__.tsx',
      `import { Slider } from '@/components/ui/slider';
export const Clean = () => <Slider defaultValue={[50]} max={100} step={1} />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnSlider], process.cwd());
    expect(findings).toHaveLength(0);
  });
});
