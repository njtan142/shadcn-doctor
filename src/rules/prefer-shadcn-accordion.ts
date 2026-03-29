import {
  type JsxAttribute,
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type Node,
  SyntaxKind,
} from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnAccordion: Rule = {
  id: 'prefer-shadcn-accordion',
  description:
    'Detects raw <details> elements or <div> with accordion class and suggests using shadcn/ui <Accordion> component.',
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

    if (tagName === 'details') {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-accordion',
        violation: 'Raw <details> detected. Use <Accordion> from shadcn/ui.',
        suggestion: 'Use <Accordion> from shadcn/ui.',
        element: 'details',
        replacement: 'Accordion',
        sourceLine: '',
        suggestedLine: '',
      };
    }

    if (tagName === 'div') {
      const classNameAttr = attributes.find(
        (a) => a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class',
      );
      if (classNameAttr) {
        const classNameValue =
          classNameAttr.getInitializer()?.getText().replace(/['"`]/g, '').toLowerCase() || '';
        if (classNameValue.includes('accordion')) {
          return {
            file: '', // Filled by engine
            line: 0, // Filled by engine
            column: 0, // Filled by engine
            rule: 'prefer-shadcn-accordion',
            violation: 'Custom accordion <div> detected. Use <Accordion> from shadcn/ui.',
            suggestion: 'Use <Accordion> from shadcn/ui.',
            element: 'div',
            replacement: 'Accordion',
            sourceLine: '',
            suggestedLine: '',
          };
        }
      }
    }

    return null;
  },
};
