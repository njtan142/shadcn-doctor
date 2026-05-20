import {
  type JsxAttribute,
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type Node,
  SyntaxKind,
} from 'ts-morph';
import type { Finding, Rule } from '../types.js';

const LABEL_STYLING_PATTERNS = ['text-sm', 'font-medium', 'text-xs', 'font-semibold', 'label'];

function isWithinShadcnForm(node: Node): boolean {
  let current: Node | undefined = node.getParent();

  while (current) {
    if (current.isKind(SyntaxKind.JsxElement)) {
      const children = current.getChildren();
      const openingElement = children[0];
      if (openingElement && openingElement.isKind(SyntaxKind.JsxOpeningElement)) {
        const tagNameNode = openingElement.getTagNameNode();
        const tagName = tagNameNode.getText().trim();

        if (
          tagName === 'Form' ||
          tagName === 'FormField' ||
          tagName === 'FormItem' ||
          tagName === 'FormControl'
        ) {
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

        if (tagName === 'Field' || tagName === 'FieldContent' || tagName === 'FieldGroup') {
          return true;
        }
      }
    }

    current = current.getParent();
  }

  return false;
}

function getLabelReplacement(node: Node): { replacement: string; suggestion: string } {
  if (isWithinShadcnForm(node)) {
    return {
      replacement: 'FormLabel',
      suggestion: 'Use <FormLabel> from shadcn/ui (inside Form/FormField context)',
    };
  }

  if (isWithinField(node)) {
    return {
      replacement: 'FieldLabel',
      suggestion: 'Use <FieldLabel> from shadcn/ui (inside Field context)',
    };
  }

  return {
    replacement: 'Label',
    suggestion: 'Use <Label> from shadcn/ui',
  };
}

export const preferShadcnLabel: Rule = {
  id: 'prefer-shadcn-label',
  description:
    'Detects raw <label> elements with common label styling classNames and suggests using shadcn/ui <Label>, <FormLabel>, or <FieldLabel> component depending on context.',
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

    if (tagName !== 'label') {
      return null;
    }

    const classNameAttr = attributes.find(
      (a) => a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class',
    );

    if (!classNameAttr) {
      return null;
    }

    const classNameValue =
      classNameAttr.getInitializer()?.getText().replace(/['"`]/g, '').toLowerCase() ?? '';

    const hasStylingPattern = LABEL_STYLING_PATTERNS.some((pattern) =>
      classNameValue.includes(pattern),
    );

    if (hasStylingPattern) {
      const { replacement, suggestion } = getLabelReplacement(node);

      let violation = '';
      if (replacement === 'FormLabel') {
        violation = 'Raw <label> detected inside Form context. Use <FormLabel> from shadcn/ui.';
      } else if (replacement === 'FieldLabel') {
        violation = 'Raw <label> detected inside Field context. Use <FieldLabel> from shadcn/ui.';
      } else {
        violation = 'Raw <label> with styling className detected. Use <Label> from shadcn/ui.';
      }

      return {
        file: '',
        line: 0,
        column: 0,
        rule: 'prefer-shadcn-label',
        violation,
        suggestion,
        element: 'label',
        replacement,
        sourceLine: '',
        suggestedLine: '',
      };
    }

    return null;
  },
};
