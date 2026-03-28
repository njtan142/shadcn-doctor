import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { preferShadcnSelect } from './prefer-shadcn-select.js';
import { runRules } from '../engine/rule-engine.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, '../__fixtures__');

describe('prefer-shadcn-select rule', () => {
  const project = new Project();

  it('should detect raw <select> elements', () => {
    const filePath = path.join(fixturesDir, 'raw-html-elements.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnSelect], fixturesDir);

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-select',
      violation: 'Raw <select> detected. Use <Select> from shadcn/ui.',
      element: 'select',
      replacement: 'Select',
      line: 9,
    });
  });

  it('should not detect shadcn/ui <Select> component', () => {
    const filePath = path.join(fixturesDir, 'clean-component.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnSelect], fixturesDir);

    expect(findings).toHaveLength(0);
  });
});
