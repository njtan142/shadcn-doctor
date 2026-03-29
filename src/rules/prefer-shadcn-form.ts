import {
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type Node,
  SyntaxKind,
} from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnForm: Rule = {
  id: 'prefer-shadcn-form',
  description:
    'Detects raw <form> elements and suggests using shadcn/ui <Form> component wrapping react-hook-form.',
  nodeTypes: [SyntaxKind.JsxOpeningElement, SyntaxKind.JsxSelfClosingElement],
  check: (node: Node): Finding | null => {
    let tagName = '';

    if (node.isKind(SyntaxKind.JsxOpeningElement)) {
      tagName = (node as JsxOpeningElement).getTagNameNode().getText().trim();
    } else if (node.isKind(SyntaxKind.JsxSelfClosingElement)) {
      tagName = (node as JsxSelfClosingElement).getTagNameNode().getText().trim();
    }

    if (tagName === 'form') {
      return {
        file: '',
        line: 0,
        column: 0,
        rule: 'prefer-shadcn-form',
        violation: 'Raw <form> detected. Use <Form> from shadcn/ui with react-hook-form.',
        suggestion: 'Use <Form> from shadcn/ui.',
        element: 'form',
        replacement: 'Form',
        sourceLine: '',
        suggestedLine: '',
      };
    }

    return null;
  },
};
