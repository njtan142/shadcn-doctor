import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnToast } from './prefer-shadcn-toast.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

describe('prefer-shadcn-toast rule', () => {
  const project = new Project();

  it('should detect <div role="status"> as toast pattern', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_toast_status__.tsx',
      `export const Test = () => <div role="status">Saved!</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnToast], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-toast', replacement: 'Toast' });
  });

  it('should detect <div> with className containing "toast"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_toast_classname__.tsx',
      `export const Test = () => <div className="toast toast-success">Done!</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnToast], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-toast', replacement: 'Toast' });
  });

  it('should detect <div> with className containing "notification"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_toast_notification__.tsx',
      `export const Test = () => <div className="notification-banner">Alert!</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnToast], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-toast', replacement: 'Toast' });
  });

  it('should detect <div> with className containing "snackbar"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_toast_snackbar__.tsx',
      `export const Test = () => <div className="snackbar-container">Info</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnToast], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({ rule: 'prefer-shadcn-toast', replacement: 'Toast' });
  });

  it('should not flag shadcn/ui Toast component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_toast_clean__.tsx',
      `import { Toast } from '@/components/ui/toast';
export const Clean = () => <Toast />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnToast], rootDir);
    expect(findings).toHaveLength(0);
  });

  it('should not flag a plain <div> without toast-related attributes', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_toast_nodiv__.tsx',
      `export const Clean = () => <div className="container">Hello</div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnToast], rootDir);
    expect(findings).toHaveLength(0);
  });
});
