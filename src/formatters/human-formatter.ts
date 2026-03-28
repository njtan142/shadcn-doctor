import type { AnalysisResult, Finding } from '../types.js';
import { bold, dim, green, red } from './colors.js';

/**
 * Groups findings by file path, preserving the already-sorted order from analyze().
 */
function groupByFile(findings: Finding[]): Map<string, Finding[]> {
  const groups = new Map<string, Finding[]>();
  for (const finding of findings) {
    const existing = groups.get(finding.file);
    if (existing) {
      existing.push(finding);
    } else {
      groups.set(finding.file, [finding]);
    }
  }
  return groups;
}

/**
 * Formats a single finding line.
 * Format: `  {dim(line:col)}  {violation}  {dim(rule-id)}`
 */
function formatFindingLine(finding: Finding): string {
  const lineCol = dim(`${finding.line}:${finding.column}`);
  const rule = dim(finding.rule);
  return `  ${lineCol}  ${finding.violation}  ${rule}`;
}

/**
 * Formats diff lines for a finding:
 * - Red line with `-` prefix showing source line
 * - Green line with `+` prefix showing suggested line
 */
function formatDiffLines(finding: Finding): [string, string] {
  if (!finding.sourceLine || !finding.suggestedLine) {
    return ['', ''];
  }
  const redLine = red(`- ${finding.sourceLine}`);
  const greenLine = green(`+ ${finding.suggestedLine}`);
  return [redLine, greenLine];
}

/**
 * Formats analysis results for human-readable terminal output.
 * No trailing newline is appended after the summary line.
 */
export function formatHuman(result: AnalysisResult): string {
  const { findings, summary } = result;

  // No findings — single clean line, no leading blank line
  if (findings.length === 0) {
    return `No findings. ${summary.filesScanned} files scanned.`;
  }

  const groups = groupByFile(findings);
  const parts: string[] = [];

  // Leading blank line before first file group
  parts.push('');

  let firstGroup = true;
  for (const [filePath, fileFindings] of groups) {
    // Blank line between file groups (not before the first one, which already has leading \n)
    if (!firstGroup) {
      parts.push('');
    }
    firstGroup = false;

    // Bold file path header
    parts.push(bold(filePath));

    // Each finding with its diff lines
    for (const finding of fileFindings) {
      parts.push(formatFindingLine(finding));
      const [redLine, greenLine] = formatDiffLines(finding);
      parts.push(redLine);
      parts.push(greenLine);
      // Blank line after each finding block
      parts.push('');
    }
  }

  // Remove the last extra blank line before summary
  if (parts.length > 0 && parts[parts.length - 1] === '') {
    parts.pop();
  }

  // Summary line
  parts.push(`${summary.total} findings in ${summary.filesScanned} files scanned.`);

  return parts.join('\n');
}
