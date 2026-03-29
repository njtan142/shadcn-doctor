import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnBreadcrumb: Rule = {
  id: 'prefer-shadcn-breadcrumb',
  description:
    'Detects raw breadcrumb navigation patterns and suggests using shadcn/ui <Breadcrumb> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement],
  check: (node: Node): Finding | null => {
    const openingElement = node as JsxOpeningElement;
    const tagName = openingElement.getTagNameNode().getText().trim();
    const attributes = openingElement
      .getAttributes()
      .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];

    if (tagName === 'nav') {
      const ariaLabelAttr = attributes.find((a) => a.getNameNode().getText() === 'aria-label');
      if (ariaLabelAttr) {
        const initializer = ariaLabelAttr.getInitializer();
        if (initializer) {
          const value = initializer.getText().replace(/['"]/g, '').toLowerCase();
          if (value === 'breadcrumb') {
            return {
              file: '', // Filled by engine
              line: 0, // Filled by engine
              column: 0, // Filled by engine
              rule: 'prefer-shadcn-breadcrumb',
              violation: 'Raw breadcrumb <nav> detected. Use <Breadcrumb> from shadcn/ui.',
              suggestion: 'Use <Breadcrumb> from shadcn/ui.',
              element: 'nav',
              replacement: 'Breadcrumb',
sourceLine: '',
suggestedLine: '',
};
          }
        }
      }
    }

    if (tagName === 'ol' || tagName === 'ul') {
      const classNameAttr = attributes.find(
        (a) => a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class',
      );
      if (classNameAttr) {
        const initializer = classNameAttr.getInitializer();
        if (initializer) {
          const classNameValue = initializer.getText().replace(/['"]/g, '').toLowerCase();
          if (classNameValue.includes('breadcrumb')) {
            return {
              file: '', // Filled by engine
              line: 0, // Filled by engine
              column: 0, // Filled by engine
              rule: 'prefer-shadcn-breadcrumb',
              violation: `Custom breadcrumb <${tagName}> detected. Use <Breadcrumb> from shadcn/ui.`,
              suggestion: 'Use <Breadcrumb> from shadcn/ui.',
              element: tagName,
              replacement: 'Breadcrumb',
sourceLine: '',
suggestedLine: '',
};
          }
        }
      }
    }

    return null;
  },
};
