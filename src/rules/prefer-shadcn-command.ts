import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnCommand: Rule = {
  id: 'prefer-shadcn-command',
  description:
    'Detects raw command palette/search patterns and suggests using shadcn/ui <Command> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement],
  check: (node: Node): Finding | null => {
    const openingElement = node as JsxOpeningElement;
    const tagName = openingElement.getTagNameNode().getText().trim();
    const attributes = openingElement
      .getAttributes()
      .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];

    if (tagName === 'div') {
      // Detect cmdk library pattern: data-cmdk-root attribute
      const cmdkAttr = attributes.find((a) => a.getNameNode().getText() === 'data-cmdk-root');
      if (cmdkAttr !== undefined) {
        return {
          file: '',
          line: 0,
          column: 0,
          rule: 'prefer-shadcn-command',
          violation:
            'cmdk library pattern detected (data-cmdk-root). Use <Command> from shadcn/ui.',
          suggestion: 'Use <Command> from shadcn/ui.',
          element: 'div',
          replacement: 'Command',
          sourceLine: '',
          suggestedLine: '',
        };
      }

      const classNameAttr = attributes.find((a) => a.getNameNode().getText() === 'className');
      const classNameValue = classNameAttr?.getInitializer()?.getText().toLowerCase() ?? '';

      // Detect className containing "command" AND ("palette" OR "search")
      if (
        classNameValue.includes('command') &&
        (classNameValue.includes('palette') || classNameValue.includes('search'))
      ) {
        return {
          file: '',
          line: 0,
          column: 0,
          rule: 'prefer-shadcn-command',
          violation: 'Custom command palette/search <div> detected. Use <Command> from shadcn/ui.',
          suggestion: 'Use <Command> from shadcn/ui.',
          element: 'div',
          replacement: 'Command',
          sourceLine: '',
          suggestedLine: '',
        };
      }

      // Detect role="combobox" with className containing "command"
      const roleAttr = attributes.find((a) => a.getNameNode().getText() === 'role');
      const roleValue = roleAttr?.getInitializer()?.getText().replace(/['"]/g, '') ?? '';
      if (roleValue === 'combobox' && classNameValue.includes('command')) {
        return {
          file: '',
          line: 0,
          column: 0,
          rule: 'prefer-shadcn-command',
          violation: 'Custom command combobox <div> detected. Use <Command> from shadcn/ui.',
          suggestion: 'Use <Command> from shadcn/ui.',
          element: 'div',
          replacement: 'Command',
          sourceLine: '',
          suggestedLine: '',
        };
      }
    }

    return null;
  },
};
