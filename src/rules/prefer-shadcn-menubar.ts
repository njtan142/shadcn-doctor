import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnMenubar: Rule = {
  id: 'prefer-shadcn-menubar',
  description: 'Detects raw menubar patterns and suggests using shadcn/ui <Menubar> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement],
  check: (node: Node): Finding | null => {
    const openingElement = node as JsxOpeningElement;
    const tagName = openingElement.getTagNameNode().getText().trim();
    const attributes = openingElement
      .getAttributes()
      .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];

    if (tagName !== 'div' && tagName !== 'nav') return null;

    const roleAttr = attributes.find((a) => a.getNameNode().getText() === 'role');
    if (roleAttr) {
      const roleValue = roleAttr.getInitializer()?.getText().replace(/['"`]/g, '') || '';
      if (roleValue === 'menubar') {
        return {
          file: '', // Filled by engine
          line: 0, // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-menubar',
          violation: `Raw <${tagName} role="menubar"> detected. Use <Menubar> from shadcn/ui.`,
          suggestion: 'Use <Menubar> from shadcn/ui.',
          element: tagName,
          replacement: 'Menubar',
sourceLine: '',
suggestedLine: '',
};
      }
    }

    const classNameAttr = attributes.find(
      (a) => a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class',
    );
    if (classNameAttr) {
      const initializer = classNameAttr.getInitializer();
      if (initializer) {
        const classNameValue = initializer.getText().replace(/['"]/g, '').toLowerCase();
        if (classNameValue.includes('menubar') || classNameValue.includes('menu-bar')) {
          return {
            file: '', // Filled by engine
            line: 0, // Filled by engine
            column: 0, // Filled by engine
            rule: 'prefer-shadcn-menubar',
            violation: `Custom menubar <${tagName}> detected. Use <Menubar> from shadcn/ui.`,
            suggestion: 'Use <Menubar> from shadcn/ui.',
            element: tagName,
            replacement: 'Menubar',
sourceLine: '',
suggestedLine: '',
};
        }
      }
    }

    return null;
  },
};
