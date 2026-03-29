import {
  type JsxAttribute,
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type Node,
  SyntaxKind,
} from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnInputOtp: Rule = {
  id: 'prefer-shadcn-input-otp',
  description: 'Detects raw OTP input patterns and suggests using shadcn/ui <InputOTP> component.',
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
      // Check maxLength attribute of 1 (single character OTP input pattern)
      const maxLengthAttr = attributes.find((a) => a.getNameNode().getText() === 'maxLength');
      if (maxLengthAttr) {
        const maxLengthValue = maxLengthAttr.getInitializer()?.getText() ?? '';
        // String literal "1" → getText() returns '"1"'; JSX expression {1} → getText() returns '{1}'
        if (maxLengthValue === '"1"' || maxLengthValue === '{1}') {
          return {
            file: '',
            line: 0,
            column: 0,
            rule: 'prefer-shadcn-input-otp',
            violation:
              'Single-character OTP <input> (maxLength=1) detected. Use <InputOTP> from shadcn/ui.',
            suggestion: 'Use <InputOTP> from shadcn/ui.',
            element: 'input',
            replacement: 'InputOTP',
            sourceLine: '',
            suggestedLine: '',
          };
        }
      }

      // Check className containing "otp"
      const classNameAttr = attributes.find((a) => a.getNameNode().getText() === 'className');
      const classNameValue = classNameAttr?.getInitializer()?.getText().toLowerCase() ?? '';
      if (classNameValue.includes('otp')) {
        return {
          file: '',
          line: 0,
          column: 0,
          rule: 'prefer-shadcn-input-otp',
          violation: 'OTP <input> detected. Use <InputOTP> from shadcn/ui.',
          suggestion: 'Use <InputOTP> from shadcn/ui.',
          element: 'input',
          replacement: 'InputOTP',
          sourceLine: '',
          suggestedLine: '',
        };
      }
    }

    if (tagName === 'div') {
      const classNameAttr = attributes.find((a) => a.getNameNode().getText() === 'className');
      const classNameValue = classNameAttr?.getInitializer()?.getText().toLowerCase() ?? '';
      if (classNameValue.includes('otp')) {
        return {
          file: '',
          line: 0,
          column: 0,
          rule: 'prefer-shadcn-input-otp',
          violation: 'OTP <div> wrapper detected. Use <InputOTP> from shadcn/ui.',
          suggestion: 'Use <InputOTP> from shadcn/ui.',
          element: 'div',
          replacement: 'InputOTP',
          sourceLine: '',
          suggestedLine: '',
        };
      }
    }

    return null;
  },
};
