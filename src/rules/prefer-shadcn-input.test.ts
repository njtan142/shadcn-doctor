import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { preferShadcnInput } from './prefer-shadcn-input.js';
import { runRules } from '../engine/rule-engine.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, '../__fixtures__');

describe('prefer-shadcn-input rule', () => {
  const project = new Project();

  it('should detect raw <input> elements', () => {
    const filePath = path.join(fixturesDir, 'raw-html-elements.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnInput], fixturesDir);

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-input',
      violation: 'Raw <input> detected. Use <Input> from shadcn/ui.',
      element: 'input',
      replacement: 'Input',
      line: 7,
    });
  });

  it('should not detect shadcn/ui <Input> component', () => {
    const filePath = path.join(fixturesDir, 'clean-component.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnInput], fixturesDir);

    expect(findings).toHaveLength(0);
  });
});
