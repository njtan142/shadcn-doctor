import {
  type JsxAttribute,
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type Node,
  SyntaxKind,
} from 'ts-morph';
import type { Finding, Rule } from '../types.js';

const SKELETON_STYLING_SIGNALS = ['rounded', 'h-', 'w-', 'bg-'];

function hasSkeletonStyling(className: string): boolean {
  const classes = className.split(/\s+/).filter(Boolean);
  return classes.some((cls) =>
    SKELETON_STYLING_SIGNALS.some((signal) => cls === signal || cls.startsWith(signal)),
  );
}

export const preferShadcnSkeleton: Rule = {
  id: 'prefer-shadcn-skeleton',
  description:
    'Detects <div> elements with loading skeleton patterns and suggests using shadcn/ui <Skeleton> component.',
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

    if (tagName !== 'div') return null;

    const classNameAttr = attributes.find(
      (a) => a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class',
    );
    if (!classNameAttr) return null;

    const classNameValue =
      classNameAttr.getInitializer()?.getText().replace(/['"`]/g, '').toLowerCase() || '';

    if (classNameValue.includes('animate-pulse')) {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-skeleton',
        violation: 'Custom skeleton loader <div> detected. Use <Skeleton> from shadcn/ui.',
        suggestion: 'Use <Skeleton> from shadcn/ui.',
        element: 'div',
        replacement: 'Skeleton',
        sourceLine: '',
        suggestedLine: '',
      };
    }

    if (classNameValue.includes('skeleton') && hasSkeletonStyling(classNameValue)) {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-skeleton',
        violation: 'Custom skeleton loader <div> detected. Use <Skeleton> from shadcn/ui.',
        suggestion: 'Use <Skeleton> from shadcn/ui.',
        element: 'div',
        replacement: 'Skeleton',
        sourceLine: '',
        suggestedLine: '',
      };
    }

    return null;
  },
};
