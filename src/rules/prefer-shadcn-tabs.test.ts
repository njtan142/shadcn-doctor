import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnTabs } from './prefer-shadcn-tabs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, '../__fixtures__');

describe('prefer-shadcn-tabs rule', () => {
  const project = new Project();

  it('should detect custom tab patterns', () => {
    const filePath = path.join(fixturesDir, 'raw-html-elements.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnTabs], fixturesDir);

    expect(findings.length).toBeGreaterThanOrEqual(1);
    const tabsFindings = findings.filter((f) => f.rule === 'prefer-shadcn-tabs');
    expect(tabsFindings.length).toBeGreaterThanOrEqual(1);
    expect(tabsFindings[0]).toMatchObject({
      rule: 'prefer-shadcn-tabs',
      violation: 'Custom tabs detected. Use <Tabs> from shadcn/ui.',
      element: 'button',
      replacement: 'Tabs',
    });
  });

  it('should not detect shadcn/ui <Tabs> component', () => {
    const filePath = path.join(fixturesDir, 'clean-component.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnTabs], fixturesDir);

    expect(findings).toHaveLength(0);
  });
});
