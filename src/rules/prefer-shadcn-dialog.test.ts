import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnDialog } from './prefer-shadcn-dialog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, '../__fixtures__');

describe('prefer-shadcn-dialog rule', () => {
  const project = new Project();

  it('should detect <div> with role="dialog"', () => {
    const filePath = path.join(fixturesDir, 'raw-html-elements.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnDialog], fixturesDir);

    const dialogFindings = findings.filter((f) => f.rule === 'prefer-shadcn-dialog');
    const divDialogFindings = dialogFindings.filter((f) => f.element === 'div');
    expect(divDialogFindings.length).toBeGreaterThanOrEqual(1);
    expect(divDialogFindings[0]).toMatchObject({
      rule: 'prefer-shadcn-dialog',
      violation: 'Custom modal <div> detected. Use <Dialog> from shadcn/ui.',
      element: 'div',
      replacement: 'Dialog',
    });
  });

  it('should not detect shadcn/ui <Dialog> component', () => {
    const filePath = path.join(fixturesDir, 'clean-component.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnDialog], fixturesDir);

    expect(findings).toHaveLength(0);
  });
});
