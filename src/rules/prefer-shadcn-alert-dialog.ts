import {
  type JsxAttribute,
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type Node,
  SyntaxKind,
} from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnAlertDialog: Rule = {
  id: 'prefer-shadcn-alert-dialog',
  description:
    'Detects raw <div role="alertdialog"> or <dialog> with alert/confirm className and suggests using shadcn/ui <AlertDialog> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement, SyntaxKind.JsxSelfClosingElement],
  check: (node: Node): Finding | null => {
    let tagName = '';
    let attributes: JsxAttribute[] = [];

    if (node.isKind(SyntaxKind.JsxOpeningElement)) {
      tagName = (node as JsxOpeningElement).getTagNameNode().getText().trim();
      attributes = (node as JsxOpeningElement)
        .getAttributes()
        .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];
    } else if (node.isKind(SyntaxKind.JsxSelfClosingElement)) {
      tagName = (node as JsxSelfClosingElement).getTagNameNode().getText().trim();
      attributes = (node as JsxSelfClosingElement)
        .getAttributes()
        .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];
    }

    // Detect <div role="alertdialog">
    if (tagName === 'div') {
      const roleAttr = attributes.find((a) => a.getNameNode().getText() === 'role');
      const roleValue =
        roleAttr?.getInitializer()?.getText().replace(/['"`]/g, '').toLowerCase() ?? '';

      if (roleValue === 'alertdialog') {
        return {
          file: '', // Filled by engine
          line: 0, // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-alert-dialog',
          violation: 'Raw <div role="alertdialog"> detected. Use <AlertDialog> from shadcn/ui.',
          suggestion: 'Use <AlertDialog> from shadcn/ui.',
          element: 'div',
          replacement: 'AlertDialog',
          sourceLine: '',
          suggestedLine: '',
        };
      }
    }

    // Detect <dialog> with className containing "alert", "confirm", or "confirmation"
    if (tagName === 'dialog') {
      const classNameAttr = attributes.find(
        (a) => a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class',
      );
      const classNameValue =
        classNameAttr?.getInitializer()?.getText().replace(/['"`]/g, '').toLowerCase() ?? '';

      if (
        classNameValue.includes('alert') ||
        classNameValue.includes('confirm') ||
        classNameValue.includes('confirmation')
      ) {
        return {
          file: '', // Filled by engine
          line: 0, // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-alert-dialog',
          violation:
            'Raw <dialog> with alert/confirm className detected. Use <AlertDialog> from shadcn/ui.',
          suggestion: 'Use <AlertDialog> from shadcn/ui.',
          element: 'dialog',
          replacement: 'AlertDialog',
          sourceLine: '',
          suggestedLine: '',
        };
      }
    }

    return null;
  },
};
