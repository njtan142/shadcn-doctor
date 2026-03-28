import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnBadge } from './prefer-shadcn-badge.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, '../__fixtures__');

describe('prefer-shadcn-badge rule', () => {
  const project = new Project();

  it('should detect custom badge elements with keywords and styling', () => {
    const filePath = path.join(fixturesDir, 'raw-html-elements.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnBadge], fixturesDir);

    expect(findings).toHaveLength(2);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-badge',
      violation: 'Custom badge detected. Use <Badge> from shadcn/ui.',
      element: 'span',
      replacement: 'Badge',
    });
    expect(findings[1]).toMatchObject({
      rule: 'prefer-shadcn-badge',
      violation: 'Custom badge detected. Use <Badge> from shadcn/ui.',
      element: 'div',
      replacement: 'Badge',
    });
  });

  it('should not detect shadcn/ui <Badge> component', () => {
    const filePath = path.join(fixturesDir, 'clean-component.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnBadge], fixturesDir);

    expect(findings).toHaveLength(0);
  });
});
