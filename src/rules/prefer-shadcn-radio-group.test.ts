import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { preferShadcnRadioGroup } from './prefer-shadcn-radio-group.js';
import { runRules } from '../engine/rule-engine.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, '../__fixtures__');

describe('prefer-shadcn-radio-group rule', () => {
  const project = new Project();

  it('should detect raw <input type="radio"> elements', () => {
    const filePath = path.join(fixturesDir, 'raw-html-elements.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnRadioGroup], fixturesDir);

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-radio-group',
      violation: 'Raw <input type="radio"> detected. Use <RadioGroup> from shadcn/ui.',
      element: 'input',
      replacement: 'RadioGroup',
      line: 13,
    });
  });

  it('should not detect shadcn/ui <RadioGroup> component', () => {
    const filePath = path.join(fixturesDir, 'clean-component.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnRadioGroup], fixturesDir);

    expect(findings).toHaveLength(0);
  });
});
