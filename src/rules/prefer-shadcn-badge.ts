import { SyntaxKind, type Node, type JsxOpeningElement, type JsxAttribute } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnBadge: Rule = {
  id: 'prefer-shadcn-badge',
  description: 'Detects custom badge-like elements and suggests using shadcn/ui <Badge> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement],
  check: (node: Node): Finding | null => {
    const openingElement = node as JsxOpeningElement;
    const tagName = openingElement.getTagNameNode().getText().trim();
    const attributes = openingElement.getAttributes().filter(a => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];

    if (tagName === 'span' || tagName === 'div') {
      const classNameAttr = attributes.find(a => a.getName() === 'className');
      const classNameValue = classNameAttr?.getInitializer()?.getText().replace(/['"`]/g, '') || '';

      const keywords = ['badge', 'tag', 'chip', 'label'];
      const stylingClasses = ['rounded-full', 'px-', 'py-', 'bg-', 'text-', 'border-'];

      const hasKeyword = keywords.some(k => classNameValue.toLowerCase().includes(k));
      const hasStyling = stylingClasses.some(s => classNameValue.includes(s));

      // Conservative matching: require a keyword and at least some styling-like class
      if (hasKeyword && hasStyling) {
        return {
          file: '', // Filled by engine
          line: 0,  // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-badge',
          violation: 'Custom badge detected. Use <Badge> from shadcn/ui.',
          suggestion: 'Use <Badge> from shadcn/ui.',
          element: tagName,
          replacement: 'Badge',
        };
      }
    }

    return null;
  },
};
