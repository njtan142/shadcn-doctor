import { describe, it, expect } from 'vitest';
import { Project, SyntaxKind } from 'ts-morph';
import { runRules } from './rule-engine.js';
import type { Rule } from '../types.js';

describe('Rule Engine', () => {
  const project = new Project();

  it('should dispatch nodes to matching rules', () => {
    const sourceFile = project.createSourceFile('test.tsx', '<div><button /></div>');
    const mockRule: Rule = {
      id: 'mock-rule',
      description: 'mock',
      nodeTypes: [SyntaxKind.JsxSelfClosingElement],
      check: (node) => {
        if (node.getText() === '<button />') {
          return {
            file: '', rule: 'mock-rule', violation: 'v', suggestion: 's', element: 'button', replacement: 'Button', line: 0, column: 0
          };
        }
        return null;
      }
    };

    const { findings } = runRules(sourceFile, [mockRule], '/');
    expect(findings).toHaveLength(1);
    expect(findings[0].rule).toBe('mock-rule');
  });

  it('should catch errors in rules and report them as warnings', () => {
    const sourceFile = project.createSourceFile('test-error.tsx', '<button />');
    const errorRule: Rule = {
      id: 'error-rule',
      description: 'throws error',
      nodeTypes: [SyntaxKind.JsxSelfClosingElement],
      check: () => {
        throw new Error('Test Error');
      }
    };

    const { findings, warnings } = runRules(sourceFile, [errorRule], '/');
    expect(findings).toHaveLength(0);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].message).toContain('Rule "error-rule" failed');
    expect(warnings[0].message).toContain('Test Error');
  });
});
