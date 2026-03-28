import { SyntaxKind, type Node, type JsxOpeningElement, type JsxSelfClosingElement } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnButton: Rule = {
  id: 'prefer-shadcn-button',
  description: 'Detects raw <button> elements and suggests using shadcn/ui <Button> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement, SyntaxKind.JsxSelfClosingElement],
  check: (node: Node): Finding | null => {
    let tagName = '';
    if (node.isKind(SyntaxKind.JsxOpeningElement)) {
      tagName = (node as JsxOpeningElement).getTagNameNode().getText().trim();
    } else if (node.isKind(SyntaxKind.JsxSelfClosingElement)) {
      tagName = (node as JsxSelfClosingElement).getTagNameNode().getText().trim();
    }
    if (tagName === 'button') {
      return {
        file: '', // Filled by engine
        line: 0,  // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-button',
        violation: 'Raw <button> detected. Use <Button> from shadcn/ui.',
        suggestion: 'Use <Button> from shadcn/ui.',
        element: 'button',
        replacement: 'Button',
      };
    }

    return null;
  },
};
