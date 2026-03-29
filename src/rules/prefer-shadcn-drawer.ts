import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnDrawer: Rule = {
  id: 'prefer-shadcn-drawer',
  description:
    'Detects raw drawer/bottom-sheet patterns and suggests using shadcn/ui <Drawer> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement],
  check: (node: Node): Finding | null => {
    const openingElement = node as JsxOpeningElement;
    const tagName = openingElement.getTagNameNode().getText().trim();
    const attributes = openingElement
      .getAttributes()
      .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];

    if (tagName !== 'div') return null;

    const classNameAttr = attributes.find(
      (a) => a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class',
    );
    const classNameValue =
      classNameAttr?.getInitializer()?.getText().replace(/['"]/g, '').toLowerCase() ?? '';

    const roleAttr = attributes.find((a) => a.getNameNode().getText() === 'role');
    const roleValue = roleAttr?.getInitializer()?.getText().replace(/['"`]/g, '') ?? '';

    // Detect <div role="dialog"> with drawer/bottom-sheet className
    if (roleValue === 'dialog') {
      const drawerDialogKeywords = ['drawer', 'bottom-sheet'];
      if (drawerDialogKeywords.some((k) => classNameValue.includes(k))) {
        return {
          file: '', // Filled by engine
          line: 0, // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-drawer',
          violation: 'Custom drawer <div role="dialog"> detected. Use <Drawer> from shadcn/ui.',
          suggestion: 'Use <Drawer> from shadcn/ui.',
          element: 'div',
          replacement: 'Drawer',
sourceLine: '',
suggestedLine: '',
};
      }
    }

    // Detect <div> with className containing "drawer"
    if (classNameValue.includes('drawer')) {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-drawer',
        violation: 'Custom drawer <div> detected. Use <Drawer> from shadcn/ui.',
        suggestion: 'Use <Drawer> from shadcn/ui.',
        element: 'div',
        replacement: 'Drawer',
sourceLine: '',
suggestedLine: '',
};
    }

    return null;
  },
};
