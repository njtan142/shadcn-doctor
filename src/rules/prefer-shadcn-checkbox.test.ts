import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnCheckbox } from './prefer-shadcn-checkbox.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, '../__fixtures__');

describe('prefer-shadcn-checkbox rule', () => {
  const project = new Project();

  it('should detect raw <input type="checkbox"> elements', () => {
    const filePath = path.join(fixturesDir, 'raw-html-elements.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnCheckbox], fixturesDir);
    console.log('Findings:', JSON.stringify(findings, null, 2));
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-checkbox',
      violation: 'Raw <input type="checkbox"> detected. Use <Checkbox> from shadcn/ui.',
      element: 'input',
      replacement: 'Checkbox',
      line: 12,
    });
  });

  it('should not detect shadcn/ui <Checkbox> component', () => {
    const filePath = path.join(fixturesDir, 'clean-component.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnCheckbox], fixturesDir);

    expect(findings).toHaveLength(0);
  });
});
