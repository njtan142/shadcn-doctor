import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnDropdownMenu: Rule = {
  id: 'prefer-shadcn-dropdown-menu',
  description:
    'Detects raw elements used as dropdown menus and suggests using shadcn/ui <DropdownMenu> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement],
  check: (node: Node): Finding | null => {
    const openingElement = node as JsxOpeningElement;
    const tagName = openingElement.getTagNameNode().getText().trim();

    if (tagName !== 'ul' && tagName !== 'div') return null;

    const attributes = openingElement
      .getAttributes()
      .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];

    const roleAttr = attributes.find((a) => a.getNameNode().getText() === 'role');
    const roleValue = roleAttr?.getInitializer()?.getText().replace(/['"`]/g, '') || '';

    // Only flag role="menu" when there are no context-menu signals
    if (roleValue === 'menu') {
      const classNameAttr = attributes.find(
        (a) => a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class',
      );
      const classNameValue =
        classNameAttr?.getInitializer()?.getText().replace(/['"`]/g, '').toLowerCase() || '';

      const hasContextMenuSignal =
        attributes.some((a) => a.getNameNode().getText() === 'data-context') ||
        classNameValue.includes('context-menu') ||
        classNameValue.includes('contextmenu');

      if (!hasContextMenuSignal) {
        return {
          file: '', // Filled by engine
          line: 0, // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-dropdown-menu',
          violation: `Custom dropdown menu <${tagName}> detected. Use <DropdownMenu> from shadcn/ui.`,
          suggestion: 'Use <DropdownMenu> from shadcn/ui.',
          element: tagName,
          replacement: 'DropdownMenu',
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

      const hasDropdown = classNameValue.includes('dropdown');
      const hasMenuOrList = classNameValue.includes('menu') || classNameValue.includes('list');

      if (hasDropdown && hasMenuOrList) {
        return {
          file: '', // Filled by engine
          line: 0, // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-dropdown-menu',
          violation: `Custom dropdown menu <${tagName}> detected. Use <DropdownMenu> from shadcn/ui.`,
          suggestion: 'Use <DropdownMenu> from shadcn/ui.',
          element: tagName,
          replacement: 'DropdownMenu',
          sourceLine: '',
          suggestedLine: '',
        };
      }
    }

    return null;
  },
};
