import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnSwitch } from './prefer-shadcn-switch.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, '../__fixtures__');

describe('prefer-shadcn-switch rule', () => {
  const project = new Project();

  it('should detect custom switch elements', () => {
    const filePath = path.join(fixturesDir, 'raw-html-elements.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnSwitch], fixturesDir);

    expect(findings).toHaveLength(2);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-switch',
      violation: 'Custom switch detected. Use <Switch> from shadcn/ui.',
      element: 'input',
      replacement: 'Switch',
      line: 13,
    });
    expect(findings[1]).toMatchObject({
      rule: 'prefer-shadcn-switch',
      violation: 'Custom switch detected. Use <Switch> from shadcn/ui.',
      element: 'div',
      replacement: 'Switch',
      line: 14,
    });
  });

  it('should not detect shadcn/ui <Switch> component', () => {
    const filePath = path.join(fixturesDir, 'clean-component.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnSwitch], fixturesDir);

    expect(findings).toHaveLength(0);
  });
});
