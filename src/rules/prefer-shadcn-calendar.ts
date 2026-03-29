import {
  type JsxAttribute,
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type Node,
  SyntaxKind,
} from 'ts-morph';
import type { Finding, Rule } from '../types.js';

const DATE_INPUT_TYPES = new Set(['date', 'datetime-local', 'month']);

export const preferShadcnCalendar: Rule = {
  id: 'prefer-shadcn-calendar',
  description:
    'Detects raw date input elements and calendar div patterns and suggests using shadcn/ui <Calendar> component.',
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

    if (tagName === 'input') {
      const typeAttr = attributes.find((a) => a.getNameNode().getText() === 'type');
      const typeValue = typeAttr?.getInitializer()?.getText().replace(/['"]/g, '') ?? '';
      if (DATE_INPUT_TYPES.has(typeValue)) {
        return {
          file: '',
          line: 0,
          column: 0,
          rule: 'prefer-shadcn-calendar',
          violation: `Raw <input type="${typeValue}"> detected. Use <Calendar> from shadcn/ui.`,
          suggestion: 'Use <Calendar> from shadcn/ui.',
          element: 'input',
          replacement: 'Calendar',
          sourceLine: '',
          suggestedLine: '',
        };
      }
    }

    if (tagName === 'div') {
      const classNameAttr = attributes.find((a) => a.getNameNode().getText() === 'className');
      const classNameValue = classNameAttr?.getInitializer()?.getText().toLowerCase() ?? '';
      if (
        classNameValue.includes('calendar') ||
        classNameValue.includes('datepicker') ||
        classNameValue.includes('date-picker')
      ) {
        return {
          file: '',
          line: 0,
          column: 0,
          rule: 'prefer-shadcn-calendar',
          violation: 'Custom calendar/datepicker <div> detected. Use <Calendar> from shadcn/ui.',
          suggestion: 'Use <Calendar> from shadcn/ui.',
          element: 'div',
          replacement: 'Calendar',
          sourceLine: '',
          suggestedLine: '',
        };
      }
    }

    return null;
  },
};
