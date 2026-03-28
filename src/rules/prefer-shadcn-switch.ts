import {
  type JsxAttribute,
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type Node,
  SyntaxKind,
} from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnSwitch: Rule = {
  id: 'prefer-shadcn-switch',
  description: 'Detects custom switch patterns and suggests using shadcn/ui <Switch> component.',
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

    const typeAttr = attributes.find((a) => a.getNameNode().getText() === 'type');
    const roleAttr = attributes.find((a) => a.getNameNode().getText() === 'role');

    const typeValue = typeAttr?.getInitializer()?.getText().replace(/['"]/g, '');
    const roleValue = roleAttr?.getInitializer()?.getText().replace(/['"]/g, '') ?? '';

    if (
      (tagName === 'input' && typeValue === 'checkbox' && roleValue === 'switch') ||
      (tagName === 'div' && roleValue === 'switch')
    ) {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-switch',
        violation: 'Custom switch detected. Use <Switch> from shadcn/ui.',
        suggestion: 'Use <Switch> from shadcn/ui.',
        element: tagName,
        replacement: 'Switch',
      };
    }

    return null;
  },
};
