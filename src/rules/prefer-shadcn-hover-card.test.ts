import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnHoverCard } from './prefer-shadcn-hover-card.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

describe('prefer-shadcn-hover-card rule', () => {
  const project = new Project();

  it('should detect <div> with className containing "hover-card"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_hover_card_hyphen__.tsx',
      `export const Test = () => (
  <div className="hover-card-content">Profile info</div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnHoverCard], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-hover-card',
      replacement: 'HoverCard',
      element: 'div',
    });
  });

  it('should detect <div> with className containing "hovercard"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_hover_card_joined__.tsx',
      `export const Test = () => (
  <div className="hovercard-wrapper">Profile info</div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnHoverCard], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-hover-card',
      replacement: 'HoverCard',
      element: 'div',
    });
  });

  it('should not flag shadcn/ui HoverCard component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_hover_card_clean__.tsx',
      `import { HoverCard } from '@/components/ui/hover-card';
export const Clean = () => <HoverCard />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnHoverCard], rootDir);
    expect(findings).toHaveLength(0);
  });

  it('should not flag a plain <div> without hover-card class', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_hover_card_no_match__.tsx',
      `export const Test = () => (
  <div className="card-wrapper">Content</div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnHoverCard], rootDir);
    expect(findings).toHaveLength(0);
  });
});
