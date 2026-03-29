import {
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type Node,
  SyntaxKind,
} from 'ts-morph';
import type { Finding, Rule } from '../types.js';

function isWithinFormProvider(node: Node): boolean {
  let current: Node | undefined = node.getParent();

  while (current) {
    if (current.isKind(SyntaxKind.JsxElement)) {
      const children = current.getChildren();
      const openingElement = children[0];
      if (openingElement && openingElement.isKind(SyntaxKind.JsxOpeningElement)) {
        const tagNameNode = openingElement.getTagNameNode();
        const tagName = tagNameNode.getText().trim();

        if (tagName === 'Form') {
          return true;
        }

        if (tagName === 'FormProvider') {
          return true;
        }
      }
    }

    current = current.getParent();
  }

  return false;
}

export const preferShadcnForm: Rule = {
  id: 'prefer-shadcn-form',
  description:
    'Detects raw <form> elements and suggests using shadcn/ui <Form> component wrapping react-hook-form.',
  nodeTypes: [SyntaxKind.JsxOpeningElement, SyntaxKind.JsxSelfClosingElement],
  check: (node: Node): Finding | null => {
    let tagName = '';
    let jsxElement: JsxOpeningElement | JsxSelfClosingElement | null = null;

    if (node.isKind(SyntaxKind.JsxOpeningElement)) {
      tagName = (node as JsxOpeningElement).getTagNameNode().getText().trim();
      jsxElement = node as JsxOpeningElement;
    } else if (node.isKind(SyntaxKind.JsxSelfClosingElement)) {
      tagName = (node as JsxSelfClosingElement).getTagNameNode().getText().trim();
      jsxElement = node as JsxSelfClosingElement;
    }

    if (tagName === 'form' && jsxElement) {
      if (isWithinFormProvider(node)) {
        return null;
      }

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
