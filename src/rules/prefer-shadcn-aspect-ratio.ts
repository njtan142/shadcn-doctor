import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

const ASPECT_EXACT_TOKENS = new Set(['aspect-video', 'aspect-square', 'aspect-auto']);

export const preferShadcnAspectRatio: Rule = {
  id: 'prefer-shadcn-aspect-ratio',
  description:
    'Detects <div> elements with Tailwind aspect ratio classes or aspect-ratio CSS patterns and suggests using shadcn/ui <AspectRatio> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement],
  check: (node: Node): Finding | null => {
    const openingElement = node as JsxOpeningElement;
    const tagName = openingElement.getTagNameNode().getText().trim();
    const attributes = openingElement
      .getAttributes()
      .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];

    if (tagName !== 'div') {
      return null;
    }

    const classNameAttr = attributes.find(
      (a) => a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class',
    );

    if (!classNameAttr) {
      return null;
    }

    const classNameValue = classNameAttr.getInitializer()?.getText().replace(/['"`]/g, '') || '';
    const tokens = classNameValue.split(/\s+/);

    // Check for exact Tailwind aspect ratio tokens
    const hasTailwindAspect = tokens.some((token) => ASPECT_EXACT_TOKENS.has(token));
    if (hasTailwindAspect) {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-aspect-ratio',
        violation:
          'Raw <div> with Tailwind aspect ratio class detected. Use <AspectRatio> from shadcn/ui.',
        suggestion: 'Use <AspectRatio> from shadcn/ui.',
        element: 'div',
        replacement: 'AspectRatio',
        sourceLine: '',
        suggestedLine: '',
      };
    }

    // Check for aspect-ratio keyword or @tailwindcss/aspect-ratio plugin prefixes (aspect-w-, aspect-h-)
    const hasAspectRatioKeyword = tokens.some(
      (token) =>
        token === 'aspect-ratio' || token.startsWith('aspect-w-') || token.startsWith('aspect-h-'),
    );

    if (hasAspectRatioKeyword) {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-aspect-ratio',
        violation: 'Raw <div> with aspect-ratio class detected. Use <AspectRatio> from shadcn/ui.',
        suggestion: 'Use <AspectRatio> from shadcn/ui.',
        element: 'div',
        replacement: 'AspectRatio',
        sourceLine: '',
        suggestedLine: '',
      };
    }

    return null;
  },
};
