import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnPopover: Rule = {
  id: 'prefer-shadcn-popover',
  description:
    'Detects raw elements used as popovers and suggests using shadcn/ui <Popover> component.',
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
    if (classNameAttr) {
      const classNameValue =
        classNameAttr.getInitializer()?.getText().replace(/['"`]/g, '').toLowerCase() || '';
      if (classNameValue.includes('popover')) {
        return {
          file: '', // Filled by engine
          line: 0, // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-popover',
          violation: 'Custom popover <div> detected. Use <Popover> from shadcn/ui.',
          suggestion: 'Use <Popover> from shadcn/ui.',
          element: 'div',
          replacement: 'Popover',
          sourceLine: '',
          suggestedLine: '',
        };
      }
    }

    const hasDataPopover = attributes.some((a) => a.getNameNode().getText() === 'data-popover');
    const hasDataPopper = attributes.some((a) => a.getNameNode().getText() === 'data-popper');

    if (hasDataPopover || hasDataPopper) {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-popover',
        violation: 'Custom popover <div> detected. Use <Popover> from shadcn/ui.',
        suggestion: 'Use <Popover> from shadcn/ui.',
        element: 'div',
        replacement: 'Popover',
        sourceLine: '',
        suggestedLine: '',
      };
    }

    return null;
  },
};
