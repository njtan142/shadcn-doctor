import {
  type JsxAttribute,
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type Node,
  SyntaxKind,
} from 'ts-morph';
import type { Finding, Rule } from '../types.js';

const SEPARATOR_STYLING_SIGNALS = ['h-px', 'w-px', 'border-t', 'border-b', 'border-l', 'border-r'];

function hasSeparatorStyling(className: string): boolean {
  const classes = className.split(/\s+/).filter(Boolean);
  return classes.some((cls) =>
    SEPARATOR_STYLING_SIGNALS.some((signal) => cls === signal || cls.startsWith(signal)),
  );
}

export const preferShadcnSeparator: Rule = {
  id: 'prefer-shadcn-separator',
  description:
    'Detects raw <hr> elements or divider-like elements and suggests using shadcn/ui <Separator> component.',
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

    if (tagName === 'hr') {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-separator',
        violation: 'Raw <hr> detected. Use <Separator> from shadcn/ui.',
        suggestion: 'Use <Separator> from shadcn/ui.',
        element: 'hr',
        replacement: 'Separator',
        sourceLine: '',
        suggestedLine: '',
      };
    }

    if (tagName === 'div' || tagName === 'span') {
      const roleAttr = attributes.find((a) => a.getNameNode().getText() === 'role');
      if (roleAttr) {
        const roleValue = roleAttr.getInitializer()?.getText().replace(/['"`]/g, '') || '';
        if (roleValue === 'separator') {
          return {
            file: '', // Filled by engine
            line: 0, // Filled by engine
            column: 0, // Filled by engine
            rule: 'prefer-shadcn-separator',
            violation: `Raw <${tagName} role="separator"> detected. Use <Separator> from shadcn/ui.`,
            suggestion: 'Use <Separator> from shadcn/ui.',
            element: tagName,
            replacement: 'Separator',
            sourceLine: '',
            suggestedLine: '',
          };
        }
      }

      const classNameAttr = attributes.find(
        (a) => a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class',
      );
      if (classNameAttr) {
        const classNameValue =
          classNameAttr.getInitializer()?.getText().replace(/['"`]/g, '').toLowerCase() || '';
        const hasDividerKeyword =
          classNameValue.includes('divider') || classNameValue.includes('separator');
        if (hasDividerKeyword && hasSeparatorStyling(classNameValue)) {
          return {
            file: '', // Filled by engine
            line: 0, // Filled by engine
            column: 0, // Filled by engine
            rule: 'prefer-shadcn-separator',
            violation: `Custom divider <${tagName}> detected. Use <Separator> from shadcn/ui.`,
            suggestion: 'Use <Separator> from shadcn/ui.',
            element: tagName,
            replacement: 'Separator',
            sourceLine: '',
            suggestedLine: '',
          };
        }
      }
    }

    return null;
  },
};
