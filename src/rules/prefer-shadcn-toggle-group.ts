import {
  type JsxAttribute,
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type Node,
  SyntaxKind,
} from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnToggleGroup: Rule = {
  id: 'prefer-shadcn-toggle-group',
  description:
    'Detects raw <div role="group"> with toggle className or <div> with toggle-group className and suggests using shadcn/ui <ToggleGroup> component.',
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

    if (tagName !== 'div') {
      return null;
    }

    const roleAttr = attributes.find((a) => a.getNameNode().getText() === 'role');
    const classNameAttr = attributes.find(
      (a) => a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class',
    );
    const classNameValue =
      classNameAttr?.getInitializer()?.getText().replace(/['"`]/g, '').toLowerCase() ?? '';
    const roleValue =
      roleAttr?.getInitializer()?.getText().replace(/['"`]/g, '').toLowerCase() ?? '';

    // Detect <div role="group"> with className containing "toggle"
    if (roleValue === 'group' && classNameValue.includes('toggle')) {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-toggle-group',
        violation:
          'Raw <div role="group"> with toggle className detected. Use <ToggleGroup> from shadcn/ui.',
        suggestion: 'Use <ToggleGroup> from shadcn/ui.',
        element: 'div',
        replacement: 'ToggleGroup',
        sourceLine: '',
        suggestedLine: '',
      };
    }

    // Detect <div> with className containing "toggle-group" or "togglegroup"
    if (classNameValue.includes('toggle-group') || classNameValue.includes('togglegroup')) {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-toggle-group',
        violation:
          'Raw <div> with toggle-group className detected. Use <ToggleGroup> from shadcn/ui.',
        suggestion: 'Use <ToggleGroup> from shadcn/ui.',
        element: 'div',
        replacement: 'ToggleGroup',
        sourceLine: '',
        suggestedLine: '',
      };
    }

    return null;
  },
};
