import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { preferShadcnTextarea } from './prefer-shadcn-textarea.js';
import { runRules } from '../engine/rule-engine.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, '../__fixtures__');

describe('prefer-shadcn-textarea rule', () => {
  const project = new Project();

  it('should detect raw <textarea> elements', () => {
    const filePath = path.join(fixturesDir, 'raw-html-elements.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnTextarea], fixturesDir);

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-textarea',
      violation: 'Raw <textarea> detected. Use <Textarea> from shadcn/ui.',
      element: 'textarea',
      replacement: 'Textarea',
      line: 8,
    });
  });

  it('should not detect shadcn/ui <Textarea> component', () => {
    const filePath = path.join(fixturesDir, 'clean-component.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnTextarea], fixturesDir);

    expect(findings).toHaveLength(0);
  });
});
