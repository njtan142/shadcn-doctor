import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnSheet: Rule = {
  id: 'prefer-shadcn-sheet',
  description:
    'Detects raw side-panel/sheet patterns and suggests using shadcn/ui <Sheet> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement],
  check: (node: Node): Finding | null => {
    const openingElement = node as JsxOpeningElement;
    const tagName = openingElement.getTagNameNode().getText().trim();
    const attributes = openingElement
      .getAttributes()
      .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];

    if (tagName !== 'div') return null;

    const classNameAttr = attributes.find(
      (a) => a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class',
    );
    const classNameValue =
      classNameAttr?.getInitializer()?.getText().replace(/['"]/g, '').toLowerCase() ?? '';

    const roleAttr = attributes.find((a) => a.getNameNode().getText() === 'role');
    const roleValue = roleAttr?.getInitializer()?.getText().replace(/['"`]/g, '') ?? '';

    // Detect <div role="dialog"> with sheet/slide class indicators
    if (roleValue === 'dialog') {
      const sheetDialogKeywords = ['sheet', 'side-panel', 'slide-in', 'slide-out'];
      if (sheetDialogKeywords.some((k) => classNameValue.includes(k))) {
        return {
          file: '', // Filled by engine
          line: 0, // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-sheet',
          violation:
            'Custom sheet/side-panel <div role="dialog"> detected. Use <Sheet> from shadcn/ui.',
          suggestion: 'Use <Sheet> from shadcn/ui.',
          element: 'div',
          replacement: 'Sheet',
sourceLine: '',
suggestedLine: '',
};
      }
    }

    // Detect <div> with className containing "sheet" AND a positioning keyword (side panel indicator)
    if (classNameValue.includes('sheet')) {
      const positioningKeywords = ['fixed', 'absolute', 'inset', 'side'];
      if (positioningKeywords.some((k) => classNameValue.includes(k))) {
        return {
          file: '', // Filled by engine
          line: 0, // Filled by engine
          column: 0, // Filled by engine
          rule: 'prefer-shadcn-sheet',
          violation: 'Custom sheet/side-panel <div> detected. Use <Sheet> from shadcn/ui.',
          suggestion: 'Use <Sheet> from shadcn/ui.',
          element: 'div',
          replacement: 'Sheet',
sourceLine: '',
suggestedLine: '',
};
      }
    }

    return null;
  },
};
