import {
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type Node,
  SyntaxKind,
} from 'ts-morph';
import type { Finding, Rule } from '../types.js';

function isWithinShadcnFormField(node: Node): boolean {
  let current: Node | undefined = node.getParent();

  while (current) {
    if (current.isKind(SyntaxKind.JsxElement)) {
      const children = current.getChildren();
      const openingElement = children[0];
      if (openingElement && openingElement.isKind(SyntaxKind.JsxOpeningElement)) {
        const tagNameNode = openingElement.getTagNameNode();
        const tagName = tagNameNode.getText().trim();

        if (tagName === 'FormField' || tagName === 'FormControl') {
          return true;
        }
      }
    }

    current = current.getParent();
  }

  return false;
}

function isWithinField(node: Node): boolean {
  let current: Node | undefined = node.getParent();

  while (current) {
    if (current.isKind(SyntaxKind.JsxElement)) {
      const children = current.getChildren();
      const openingElement = children[0];
      if (openingElement && openingElement.isKind(SyntaxKind.JsxOpeningElement)) {
        const tagNameNode = openingElement.getTagNameNode();
        const tagName = tagNameNode.getText().trim();

        if (tagName === 'Field') {
          return true;
        }
      }
    }

    current = current.getParent();
  }

  return false;
}

function getInputReplacement(node: Node): {
  replacement: string;
  suggestion: string;
  violation: string;
} {
  if (isWithinShadcnFormField(node)) {
    return {
      replacement: 'Input',
      violation: 'Raw <input> detected inside FormField. Wrap with <FormControl> and use <Input>.',
      suggestion: 'Use <Input> wrapped in <FormControl> from shadcn/ui.',
    };
  }

  if (isWithinField(node)) {
    return {
      replacement: 'Input',
      violation: 'Raw <input> detected inside Field. Use <Input> from shadcn/ui.',
      suggestion: 'Use <Input> from shadcn/ui.',
    };
  }

  return {
    replacement: 'Input',
    violation: 'Raw <input> detected. Use <Input> from shadcn/ui or wrap in <Field>.',
    suggestion: 'Use <Input> from shadcn/ui.',
  };
}

export const preferShadcnInput: Rule = {
  id: 'prefer-shadcn-input',
  description:
    'Detects raw <input> elements and suggests using shadcn/ui <Input> component, with context-aware suggestions for FormField or Field wrappers.',
  nodeTypes: [SyntaxKind.JsxOpeningElement, SyntaxKind.JsxSelfClosingElement],
  check: (node: Node): Finding | null => {
    let tagName = '';
    if (node.isKind(SyntaxKind.JsxOpeningElement)) {
      tagName = (node as JsxOpeningElement).getTagNameNode().getText().trim();
    } else if (node.isKind(SyntaxKind.JsxSelfClosingElement)) {
      tagName = (node as JsxSelfClosingElement).getTagNameNode().getText().trim();
    }
    if (tagName === 'input') {
      const { replacement, suggestion, violation } = getInputReplacement(node);

      return {
        file: '',
        line: 0,
        column: 0,
        rule: 'prefer-shadcn-input',
        violation,
        suggestion,
        element: 'input',
        replacement,
        sourceLine: '',
        suggestedLine: '',
      };
    }

    return null;
  },
};
