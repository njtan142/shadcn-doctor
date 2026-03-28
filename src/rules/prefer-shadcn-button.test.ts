import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { preferShadcnButton } from './prefer-shadcn-button.js';
import { runRules } from '../engine/rule-engine.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, '../__fixtures__');

describe('prefer-shadcn-button rule', () => {
  const project = new Project();

  it('should detect raw <button> elements', () => {
    const filePath = path.join(fixturesDir, 'raw-html-elements.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnButton], fixturesDir);

    expect(findings).toHaveLength(3);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-button',
      violation: 'Raw <button> detected. Use <Button> from shadcn/ui.',
      element: 'button',
      replacement: 'Button',
      line: 4,
    });
    expect(findings[1]).toMatchObject({
      line: 5,
    });
    expect(findings[2]).toMatchObject({
      line: 6,
    });
  });

  it('should not detect shadcn/ui <Button> component', () => {
    const filePath = path.join(fixturesDir, 'clean-component.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnButton], fixturesDir);

    expect(findings).toHaveLength(0);
  });
});
