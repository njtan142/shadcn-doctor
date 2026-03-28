import { SyntaxKind, type Node, type JsxOpeningElement, type JsxSelfClosingElement, type JsxAttribute } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnAvatar: Rule = {
  id: 'prefer-shadcn-avatar',
  description: 'Detects raw <img> elements styled as avatars and suggests using shadcn/ui <Avatar> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement, SyntaxKind.JsxSelfClosingElement],
  check: (node: Node): Finding | null => {
    let tagName = '';
    let attributes: JsxAttribute[] = [];

    if (node.isKind(SyntaxKind.JsxOpeningElement)) {
      tagName = (node as JsxOpeningElement).getTagNameNode().getText().trim();
      attributes = (node as JsxOpeningElement).getAttributes().filter(a => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];
    } else if (node.isKind(SyntaxKind.JsxSelfClosingElement)) {
      tagName = (node as JsxSelfClosingElement).getTagNameNode().getText().trim();
      attributes = (node as JsxSelfClosingElement).getAttributes().filter(a => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];
    }

    if (tagName === 'img') {
      const classNameAttr = attributes.find(a => a.getName() === 'className');
      const classNameValue = classNameAttr?.getInitializer()?.getText().replace(/['"`]/g, '') || '';

      const isRoundedFull = classNameValue.includes('rounded-full');
      const hasSmallSizing = /(h-|w-|size-)(10|8|12|6)/.test(classNameValue);

      if (isRoundedFull && hasSmallSizing) {
        return {
          file: '', // Filled by engine
          line: 0,  // Filled by engine
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
