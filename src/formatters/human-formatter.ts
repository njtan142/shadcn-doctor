import type { AnalysisResult, Finding } from '../types.js';
import { bold, dim } from './colors.js';

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

    // Each finding line
    for (const finding of fileFindings) {
      parts.push(formatFindingLine(finding));
    }
  }

  // Blank line before summary footer
  parts.push('');

  // Summary line
  parts.push(`${findings.length} findings in ${summary.filesScanned} files scanned.`);

  return parts.join('\n');
}
