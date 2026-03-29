import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnDialog: Rule = {
  id: 'prefer-shadcn-dialog',
  description:
    'Detects raw <dialog> elements or <div> with role="dialog" and suggests using shadcn/ui <Dialog> component. Note: <dialog> elements with the "open" attribute are controlled by the browser.',
  nodeTypes: [SyntaxKind.JsxOpeningElement],
  check: (node: Node): Finding | null => {
    const openingElement = node as JsxOpeningElement;
    const tagName = openingElement.getTagNameNode().getText().trim();
    const attributes = openingElement
      .getAttributes()
      .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];

    if (tagName === 'dialog') {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-dialog',
        violation: 'Raw <dialog> detected. Use <Dialog> from shadcn/ui.',
        suggestion: 'Use <Dialog> from shadcn/ui.',
        element: 'dialog',
        replacement: 'Dialog',
sourceLine: '',
suggestedLine: '',
};
    }

    if (tagName === 'div') {
      const roleAttr = attributes.find((a) => a.getNameNode().getText() === 'role');
      if (!roleAttr) return null;
      const roleInitializer = roleAttr.getInitializer();
      if (!roleInitializer) return null;
      const roleValue = roleInitializer.getText().replace(/['"`]/g, '');

      if (roleValue === 'dialog') {
        return {
          file: '', // Filled by engine
          line: 0, // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-dialog',
          violation: 'Custom modal <div> detected. Use <Dialog> from shadcn/ui.',
          suggestion: 'Use <Dialog> from shadcn/ui.',
          element: 'div',
          replacement: 'Dialog',
sourceLine: '',
suggestedLine: '',
};
      }
    }

    return null;
  },
};
