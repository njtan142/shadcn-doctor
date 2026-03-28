import type { Node, SyntaxKind } from 'ts-morph';

export type Finding = {
  file: string; // Relative path from scan root
  line: number; // 1-based line number
  column: number; // 1-based column number
  rule: string; // Rule ID: "prefer-shadcn-button"
  violation: string; // Human-readable: "Raw <button> element detected"
  suggestion: string; // Human-readable: "Use <Button> from shadcn/ui"
  element: string; // The detected element: "button"
  replacement: string; // The shadcn/ui component: "Button"
  sourceLine: string; // The raw source code line
  suggestedLine: string; // The replacement suggestion line
};

export interface Rule {
  id: string; // "prefer-shadcn-button"
  description: string; // Human-readable: "Detects raw <button> elements..."
  nodeTypes: SyntaxKind[]; // AST node types this rule visits
  check: (node: Node) => Finding | null;
}

export type AnalysisResult = {
  pass: boolean;
  summary: {
    total: number;
    filesScanned: number;
  };
  findings: Finding[];
  warnings: Warning[];
};

export type Warning = {
  message: string;
};
