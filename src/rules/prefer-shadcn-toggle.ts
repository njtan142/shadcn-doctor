import {
  type JsxAttribute,
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type Node,
  SyntaxKind,
} from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnToggle: Rule = {
  id: 'prefer-shadcn-toggle',
  description:
    'Detects raw <button> elements with aria-pressed attribute and suggests using shadcn/ui <Toggle> component.',
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

    if (tagName === 'button') {
      const ariaPressed = attributes.find((a) => a.getNameNode().getText() === 'aria-pressed');

      if (ariaPressed) {
        return {
          file: '', // Filled by engine
          line: 0, // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-toggle',
          violation: 'Raw <button aria-pressed> detected. Use <Toggle> from shadcn/ui.',
          suggestion: 'Use <Toggle> from shadcn/ui.',
          element: 'button',
          replacement: 'Toggle',
          sourceLine: '',
          suggestedLine: '',
        };
      }
    }

    return null;
  },
};
