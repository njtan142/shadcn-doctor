import {
  type JsxAttribute,
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type Node,
  SyntaxKind,
} from 'ts-morph';
import type { Finding, Rule } from '../types.js';

const FORM_FIELD_PATTERNS = [
  'form-control',
  'form-group',
  'input-group',
  'field-wrapper',
  'input-wrapper',
];

function isWithinShadcnFormOrField(node: Node): boolean {
  let current: Node | undefined = node.getParent();

  while (current) {
    if (current.isKind(SyntaxKind.JsxElement)) {
      const children = current.getChildren();
      const openingElement = children[0];
      if (openingElement && openingElement.isKind(SyntaxKind.JsxOpeningElement)) {
        const tagNameNode = openingElement.getTagNameNode();
        const tagName = tagNameNode.getText().trim();

        if (
          tagName === 'Form' ||
          tagName === 'FormField' ||
          tagName === 'FormItem' ||
          tagName === 'FormControl' ||
          tagName === 'Field' ||
          tagName === 'FieldGroup' ||
          tagName === 'FieldContent'
        ) {
          return true;
        }
      }
    }

    current = current.getParent();
  }

  return false;
}

export const preferShadcnField: Rule = {
  id: 'prefer-shadcn-field',
  description:
    'Detects raw HTML elements that should be wrapped in shadcn/ui Field or FormField component.',
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

    const validTags = ['input', 'select', 'textarea'];
    if (!validTags.includes(tagName)) {
      return null;
    }

    if (isWithinShadcnFormOrField(node)) {
      return null;
    }

    const classNameAttr = attributes.find(
      (a) => a.getNameNode().getText() === 'className' || a.getNameNode().getText() === 'class',
    );

    if (!classNameAttr) {
      return null;
    }

    const classNameValue =
      classNameAttr.getInitializer()?.getText().replace(/['"`]/g, '').toLowerCase() ?? '';

    const hasFieldPattern = FORM_FIELD_PATTERNS.some((pattern) => classNameValue.includes(pattern));

    if (hasFieldPattern) {
      return {
        file: '',
        line: 0,
        column: 0,
        rule: 'prefer-shadcn-field',
        violation: `Raw <${tagName}> with field wrapper className detected. Use <Field> from shadcn/ui.`,
        suggestion:
          'Wrap in <Field> from shadcn/ui or use <FormField> for react-hook-form integration.',
        element: tagName,
        replacement: tagName === 'input' ? 'Input' : tagName === 'select' ? 'Select' : 'Textarea',
        sourceLine: '',
        suggestedLine: '',
      };
    }

    return null;
  },
};
