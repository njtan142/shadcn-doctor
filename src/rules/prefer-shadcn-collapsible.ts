import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnCollapsible: Rule = {
  id: 'prefer-shadcn-collapsible',
  description:
    'Detects <div> elements used as collapsible patterns and suggests using shadcn/ui <Collapsible> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement],
  check: (node: Node): Finding | null => {
    const openingElement = node as JsxOpeningElement;
    const tagName = openingElement.getTagNameNode().getText().trim();

    if (tagName !== 'div') return null;

    const attributes = openingElement
      .getAttributes()
      .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];

    const ariaExpandedAttr = attributes.find((a) => a.getNameNode().getText() === 'aria-expanded');
    if (ariaExpandedAttr) {
      const initializer = ariaExpandedAttr.getInitializer();
      if (initializer) {
        return {
          file: '', // Filled by engine
          line: 0, // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-collapsible',
          violation: 'Raw <div aria-expanded> detected. Use <Collapsible> from shadcn/ui.',
          suggestion: 'Use <Collapsible> from shadcn/ui.',
          element: 'div',
          replacement: 'Collapsible',
          sourceLine: '',
          suggestedLine: '',
        };
      }
    }

    const classNameAttr = attributes.find(
      (a) => a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class',
    );
    if (classNameAttr) {
      const classNameValue =
        classNameAttr.getInitializer()?.getText().replace(/['"`]/g, '').toLowerCase() || '';
      if (classNameValue.includes('collapsible')) {
        return {
          file: '', // Filled by engine
          line: 0, // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-collapsible',
          violation: 'Custom collapsible <div> detected. Use <Collapsible> from shadcn/ui.',
          suggestion: 'Use <Collapsible> from shadcn/ui.',
          element: 'div',
          replacement: 'Collapsible',
          sourceLine: '',
          suggestedLine: '',
        };
      }
    }

    return null;
  },
};
