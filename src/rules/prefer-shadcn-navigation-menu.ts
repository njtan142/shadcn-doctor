import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnNavigationMenu: Rule = {
  id: 'prefer-shadcn-navigation-menu',
  description:
    'Detects raw navigation menu patterns and suggests using shadcn/ui <NavigationMenu> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement],
  check: (node: Node): Finding | null => {
    const openingElement = node as JsxOpeningElement;
    const tagName = openingElement.getTagNameNode().getText().trim();
    const attributes = openingElement
      .getAttributes()
      .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];

    const getClassNameValue = (): string => {
      const classNameAttr = attributes.find(
        (a) => a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class',
      );
      if (!classNameAttr) return '';
      const initializer = classNameAttr.getInitializer();
      if (!initializer) return '';
      return initializer.getText().replace(/['"]/g, '').toLowerCase();
    };

    const navMenuKeywords = ['nav-menu', 'navigation-menu'];

    if (tagName === 'nav') {
      const roleAttr = attributes.find((a) => a.getNameNode().getText() === 'role');
      if (roleAttr) {
        const roleValue = roleAttr.getInitializer()?.getText().replace(/['"`]/g, '') || '';
        if (roleValue === 'navigation') {
          return {
            file: '', // Filled by engine
            line: 0, // Filled by engine
            column: 0, // Filled by engine
            rule: 'prefer-shadcn-navigation-menu',
            violation: 'Raw <nav role="navigation"> detected. Use <NavigationMenu> from shadcn/ui.',
            suggestion: 'Use <NavigationMenu> from shadcn/ui.',
            element: 'nav',
            replacement: 'NavigationMenu',
sourceLine: '',
suggestedLine: '',
};
        }
      }

      const classNameValue = getClassNameValue();
      if (navMenuKeywords.some((k) => classNameValue.includes(k))) {
        return {
          file: '', // Filled by engine
          line: 0, // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-navigation-menu',
          violation: 'Custom navigation menu <nav> detected. Use <NavigationMenu> from shadcn/ui.',
          suggestion: 'Use <NavigationMenu> from shadcn/ui.',
          element: 'nav',
          replacement: 'NavigationMenu',
sourceLine: '',
suggestedLine: '',
};
      }
    }

    if (tagName === 'ul') {
      const classNameValue = getClassNameValue();
      if (navMenuKeywords.some((k) => classNameValue.includes(k))) {
        return {
          file: '', // Filled by engine
          line: 0, // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-navigation-menu',
          violation: 'Custom navigation menu <ul> detected. Use <NavigationMenu> from shadcn/ui.',
          suggestion: 'Use <NavigationMenu> from shadcn/ui.',
          element: 'ul',
          replacement: 'NavigationMenu',
sourceLine: '',
suggestedLine: '',
};
      }
    }

    return null;
  },
};
