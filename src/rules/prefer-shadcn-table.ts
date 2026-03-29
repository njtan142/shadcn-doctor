import {
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type Node,
  SyntaxKind,
} from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnTable: Rule = {
  id: 'prefer-shadcn-table',
  description: 'Detects raw <table> elements and suggests using shadcn/ui <Table> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement, SyntaxKind.JsxSelfClosingElement],
  check: (node: Node): Finding | null => {
    let tagName = '';
    if (node.isKind(SyntaxKind.JsxOpeningElement)) {
      tagName = (node as JsxOpeningElement).getTagNameNode().getText().trim();
    } else if (node.isKind(SyntaxKind.JsxSelfClosingElement)) {
      tagName = (node as JsxSelfClosingElement).getTagNameNode().getText().trim();
    }

    if (tagName === 'table') {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-table',
        violation: 'Raw <table> detected. Use <Table> from shadcn/ui.',
        suggestion: 'Use <Table> from shadcn/ui.',
        element: 'table',
        replacement: 'Table',
sourceLine: '',
suggestedLine: '',
};
    }

    return null;
  },
};
