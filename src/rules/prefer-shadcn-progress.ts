import {
  type JsxAttribute,
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type Node,
  SyntaxKind,
} from 'ts-morph';
import type { Finding, Rule } from '../types.js';

const PROGRESS_STYLING_SIGNALS = ['h-', 'bg-', 'rounded'];

function hasProgressStyling(className: string): boolean {
  const classes = className.split(/\s+/).filter(Boolean);
  return classes.some((cls) =>
    PROGRESS_STYLING_SIGNALS.some((signal) => cls === signal || cls.startsWith(signal)),
  );
}

export const preferShadcnProgress: Rule = {
  id: 'prefer-shadcn-progress',
  description:
    'Detects raw <progress> elements or progress-bar-like elements and suggests using shadcn/ui <Progress> component.',
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

    if (tagName === 'progress') {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-progress',
        violation: 'Raw <progress> detected. Use <Progress> from shadcn/ui.',
        suggestion: 'Use <Progress> from shadcn/ui.',
        element: 'progress',
        replacement: 'Progress',
        sourceLine: '',
        suggestedLine: '',
      };
    }

    if (tagName === 'div') {
      const roleAttr = attributes.find((a) => a.getNameNode().getText() === 'role');
      if (roleAttr) {
        const roleValue = roleAttr.getInitializer()?.getText().replace(/['"`]/g, '') || '';
        if (roleValue === 'progressbar') {
          return {
            file: '', // Filled by engine
            line: 0, // Filled by engine
            column: 0, // Filled by engine
            rule: 'prefer-shadcn-progress',
            violation: 'Raw <div role="progressbar"> detected. Use <Progress> from shadcn/ui.',
            suggestion: 'Use <Progress> from shadcn/ui.',
            element: 'div',
            replacement: 'Progress',
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
        if (classNameValue.includes('progress') && hasProgressStyling(classNameValue)) {
          return {
            file: '', // Filled by engine
            line: 0, // Filled by engine
            column: 0, // Filled by engine
            rule: 'prefer-shadcn-progress',
            violation: 'Custom progress bar <div> detected. Use <Progress> from shadcn/ui.',
            suggestion: 'Use <Progress> from shadcn/ui.',
            element: 'div',
            replacement: 'Progress',
            sourceLine: '',
            suggestedLine: '',
          };
        }
      }
    }

    return null;
  },
};
