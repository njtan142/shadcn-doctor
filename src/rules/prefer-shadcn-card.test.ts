import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnCard } from './prefer-shadcn-card.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, '../__fixtures__');

describe('prefer-shadcn-card rule', () => {
  const project = new Project();

  it('should detect divs with card-like signals including shadow', () => {
    const filePath = path.join(fixturesDir, 'custom-styled.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnCard], fixturesDir);

    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some((f) => f.rule === 'prefer-shadcn-card')).toBe(true);
  });

  it('should detect div with border + rounded + shadow + padding', () => {
    const filePath = path.join(fixturesDir, 'custom-styled.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnCard], fixturesDir);

    const cardWithBorder = findings.find((f) => f.line === 4 && f.element === 'div');
    expect(cardWithBorder).toBeDefined();
    expect(cardWithBorder?.replacement).toBe('Card');
  });

  it('should detect div with multiple signals including shadow and background', () => {
    const filePath = path.join(fixturesDir, 'custom-styled.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnCard], fixturesDir);

    const cardWithShadow = findings.find((f) => f.line === 5 && f.element === 'div');
    expect(cardWithShadow).toBeDefined();
    expect(cardWithShadow?.replacement).toBe('Card');
  });

  it('should detect div with rounded + background + padding', () => {
    const filePath = path.join(fixturesDir, 'custom-styled.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnCard], fixturesDir);

    const gradientCard = findings.find((f) => f.line === 6 && f.element === 'div');
    expect(gradientCard).toBeDefined();
  });

  it('should not detect div without shadow signal (only border + rounded + padding)', () => {
    const filePath = path.join(fixturesDir, 'custom-styled.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnCard], fixturesDir);

    const borderOnlyLine = 9;
    const borderOnlyFindings = findings.filter((f) => f.line === borderOnlyLine);
    expect(borderOnlyFindings).toHaveLength(0);
  });

  it('should not detect div with only rounded + shadow (no padding)', () => {
    const filePath = path.join(fixturesDir, 'custom-styled.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnCard], fixturesDir);

    const roundedOnlyLine = 10;
    const roundedOnlyFindings = findings.filter((f) => f.line === roundedOnlyLine);
    expect(roundedOnlyFindings).toHaveLength(0);
  });

  it('should not detect flex/grid layout containers without card-like styling', () => {
    const filePath = path.join(fixturesDir, 'custom-styled.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnCard], fixturesDir);

    const flexLine = 11;
    const gridLine = 12;
    const flexFindings = findings.filter((f) => f.line === flexLine);
    const gridFindings = findings.filter((f) => f.line === gridLine);
    expect(flexFindings).toHaveLength(0);
    expect(gridFindings).toHaveLength(0);
  });

  it('should detect flex container with strong card-like signals including shadow', () => {
    const filePath = path.join(fixturesDir, 'custom-styled.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnCard], fixturesDir);

    const flexCardLine = 13;
    const flexCardFindings = findings.filter((f) => f.line === flexCardLine);
    expect(flexCardFindings.length).toBeGreaterThan(0);
  });

  it('should not detect when Card is already imported from shadcn/ui', () => {
    const filePath = path.join(fixturesDir, 'clean-component.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnCard], fixturesDir);

    expect(findings).toHaveLength(0);
  });
});
