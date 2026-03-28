import { SyntaxKind, type Node, type JsxOpeningElement, type JsxSelfClosingElement } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnTextarea: Rule = {
  id: 'prefer-shadcn-textarea',
  description: 'Detects raw <textarea> elements and suggests using shadcn/ui <Textarea> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement, SyntaxKind.JsxSelfClosingElement],
  check: (node: Node): Finding | null => {
    let tagName = '';
    if (node.isKind(SyntaxKind.JsxOpeningElement)) {
      tagName = (node as JsxOpeningElement).getTagNameNode().getText().trim();
    } else if (node.isKind(SyntaxKind.JsxSelfClosingElement)) {
      tagName = (node as JsxSelfClosingElement).getTagNameNode().getText().trim();
    }
    if (tagName === 'textarea') {
      return {
        file: '', // Filled by engine
        line: 0,  // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-textarea',
        violation: 'Raw <textarea> detected. Use <Textarea> from shadcn/ui.',
        suggestion: 'Use <Textarea> from shadcn/ui.',
        element: 'textarea',
        replacement: 'Textarea',
      };
    }

    return null;
  },
};
