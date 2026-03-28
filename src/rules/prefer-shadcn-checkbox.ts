import {
  type JsxAttribute,
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type Node,
  SyntaxKind,
} from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnCheckbox: Rule = {
  id: 'prefer-shadcn-checkbox',
  description:
    'Detects raw <input type="checkbox"> elements and suggests using shadcn/ui <Checkbox> component.',
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

    if (tagName === 'input') {
      const typeAttr = attributes.find((a) => a.getNameNode().getText() === 'type');
      const roleAttr = attributes.find((a) => a.getNameNode().getText() === 'role');

      const typeValue = typeAttr?.getInitializer()?.getText().replace(/['"]/g, '');
      const roleValue = roleAttr?.getInitializer()?.getText().replace(/['"]/g, '');

      if (typeValue === 'checkbox' && roleValue !== 'switch') {
        return {
          file: '', // Filled by engine
          line: 0, // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-checkbox',
          violation: 'Raw <input type="checkbox"> detected. Use <Checkbox> from shadcn/ui.',
          suggestion: 'Use <Checkbox> from shadcn/ui.',
          element: 'input',
          replacement: 'Checkbox',
        };
      }
    }

    return null;
  },
};
