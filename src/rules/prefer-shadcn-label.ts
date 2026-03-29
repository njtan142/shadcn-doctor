import {
  type JsxAttribute,
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type Node,
  SyntaxKind,
} from 'ts-morph';
import type { Finding, Rule } from '../types.js';

const LABEL_STYLING_PATTERNS = ['text-sm', 'font-medium', 'text-xs', 'font-semibold', 'label'];

export const preferShadcnLabel: Rule = {
  id: 'prefer-shadcn-label',
  description:
    'Detects raw <label> elements with common label styling classNames and suggests using shadcn/ui <Label> component.',
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
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-label',
        violation: 'Raw <label> with styling className detected. Use <Label> from shadcn/ui.',
        suggestion: 'Use <Label> from shadcn/ui.',
        element: 'label',
        replacement: 'Label',
        sourceLine: '',
        suggestedLine: '',
      };
    }

    return null;
  },
};
