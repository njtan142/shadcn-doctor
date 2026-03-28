import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnTabs: Rule = {
  id: 'prefer-shadcn-tabs',
  description:
    'Detects custom tab-like button groups and suggests using shadcn/ui <Tabs> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement],
  check: (node: Node): Finding | null => {
    const openingElement = node as JsxOpeningElement;
    const tagName = openingElement.getTagNameNode().getText().trim();
    const attributes = openingElement
      .getAttributes()
      .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];

    if (tagName === 'button') {
      const roleAttr = attributes.find((a) => a.getNameNode().getText() === 'role');
      const roleValue = roleAttr?.getInitializer()?.getText().replace(/['"`]/g, '') || '';

      const classNameAttr = attributes.find(
        (a) => a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class',
      );
      const classNameValue = classNameAttr?.getInitializer()?.getText().replace(/['"`]/g, '') || '';

      const isTabRole = roleValue === 'tab';
      const hasTabKeyword = isTabRole
        ? false
        : classNameValue.toLowerCase().includes('tab') &&
          !classNameValue.toLowerCase().includes('table') &&
          /\btab\b/i.test(classNameValue);

      if (isTabRole || hasTabKeyword) {
        return {
          file: '', // Filled by engine
          line: 0, // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-tabs',
          violation: 'Custom tabs detected. Use <Tabs> from shadcn/ui.',
          suggestion: 'Use <Tabs> from shadcn/ui.',
          element: 'button',
          replacement: 'Tabs',
        };
      }
    }

    return null;
  },
};
