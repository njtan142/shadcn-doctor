import { SyntaxKind, type Node, type JsxOpeningElement, type JsxSelfClosingElement, type JsxAttribute } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnRadioGroup: Rule = {
  id: 'prefer-shadcn-radio-group',
  description: 'Detects raw <input type="radio"> elements and suggests using shadcn/ui <RadioGroup> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement, SyntaxKind.JsxSelfClosingElement],
  check: (node: Node): Finding | null => {
    let tagName = '';
    let attributes: (JsxAttribute)[] = [];

    if (node.isKind(SyntaxKind.JsxOpeningElement)) {
      tagName = (node as JsxOpeningElement).getTagNameNode().getText().trim();
      attributes = (node as JsxOpeningElement).getAttributes().filter(a => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];
    } else if (node.isKind(SyntaxKind.JsxSelfClosingElement)) {
      tagName = (node as JsxSelfClosingElement).getTagNameNode().getText().trim();
      attributes = (node as JsxSelfClosingElement).getAttributes().filter(a => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];
    }

    if (tagName === 'input') {
      const typeAttr = attributes.find(a => a.getName() === 'type');
      const typeValue = typeAttr?.getInitializer()?.getText().replace(/['"]/g, '');

      if (typeValue === 'radio') {
        return {
          file: '', // Filled by engine
          line: 0,  // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-radio-group',
          violation: 'Raw <input type="radio"> detected. Use <RadioGroup> from shadcn/ui.',
          suggestion: 'Use <RadioGroup> from shadcn/ui.',
          element: 'input',
          replacement: 'RadioGroup',
        };
      }
    }

    return null;
  },
};
