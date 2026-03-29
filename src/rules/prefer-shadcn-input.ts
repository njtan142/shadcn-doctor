import {
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type Node,
  SyntaxKind,
} from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnInput: Rule = {
  id: 'prefer-shadcn-input',
  description: 'Detects raw <input> elements and suggests using shadcn/ui <Input> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement, SyntaxKind.JsxSelfClosingElement],
  check: (node: Node): Finding | null => {
    let tagName = '';
    if (node.isKind(SyntaxKind.JsxOpeningElement)) {
      tagName = (node as JsxOpeningElement).getTagNameNode().getText().trim();
    } else if (node.isKind(SyntaxKind.JsxSelfClosingElement)) {
      tagName = (node as JsxSelfClosingElement).getTagNameNode().getText().trim();
    }
    if (tagName === 'input') {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-input',
        violation: 'Raw <input> detected. Use <Input> from shadcn/ui.',
        suggestion: 'Use <Input> from shadcn/ui.',
        element: 'input',
        replacement: 'Input',
sourceLine: '',
suggestedLine: '',
};
    }

    return null;
  },
};
