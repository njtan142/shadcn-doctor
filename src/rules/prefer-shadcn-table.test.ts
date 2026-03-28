import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnTable } from './prefer-shadcn-table.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, '../__fixtures__');

describe('prefer-shadcn-table rule', () => {
  const project = new Project();

  it('should detect raw <table> elements', () => {
    const filePath = path.join(fixturesDir, 'raw-html-elements.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnTable], fixturesDir);

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-table',
      violation: 'Raw <table> detected. Use <Table> from shadcn/ui.',
      element: 'table',
      replacement: 'Table',
    });
  });

  it('should not detect shadcn/ui <Table> component', () => {
    const filePath = path.join(fixturesDir, 'clean-component.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnTable], fixturesDir);

    expect(findings).toHaveLength(0);
  });
});
