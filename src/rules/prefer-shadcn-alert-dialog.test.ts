import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnAlertDialog } from './prefer-shadcn-alert-dialog.js';

describe('prefer-shadcn-alert-dialog rule', () => {
  const project = new Project();

  it('should detect <div role="alertdialog">', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_alert_dialog_role__.tsx',
      `export const Test = () => (
  <div role="alertdialog" aria-modal="true" aria-labelledby="title">
    <h2 id="title">Delete item?</h2>
    <button>Cancel</button>
    <button>Confirm</button>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnAlertDialog], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-alert-dialog',
      replacement: 'AlertDialog',
      element: 'div',
    });
  });

  it('should detect <dialog> with className containing "alert"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_alert_dialog_class_alert__.tsx',
      `export const Test = () => (
  <dialog className="alert-dialog modal">
    <p>Are you sure?</p>
  </dialog>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnAlertDialog], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-alert-dialog',
      replacement: 'AlertDialog',
      element: 'dialog',
    });
  });

  it('should detect <dialog> with className containing "confirm"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_alert_dialog_class_confirm__.tsx',
      `export const Test = () => (
  <dialog className="confirm-modal">
    <p>Proceed?</p>
  </dialog>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnAlertDialog], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-alert-dialog',
      replacement: 'AlertDialog',
      element: 'dialog',
    });
  });

  it('should detect <dialog> with className containing "confirmation"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_alert_dialog_class_confirmation__.tsx',
      `export const Test = () => (
  <dialog className="confirmation-dialog">
    <p>Are you sure you want to delete?</p>
  </dialog>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnAlertDialog], process.cwd());
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-alert-dialog',
      replacement: 'AlertDialog',
      element: 'dialog',
    });
  });

  it('should not flag <div role="dialog"> (regular dialog, not alertdialog)', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_alert_dialog_regular_dialog__.tsx',
      `export const Test = () => (
  <div role="dialog" aria-modal="true">
    <p>Regular dialog content</p>
  </div>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnAlertDialog], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag <dialog> without alert/confirm className', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_alert_dialog_plain_dialog__.tsx',
      `export const Test = () => (
  <dialog className="modal-overlay">
    <p>Regular modal</p>
  </dialog>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnAlertDialog], process.cwd());
    expect(findings).toHaveLength(0);
  });

  it('should not flag shadcn/ui AlertDialog component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_alert_dialog_clean__.tsx',
      `import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';
export const Clean = () => (
  <AlertDialog>
    <AlertDialogContent>Are you sure?</AlertDialogContent>
  </AlertDialog>
);`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnAlertDialog], process.cwd());
    expect(findings).toHaveLength(0);
  });
});
