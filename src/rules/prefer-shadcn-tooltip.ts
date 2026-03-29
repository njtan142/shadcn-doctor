import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnTooltip: Rule = {
  id: 'prefer-shadcn-tooltip',
  description:
    'Detects raw elements used as tooltips and suggests using shadcn/ui <Tooltip> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement],
  check: (node: Node): Finding | null => {
    const openingElement = node as JsxOpeningElement;
    const tagName = openingElement.getTagNameNode().getText().trim();
    const attributes = openingElement
      .getAttributes()
      .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];

    if (tagName === 'div') {
      const roleAttr = attributes.find((a) => a.getNameNode().getText() === 'role');
      if (roleAttr) {
        const roleValue = roleAttr.getInitializer()?.getText().replace(/['"`]/g, '') || '';
        if (roleValue === 'tooltip') {
          return {
            file: '', // Filled by engine
            line: 0, // Filled by engine
            column: 0, // Filled by engine
            rule: 'prefer-shadcn-tooltip',
            violation: 'Raw <div role="tooltip"> detected. Use <Tooltip> from shadcn/ui.',
            suggestion: 'Use <Tooltip> from shadcn/ui.',
            element: 'div',
            replacement: 'Tooltip',
            sourceLine: '',
            suggestedLine: '',
          };
        }
      }
    }

    if (tagName === 'span' || tagName === 'div') {
      const classNameAttr = attributes.find(
        (a) => a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class',
      );
      if (classNameAttr) {
        const classNameValue =
          classNameAttr.getInitializer()?.getText().replace(/['"`]/g, '').toLowerCase() || '';
        if (classNameValue.includes('tooltip')) {
          return {
            file: '', // Filled by engine
            line: 0, // Filled by engine
            column: 0, // Filled by engine
            rule: 'prefer-shadcn-tooltip',
            violation: `Custom tooltip <${tagName}> detected. Use <Tooltip> from shadcn/ui.`,
            suggestion: 'Use <Tooltip> from shadcn/ui.',
            element: tagName,
            replacement: 'Tooltip',
            sourceLine: '',
            suggestedLine: '',
          };
        }
      }
    }

    return null;
  },
};
