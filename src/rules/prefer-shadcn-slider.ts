import {
  type JsxAttribute,
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type Node,
  SyntaxKind,
} from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnSlider: Rule = {
  id: 'prefer-shadcn-slider',
  description:
    'Detects raw <input type="range"> elements and suggests using shadcn/ui <Slider> component.',
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

    if (tagName === 'input') {
      const typeAttr = attributes.find((a) => a.getNameNode().getText() === 'type');
      const typeValue = typeAttr?.getInitializer()?.getText().replace(/['"]/g, '');

      if (typeValue === 'range') {
        return {
          file: '', // Filled by engine
          line: 0, // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-slider',
          violation: 'Raw <input type="range"> detected. Use <Slider> from shadcn/ui.',
          suggestion: 'Use <Slider> from shadcn/ui.',
          element: 'input',
          replacement: 'Slider',
          sourceLine: '',
          suggestedLine: '',
        };
      }
    }

    return null;
  },
};
