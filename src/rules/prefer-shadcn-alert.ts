import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnAlert: Rule = {
  id: 'prefer-shadcn-alert',
  description: 'Detects <div> with role="alert" and suggests using shadcn/ui <Alert> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement],
  check: (node: Node): Finding | null => {
    const openingElement = node as JsxOpeningElement;
    const tagName = openingElement.getTagNameNode().getText().trim();
    const attributes = openingElement
      .getAttributes()
      .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];

    if (tagName === 'div') {
      const roleAttr = attributes.find((a) => a.getNameNode().getText() === 'role');
      if (!roleAttr) return null;
      const initializer = roleAttr.getInitializer();
      if (!initializer) return null;
      const roleValue = initializer.getText().replace(/['"`]/g, '');

      if (roleValue === 'alert') {
        return {
          file: '', // Filled by engine
          line: 0, // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-alert',
          violation: 'Custom alert <div> detected. Use <Alert> from shadcn/ui.',
          suggestion: 'Use <Alert> from shadcn/ui.',
          element: 'div',
          replacement: 'Alert',
        };
      }
    }

    return null;
  },
};
