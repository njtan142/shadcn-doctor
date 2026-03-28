import path from 'node:path';
import type { Node, SourceFile, SyntaxKind } from 'ts-morph';
import type { Finding, Rule, Warning } from '../types.js';

function extractEventHandlers(sourceLine: string): string {
  const eventHandlerRegex = /((?:on\w+)\s*=\s*\{(?:[^{}]|\{[^{}]*\})*\})/g;
  const handlers: string[] = [];
  let match;
  while ((match = eventHandlerRegex.exec(sourceLine)) !== null) {
    handlers.push(match[1]);
  }
  return handlers.join(' ');
}

function generateSuggestedLine(replacement: string, sourceLine: string): string {
  const elementNameRegex = /^<(\w+)/;
  const elementMatch = sourceLine.match(elementNameRegex);
  if (!elementMatch) {
    return `<${replacement}>`;
  }
  const originalAttrs = sourceLine.slice(elementMatch[0].length);
  return `<${replacement}${originalAttrs}>`;
}

export function runRules(
  sourceFile: SourceFile,
  rules: Rule[],
  rootPath: string,
): { findings: Finding[]; warnings: Warning[] } {
  const findings: Finding[] = [];
  const warnings: Warning[] = [];

  const normalizedRootForward = rootPath.replace(/\\/g, '/');
  const normalizedRoot = normalizedRootForward.endsWith('/')
    ? normalizedRootForward
    : normalizedRootForward + '/';
  const absoluteFilePath = decodeURIComponent(sourceFile.getFilePath());
  const normalizedFilePath = absoluteFilePath.replace(/\\/g, '/');
  if (
    !normalizedFilePath.startsWith(normalizedRoot) &&
    normalizedFilePath !== normalizedRootForward
  ) {
    const warning: Warning = {
      message: `File "${absoluteFilePath}" is outside rootPath "${rootPath}" — skipped`,
    };
    return { findings: [], warnings: [warning] };
  }

  const filePath = path
    .relative(rootPath, sourceFile.getFilePath())
    .split(path.sep)
    .join(path.posix.sep);

  // Group rules by the SyntaxKind they visit for efficiency
  const rulesByKind = new Map<SyntaxKind, Rule[]>();
  for (const rule of rules) {
    for (const kind of rule.nodeTypes) {
      if (!rulesByKind.has(kind)) {
        rulesByKind.set(kind, []);
      }
      rulesByKind.get(kind)!.push(rule);
    }
  }

  sourceFile.forEachDescendant((node) => {
    const kind = node.getKind();
    const rulesToRun = rulesByKind.get(kind);

    if (rulesToRun) {
      for (const rule of rulesToRun) {
        try {
          const finding = rule.check(node);
          if (finding) {
            // Ensure the finding has correct file and location info
            const { line, column } = sourceFile.getLineAndColumnAtPos(node.getStart());
            const fullText = sourceFile.getFullText();
            const pos = node.getStart();
            let lineStart = pos;
            if (pos > 0) {
              while (lineStart > 0 && fullText[lineStart - 1] !== '\n') {
                lineStart--;
              }
            }
            let lineEnd = pos;
            while (lineEnd < fullText.length && fullText[lineEnd] !== '\n') {
              lineEnd++;
            }
            const sourceLine = fullText.slice(lineStart, lineEnd);
            const suggestedLine = generateSuggestedLine(finding.replacement, sourceLine);

            findings.push({
              ...finding,
              file: filePath,
              line,
              column,
              sourceLine,
              suggestedLine,
            });
          }
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          warnings.push({
            message: `Rule "${rule.id}" failed on file "${filePath}" at line ${node.getStartLineNumber()}: ${msg}`,
          });
        }
      }
    }
  });

  return { findings, warnings };
}
