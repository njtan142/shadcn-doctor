import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

const OVERFLOW_CLASSES = new Set([
  'overflow-auto',
  'overflow-scroll',
  'overflow-y-auto',
  'overflow-x-auto',
  'overflow-y-scroll',
  'overflow-x-scroll',
]);

export const preferShadcnScrollArea: Rule = {
  id: 'prefer-shadcn-scroll-area',
  description:
    'Detects <div> elements with Tailwind overflow scroll/auto classes and suggests using shadcn/ui <ScrollArea> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement],
  check: (node: Node): Finding | null => {
    const openingElement = node as JsxOpeningElement;
    const tagName = openingElement.getTagNameNode().getText().trim();
    const attributes = openingElement
      .getAttributes()
      .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];

    if (tagName !== 'div') {
      return null;
    }

    const classNameAttr = attributes.find(
      (a) => a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class',
    );

    if (!classNameAttr) {
      return null;
    }

    const classNameValue = classNameAttr.getInitializer()?.getText().replace(/['"`]/g, '') || '';
    const tokens = classNameValue.split(/\s+/);
    const hasOverflowClass = tokens.some((token) => OVERFLOW_CLASSES.has(token));

    if (hasOverflowClass) {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-scroll-area',
        violation:
          'Raw <div> with overflow scroll/auto class detected. Use <ScrollArea> from shadcn/ui.',
        suggestion: 'Use <ScrollArea> from shadcn/ui.',
        element: 'div',
        replacement: 'ScrollArea',
        sourceLine: '',
        suggestedLine: '',
      };
    }

    return null;
  },
};
