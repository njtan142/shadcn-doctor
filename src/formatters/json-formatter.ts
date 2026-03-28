import type { AnalysisResult } from '../types.js';

export function formatJson(result: AnalysisResult): string {
  const output = {
    pass: result.pass,
    summary: result.summary,
    findings: result.findings,
    warnings: result.warnings.map((w) => w.message),
  };
  return JSON.stringify(output, null, 2);
}
