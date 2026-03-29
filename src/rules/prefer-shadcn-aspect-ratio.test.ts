import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnAspectRatio } from './prefer-shadcn-aspect-ratio.js';

describe('prefer-shadcn-aspect-ratio rule', () => {
  const project = new Project();

  it('should detect <div> with aspect-video class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_aspect_ratio_video__.tsx',
      `export const Test = () => <div className="aspect-video w-full">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnAspectRatio], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-aspect-ratio',
      replacement: 'AspectRatio',
      element: 'div',
    });
  });

  it('should detect <div> with aspect-square class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_aspect_ratio_square__.tsx',
      `export const Test = () => <div className="aspect-square rounded-md">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnAspectRatio], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-aspect-ratio',
      replacement: 'AspectRatio',
    });
  });

  it('should detect <div> with aspect-auto class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_aspect_ratio_auto__.tsx',
      `export const Test = () => <div className="aspect-auto">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnAspectRatio], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-aspect-ratio',
      replacement: 'AspectRatio',
    });
  });

  it('should detect <div> with aspect-ratio keyword class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_aspect_ratio_keyword__.tsx',
      `export const Test = () => <div className="aspect-ratio relative">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnAspectRatio], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-aspect-ratio',
      replacement: 'AspectRatio',
    });
  });

  it('should detect <div> with @tailwindcss/aspect-ratio plugin aspect-w- class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_aspect_ratio_w__.tsx',
      `export const Test = () => <div className="aspect-w-16 aspect-h-9">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnAspectRatio], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-aspect-ratio',
      replacement: 'AspectRatio',
    });
  });

  it('should detect <div> with aspect-h- class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_aspect_ratio_h__.tsx',
      `export const Test = () => <div className="aspect-h-9">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnAspectRatio], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-aspect-ratio',
      replacement: 'AspectRatio',
    });
  });

  it('should not flag <div> with unrelated classes', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_aspect_ratio_unrelated__.tsx',
      `export const Test = () => <div className="flex items-center p-4">content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnAspectRatio], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag <div> with no className', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_aspect_ratio_no_class__.tsx',
      `export const Test = () => <div>content</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnAspectRatio], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag shadcn/ui AspectRatio component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_aspect_ratio_clean__.tsx',
      `import { AspectRatio } from '@/components/ui/aspect-ratio';
export const Clean = () => (
  <AspectRatio ratio={16 / 9}>
    <img src="image.jpg" alt="cover" className="object-cover" />
  </AspectRatio>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnAspectRatio], process.cwd());
    expect(findings).toHaveLength(0);
  });
});
