import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnHoverCard: Rule = {
  id: 'prefer-shadcn-hover-card',
  description:
    'Detects raw elements used as hover cards and suggests using shadcn/ui <HoverCard> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement],
  check: (node: Node): Finding | null => {
    const openingElement = node as JsxOpeningElement;
    const tagName = openingElement.getTagNameNode().getText().trim();

    if (tagName !== 'div') return null;

    const attributes = openingElement
      .getAttributes()
      .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];

    const classNameAttr = attributes.find(
      (a) => a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class',
    );
    if (!classNameAttr) return null;

    const classNameValue =
      classNameAttr.getInitializer()?.getText().replace(/['"`]/g, '').toLowerCase() || '';

    if (classNameValue.includes('hover-card') || classNameValue.includes('hovercard')) {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-hover-card',
        violation: 'Custom hover card <div> detected. Use <HoverCard> from shadcn/ui.',
        suggestion: 'Use <HoverCard> from shadcn/ui.',
        element: 'div',
        replacement: 'HoverCard',
        sourceLine: '',
        suggestedLine: '',
      };
    }

    return null;
  },
};
