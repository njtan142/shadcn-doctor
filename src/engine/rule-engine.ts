import path from 'node:path';
import type { Node, SourceFile, SyntaxKind } from 'ts-morph';
import { formatSuggestedLine, resolveConfig } from '../config/index.js';
import type { Finding, Rule, Warning } from '../types.js';

function generateSuggestedLine(
  replacement: string,
  sourceLine: string,
  config: ReturnType<typeof resolveConfig>,
): string {
  return formatSuggestedLine(sourceLine, replacement, config);
}

export function runRules(
  sourceFile: SourceFile,
  rules: Rule[],
  rootPath: string,
): { findings: Finding[]; warnings: Warning[] } {
  const findings: Finding[] = [];
  const warnings: Warning[] = [];
  const config = resolveConfig();

  const normalizedRootForward = rootPath.replace(/\\/g, '/');
  const normalizedRoot = normalizedRootForward.endsWith('/')
    ? normalizedRootForward
    : `${normalizedRootForward}/`;
  const absoluteFilePath = decodeURIComponent(sourceFile.getFilePath());
  const normalizedFilePath = absoluteFilePath.replace(/\\/g, '/');
  const isInsideRoot =
    normalizedFilePath.startsWith(normalizedRoot) || normalizedFilePath === normalizedRootForward;
  if (!isInsideRoot) {
    const warning: Warning = {
      message: `File "${absoluteFilePath}" is outside rootPath "${rootPath}" — skipped`,
    };
    return { findings: [], warnings: [warning] };
  }

  const filePath = path
    .relative(rootPath, sourceFile.getFilePath())
    .split(path.sep)
    .join(path.posix.sep);

  const rulesByKind = new Map<SyntaxKind, Rule[]>();
  for (const rule of rules) {
    for (const kind of rule.nodeTypes) {
      if (!rulesByKind.has(kind)) {
        rulesByKind.set(kind, []);
      }
      rulesByKind.get(kind)?.push(rule);
    }
  }

  sourceFile.forEachDescendant((node: Node) => {
    const kind = node.getKind();
    const rulesToRun = rulesByKind.get(kind);

    if (rulesToRun) {
      for (const rule of rulesToRun) {
        try {
          const finding = rule.check(node);
          if (finding) {
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
            const suggestedLine = generateSuggestedLine(finding.replacement, sourceLine, config);

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
