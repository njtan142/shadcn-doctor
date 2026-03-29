import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

const BORDER_SIGNALS = ['border', 'rounded', 'shadow'];
const PADDING_SIGNALS = ['p-', 'px-', 'py-', 'pt-', 'pb-', 'pl-', 'pr-', 'gap-'];
const BACKGROUND_SIGNALS = ['bg-', 'background'];

interface SignalInfo {
  hasBorder: boolean;
  hasPadding: boolean;
  hasBackground: boolean;
  signalCount: number;
}

function analyzeSignals(className: string): SignalInfo {
  const classes = className.split(/\s+/).filter(Boolean);
  let signalCount = 0;
  let hasBorder = false;
  let hasPadding = false;
  let hasBackground = false;

  for (const cls of classes) {
    if (BORDER_SIGNALS.some((s) => cls.startsWith(s) || cls === s)) {
      hasBorder = true;
      signalCount++;
    }
    if (PADDING_SIGNALS.some((s) => cls.startsWith(s))) {
      hasPadding = true;
      signalCount++;
    }
    if (BACKGROUND_SIGNALS.some((s) => cls.startsWith(s))) {
      hasBackground = true;
      signalCount++;
    }
  }

  return { hasBorder, hasPadding, hasBackground, signalCount };
}

function hasLayoutClass(className: string): boolean {
  const classes = className.split(/\s+/).filter(Boolean);
  return classes.some((c) => c.startsWith('flex') || c.startsWith('grid'));
}

function getClassNameFromAttributes(attributes: JsxAttribute[], sourceFile: Node): string | null {
  for (const attr of attributes) {
    if (attr.isKind(SyntaxKind.JsxAttribute)) {
      const name = attr.getNameNode().getText();
      if (name === 'className' || name === 'class') {
        const initializer = attr.getInitializer();
        if (!initializer) return null;
        const text = initializer.getText();
        return text.replace(/^['"`]|['"`]$/g, '');
      }
    }
  }
  return null;
}

function hasShadcnCardImport(sourceFile: Node): boolean {
  let hasCardImport = false;
  sourceFile.forEachDescendant((node) => {
    if (node.isKind(SyntaxKind.ImportDeclaration)) {
      const moduleName = node.getModuleSpecifier().getText();
      if (moduleName.includes('card') && moduleName.includes('ui')) {
        const namedImports = node.getNamedImports();
        for (const namedImport of namedImports) {
          if (namedImport.getName() === 'Card') {
            hasCardImport = true;
            break;
          }
        }
      }
    }
  });
  return hasCardImport;
}

export const preferShadcnCard: Rule = {
  id: 'prefer-shadcn-card',
  description:
    'Detects <div> elements with card-like CSS styling and suggests using shadcn/ui <Card> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement],
  check: (node: Node): Finding | null => {
    if (!node.isKind(SyntaxKind.JsxOpeningElement)) return null;

    const openingElement = node as JsxOpeningElement;
    const tagName = openingElement.getTagNameNode().getText().trim();

    if (tagName !== 'div') return null;

    const attributes = openingElement
      .getAttributes()
      .filter((a) => a.isKind(SyntaxKind.JsxAttribute)) as JsxAttribute[];

    const sourceFile = node.getSourceFile();
    if (hasShadcnCardImport(sourceFile)) return null;

    const className = getClassNameFromAttributes(attributes, sourceFile);
    if (!className) return null;

    const { hasBorder, hasPadding, hasBackground, signalCount } = analyzeSignals(className);
    const isLayout = hasLayoutClass(className);

    let distinctCategories = 0;
    if (hasBorder) distinctCategories++;
    if (hasPadding) distinctCategories++;
    if (hasBackground) distinctCategories++;

    const hasShadowSignal = /\bshadow[-\s]/.test(className) || /\bshadow\b/.test(className);

    if (isLayout) {
      if ((distinctCategories >= 3 && hasShadowSignal) || (hasShadowSignal && signalCount >= 4)) {
        return {
          file: '',
          line: 0,
          column: 0,
          rule: 'prefer-shadcn-card',
          violation: 'Custom styled <div> detected. Use <Card> from shadcn/ui.',
          suggestion: 'Use <Card> from shadcn/ui.',
          element: 'div',
          replacement: 'Card',
        };
      }
      return null;
    }

    if (distinctCategories >= 2) {
      if (hasShadowSignal) {
        return {
          file: '',
          line: 0,
          column: 0,
          rule: 'prefer-shadcn-card',
          violation: 'Custom styled <div> detected. Use <Card> from shadcn/ui.',
          suggestion: 'Use <Card> from shadcn/ui.',
          element: 'div',
          replacement: 'Card',
        };
      }

      if (distinctCategories >= 3) {
        return {
          file: '',
          line: 0,
          column: 0,
          rule: 'prefer-shadcn-card',
          violation: 'Custom styled <div> detected. Use <Card> from shadcn/ui.',
          suggestion: 'Use <Card> from shadcn/ui.',
          element: 'div',
          replacement: 'Card',
        };
      }
    }

    return null;
  },
};
