import {
  type JsxAttribute,
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type Node,
  SyntaxKind,
} from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnAvatar: Rule = {
  id: 'prefer-shadcn-avatar',
  description:
    'Detects raw <img> elements styled as avatars and suggests using shadcn/ui <Avatar> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement, SyntaxKind.JsxSelfClosingElement],
  check: (node: Node): Finding | null => {
    let tagName = '';
    let attributes: JsxAttribute[] = [];

    if (node.isKind(SyntaxKind.JsxOpeningElement)) {
      tagName = (node as JsxOpeningElement).getTagNameNode().getText().trim();
      attributes = (node as JsxOpeningElement)
        .getAttributes()
        .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];
    } else if (node.isKind(SyntaxKind.JsxSelfClosingElement)) {
      tagName = (node as JsxSelfClosingElement).getTagNameNode().getText().trim();
      attributes = (node as JsxSelfClosingElement)
        .getAttributes()
        .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];
    }

    if (tagName === 'img') {
      const classNameAttr = attributes.find(
        (a) =>
          a.isKind(SyntaxKind.JsxAttribute) &&
          (a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class'),
      );
      if (!classNameAttr) return null;
      const initializer = classNameAttr.getInitializer();
      if (!initializer) return null;
      const classNameValue = initializer.getText().replace(/['"`]/g, '');

      const isRoundedFull = classNameValue.includes('rounded-full');
      const hasSmallSizing = /(h-|w-|size-)\d+/.test(classNameValue);

      if (isRoundedFull && hasSmallSizing) {
        return {
          file: '', // Filled by engine
          line: 0, // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-avatar',
          violation: 'Custom avatar detected. Use <Avatar> from shadcn/ui.',
          suggestion: 'Use <Avatar> from shadcn/ui.',
          element: 'img',
          replacement: 'Avatar',
        };
      }
    }

    return null;
  },
};
