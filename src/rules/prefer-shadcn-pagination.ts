import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnPagination: Rule = {
  id: 'prefer-shadcn-pagination',
  description:
    'Detects raw pagination patterns and suggests using shadcn/ui <Pagination> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement],
  check: (node: Node): Finding | null => {
    const openingElement = node as JsxOpeningElement;
    const tagName = openingElement.getTagNameNode().getText().trim();
    const attributes = openingElement
      .getAttributes()
      .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];

    const getClassNameValue = (): string => {
      const classNameAttr = attributes.find(
        (a) => a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class',
      );
      if (!classNameAttr) return '';
      const initializer = classNameAttr.getInitializer();
      if (!initializer) return '';
      return initializer.getText().replace(/['"]/g, '').toLowerCase();
    };

    if (tagName === 'nav') {
      const ariaLabelAttr = attributes.find((a) => a.getNameNode().getText() === 'aria-label');
      if (ariaLabelAttr) {
        const initializer = ariaLabelAttr.getInitializer();
        if (initializer) {
          const value = initializer.getText().replace(/['"]/g, '').toLowerCase();
          if (value === 'pagination') {
            return {
              file: '', // Filled by engine
              line: 0, // Filled by engine
              column: 0, // Filled by engine
              rule: 'prefer-shadcn-pagination',
              violation: 'Raw pagination <nav> detected. Use <Pagination> from shadcn/ui.',
              suggestion: 'Use <Pagination> from shadcn/ui.',
              element: 'nav',
              replacement: 'Pagination',
sourceLine: '',
suggestedLine: '',
};
          }
        }
      }

      const classNameValue = getClassNameValue();
      if (classNameValue.includes('pagination')) {
        return {
          file: '', // Filled by engine
          line: 0, // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-pagination',
          violation: 'Custom pagination <nav> detected. Use <Pagination> from shadcn/ui.',
          suggestion: 'Use <Pagination> from shadcn/ui.',
          element: 'nav',
          replacement: 'Pagination',
sourceLine: '',
suggestedLine: '',
};
      }
    }

    if (tagName === 'ul') {
      const classNameValue = getClassNameValue();
      if (classNameValue.includes('pagination')) {
        return {
          file: '', // Filled by engine
          line: 0, // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-pagination',
          violation: 'Custom pagination <ul> detected. Use <Pagination> from shadcn/ui.',
          suggestion: 'Use <Pagination> from shadcn/ui.',
          element: 'ul',
          replacement: 'Pagination',
sourceLine: '',
suggestedLine: '',
};
      }
    }

    return null;
  },
};
