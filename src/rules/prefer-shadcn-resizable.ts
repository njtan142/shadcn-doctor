import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

const RESIZE_EXACT_TOKENS = new Set(['resize', 'resize-x', 'resize-y', 'resize-none']);

export const preferShadcnResizable: Rule = {
  id: 'prefer-shadcn-resizable',
  description:
    'Detects <div> elements with Tailwind resize utilities or resizable/resize-handle class keywords and suggests using shadcn/ui <Resizable> component.',
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

    const hasTailwindResize = tokens.some((token) => RESIZE_EXACT_TOKENS.has(token));
    const hasResizableKeyword = tokens.some(
      (token) => token === 'resizable' || token === 'resize-handle',
    );

    if (hasTailwindResize || hasResizableKeyword) {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-resizable',
        violation: 'Raw <div> with resize class detected. Use <Resizable> from shadcn/ui.',
        suggestion: 'Use <Resizable> from shadcn/ui.',
        element: 'div',
        replacement: 'Resizable',
        sourceLine: '',
        suggestedLine: '',
      };
    }

    return null;
  },
};
