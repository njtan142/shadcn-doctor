import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnToast: Rule = {
  id: 'prefer-shadcn-toast',
  description:
    'Detects raw toast/notification patterns and suggests using shadcn/ui <Toast> or Sonner component.',
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
        const roleValue = roleAttr.getInitializer()?.getText().replace(/['"]/g, '') ?? '';
        if (roleValue === 'status') {
          return {
            file: '',
            line: 0,
            column: 0,
            rule: 'prefer-shadcn-toast',
            violation:
              'Custom toast <div> with role="status" detected. Use <Toast> from shadcn/ui.',
            suggestion: 'Use <Toast> from shadcn/ui or Sonner.',
            element: 'div',
            replacement: 'Toast',
            sourceLine: '',
            suggestedLine: '',
          };
        }
      }

      const classNameAttr = attributes.find((a) => a.getNameNode().getText() === 'className');
      if (classNameAttr) {
        const classNameValue = classNameAttr.getInitializer()?.getText() ?? '';
        const lowerClassName = classNameValue.toLowerCase();
        if (
          lowerClassName.includes('toast') ||
          lowerClassName.includes('notification') ||
          lowerClassName.includes('snackbar')
        ) {
          return {
            file: '',
            line: 0,
            column: 0,
            rule: 'prefer-shadcn-toast',
            violation:
              'Custom toast/notification <div> detected. Use <Toast> from shadcn/ui or Sonner.',
            suggestion: 'Use <Toast> from shadcn/ui or Sonner.',
            element: 'div',
            replacement: 'Toast',
            sourceLine: '',
            suggestedLine: '',
          };
        }
      }
    }

    return null;
  },
};
