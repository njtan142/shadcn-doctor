import { type JsxAttribute, type JsxOpeningElement, type Node, SyntaxKind } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const PREFER_SHADCN_CARD_ID = 'prefer-shadcn-card';

const BORDER_SIGNALS = ['border', 'shadow'];
const ROUNDED_SIGNALS = [
  'rounded',
  'rounded-t',
  'rounded-b',
  'rounded-l',
  'rounded-r',
  'rounded-tl',
  'rounded-tr',
  'rounded-bl',
  'rounded-br',
];
const PADDING_SIGNALS = ['p-', 'px-', 'py-', 'pt-', 'pb-', 'pl-', 'pr-', 'gap-'];
const BACKGROUND_SIGNALS = ['bg-', 'background'];

interface SignalInfo {
  hasBorder: boolean;
  hasPadding: boolean;
  hasBackground: boolean;
  hasShadow: boolean;
  signalCount: number;
}

function analyzeSignals(className: string): SignalInfo {
  const classes = className.split(/\s+/).filter(Boolean);
  let signalCount = 0;
  let hasBorder = false;
  let hasPadding = false;
  let hasBackground = false;
  let hasShadow = false;

  for (const cls of classes) {
    const matchedCategories: Set<string> = new Set();

    if (BORDER_SIGNALS.some((s) => cls.startsWith(s))) {
      matchedCategories.add('border');
    }
    if (ROUNDED_SIGNALS.some((s) => cls === s || cls.startsWith(s + '-'))) {
      matchedCategories.add('border');
    }
    if (PADDING_SIGNALS.some((s) => cls.startsWith(s))) {
      matchedCategories.add('padding');
    }
    if (BACKGROUND_SIGNALS.some((s) => cls.startsWith(s))) {
      matchedCategories.add('background');
    }
    if (cls.startsWith('shadow') || cls === 'shadow') {
      matchedCategories.add('shadow');
      hasShadow = true;
    }

    if (matchedCategories.size > 0) {
      signalCount += matchedCategories.size;
      if (matchedCategories.has('border')) hasBorder = true;
      if (matchedCategories.has('padding')) hasPadding = true;
      if (matchedCategories.has('background')) hasBackground = true;
    }
  }

  return { hasBorder, hasPadding, hasBackground, hasShadow, signalCount };
}

function hasLayoutClass(className: string): boolean {
  const classes = className.split(/\s+/).filter(Boolean);
  return classes.some(
    (c) =>
      c.startsWith('flex') ||
      c.startsWith('grid') ||
      c.startsWith('inline-flex') ||
      c.startsWith('inline-grid'),
  );
}

function getClassNameFromAttributes(attributes: JsxAttribute[], sourceFile: Node): string | null {
  for (const attr of attributes) {
    if (attr.isKind(SyntaxKind.JsxAttribute)) {
      const name = attr.getNameNode().getText();
      if (name === 'className' || name === 'class') {
        const initializer = attr.getInitializer();
        if (!initializer) return null;
        const kind = initializer.getKind();
        if (kind !== SyntaxKind.StringLiteral && kind !== SyntaxKind.TemplateExpression) {
          return null;
        }
        const text = initializer.getText();
        return text.replace(/^['"`]|['"`]$/g, '');
      }
    }
  }
  return null;
}

const cardImportCache = new WeakMap<Node, boolean>();

function hasShadcnCardImport(sourceFile: Node): boolean {
  if (cardImportCache.has(sourceFile)) {
    return cardImportCache.get(sourceFile)!;
  }
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
  cardImportCache.set(sourceFile, hasCardImport);
  return hasCardImport;
}

export const preferShadcnCard: Rule = {
  id: PREFER_SHADCN_CARD_ID,
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

    const { hasBorder, hasPadding, hasBackground, hasShadow, signalCount } =
      analyzeSignals(className);
    const isLayout = hasLayoutClass(className);

    let distinctCategories = 0;
    if (hasBorder) distinctCategories++;
    if (hasPadding) distinctCategories++;
    if (hasBackground) distinctCategories++;

    if (isLayout) {
      if ((distinctCategories >= 3 && hasShadow) || (hasShadow && signalCount >= 4)) {
        return {
          file: '',
          line: 0,
          column: 0,
          rule: PREFER_SHADCN_CARD_ID,
          violation: 'Custom styled <div> detected. Use <Card> from shadcn/ui.',
          suggestion: 'Use <Card> from shadcn/ui.',
          element: 'div',
          replacement: 'Card',
          sourceLine: '',
          suggestedLine: '',
        };
      }
      return null;
    }

    if (distinctCategories >= 2) {
      if (hasShadow) {
        return {
          file: '',
          line: 0,
          column: 0,
          rule: PREFER_SHADCN_CARD_ID,
          violation: 'Custom styled <div> detected. Use <Card> from shadcn/ui.',
          suggestion: 'Use <Card> from shadcn/ui.',
          element: 'div',
          replacement: 'Card',
          sourceLine: '',
          suggestedLine: '',
        };
      }

      if (distinctCategories >= 3) {
        return {
          file: '',
          line: 0,
          column: 0,
          rule: PREFER_SHADCN_CARD_ID,
          violation: 'Custom styled <div> detected. Use <Card> from shadcn/ui.',
          suggestion: 'Use <Card> from shadcn/ui.',
          element: 'div',
          replacement: 'Card',
          sourceLine: '',
          suggestedLine: '',
        };
      }
    }

    return null;
  },
};
