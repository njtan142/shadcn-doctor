import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnContextMenu: Rule = {
  id: 'prefer-shadcn-context-menu',
  description:
    'Detects raw elements used as context menus and suggests using shadcn/ui <ContextMenu> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement],
  check: (node: Node): Finding | null => {
    const openingElement = node as JsxOpeningElement;
    const tagName = openingElement.getTagNameNode().getText().trim();

    // Detect the raw <menu> HTML element
    if (tagName === 'menu') {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-context-menu',
        violation: 'Raw <menu> element detected. Use <ContextMenu> from shadcn/ui.',
        suggestion: 'Use <ContextMenu> from shadcn/ui.',
        element: 'menu',
        replacement: 'ContextMenu',
        sourceLine: '',
        suggestedLine: '',
      };
    }

    if (tagName !== 'div' && tagName !== 'ul') return null;

    const attributes = openingElement
      .getAttributes()
      .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];

    const classNameAttr = attributes.find(
      (a) => a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class',
    );
    const classNameValue =
      classNameAttr?.getInitializer()?.getText().replace(/['"`]/g, '').toLowerCase() || '';

    const hasContextMenuClass =
      classNameValue.includes('context-menu') || classNameValue.includes('contextmenu');
    const hasDataContext = attributes.some((a) => a.getNameNode().getText() === 'data-context');

    // Detect role="menu" combined with context-menu signals
    const roleAttr = attributes.find((a) => a.getNameNode().getText() === 'role');
    const roleValue = roleAttr?.getInitializer()?.getText().replace(/['"`]/g, '') || '';

    if (roleValue === 'menu' && (hasDataContext || hasContextMenuClass)) {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-context-menu',
        violation: `Custom context menu <${tagName}> detected. Use <ContextMenu> from shadcn/ui.`,
        suggestion: 'Use <ContextMenu> from shadcn/ui.',
        element: tagName,
        replacement: 'ContextMenu',
        sourceLine: '',
        suggestedLine: '',
      };
    }

    // Detect className-only context menu signals (without requiring role="menu")
    if (hasContextMenuClass) {
      return {
        file: '', // Filled by engine
        line: 0, // Filled by engine
        column: 0, // Filled by engine
        rule: 'prefer-shadcn-context-menu',
        violation: `Custom context menu <${tagName}> detected. Use <ContextMenu> from shadcn/ui.`,
        suggestion: 'Use <ContextMenu> from shadcn/ui.',
        element: tagName,
        replacement: 'ContextMenu',
        sourceLine: '',
        suggestedLine: '',
      };
    }

    return null;
  },
};
