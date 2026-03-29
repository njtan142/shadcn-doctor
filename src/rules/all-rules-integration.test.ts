import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { ALL_RULES } from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, '../__fixtures__');
const projectRoot = path.resolve(__dirname, '../..');

describe('all-rules integration', () => {
  const project = new Project();

  it('should produce four findings (one per element) in line-number order when a file contains all four raw elements', () => {
    // Inline fixture with exactly one of each raw element on separate lines
    const source = [
      'export const AllRaw = () => (',
      '  <div>',
      '    <button>Click</button>',
      '    <input />',
      '    <textarea></textarea>',
      '    <select></select>',
      '  </div>',
      ');',
    ].join('\n');
    const inlinePath = path.join(projectRoot, 'all-raw.tsx');
    const sourceFile = project.createSourceFile(inlinePath, source, { overwrite: true });
    const { findings } = runRules(sourceFile, ALL_RULES, projectRoot);

    expect(findings).toHaveLength(4);

    // Findings must be in line-number order
    const lines = findings.map((f) => f.line);
    const sortedLines = [...lines].sort((a, b) => a - b);
    expect(lines).toEqual(sortedLines);

    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-button', element: 'button' });
    expect(findings[1]).toMatchObject({ rule: 'prefer-shadcn-input', element: 'input' });
    expect(findings[2]).toMatchObject({ rule: 'prefer-shadcn-textarea', element: 'textarea' });
    expect(findings[3]).toMatchObject({ rule: 'prefer-shadcn-select', element: 'select' });
  });

  it('should produce all findings from raw-html-elements.tsx fixture in line-number order', () => {
    const filePath = path.join(fixturesDir, 'raw-html-elements.tsx');
    const sourceFile = project.getSourceFile(filePath) ?? project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, ALL_RULES, fixturesDir);

    expect(findings.length).toBeGreaterThan(0);

    // Findings must be in line-number order
    const lines = findings.map((f) => f.line);
    const sortedLines = [...lines].sort((a, b) => a - b);
    expect(lines).toEqual(sortedLines);

    const ruleIds = findings.map((f) => f.rule);
    expect(ruleIds).toContain('prefer-shadcn-button');
    expect(ruleIds).toContain('prefer-shadcn-input');
    expect(ruleIds).toContain('prefer-shadcn-textarea');
    expect(ruleIds).toContain('prefer-shadcn-select');
  });

  it('should produce no findings when all shadcn/ui components are used', () => {
    const filePath = path.join(fixturesDir, 'clean-component.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, ALL_RULES, fixturesDir);

    expect(findings).toHaveLength(0);
  });
});
