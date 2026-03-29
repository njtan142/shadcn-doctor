import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnForm } from './prefer-shadcn-form.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

describe('prefer-shadcn-form rule', () => {
  const project = new Project();

  it('should detect raw <form> element', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_form__.tsx',
      `export const Test = () => <form onSubmit={() => {}}><input /></form>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnForm], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-form', replacement: 'Form' });
  });

  it('should detect self-closing <form />', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_form_selfclose__.tsx',
      `export const Test = () => <form />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnForm], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-form', replacement: 'Form' });
  });

  it('should not flag shadcn/ui Form component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_form_clean__.tsx',
      `import { Form } from '@/components/ui/form';
export const Clean = () => <Form />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnForm], rootDir);
    expect(findings).toHaveLength(0);
  });

  it('should not flag non-form elements', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_form_noform__.tsx',
      `export const Clean = () => <div><input type="text" /></div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnForm], rootDir);
    expect(findings).toHaveLength(0);
  });
});
