# Story 2.1: JSON Output Formatter

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an AI agent developer,
I want shadcn-doctor to produce structured JSON output via a `--format json` flag,
so that my AI coding agent can parse findings programmatically and apply fixes without human interpretation.

## Acceptance Criteria

1. **Given** the user runs `npx shadcn-doctor [path] --format json` **When** findings are detected **Then** stdout contains valid JSON matching the architecture schema with `"pass": false`, `"summary": { "total": <number>, "filesScanned": <number> }`, `"findings": [{ "file", "line", "column", "rule", "violation", "suggestion", "element", "replacement" }]`, and `"warnings": [...]` **And** the process exits with code 1

2. **Given** the user runs `npx shadcn-doctor [path] --format json` **When** no findings are detected **Then** stdout contains valid JSON with `"pass": true`, `"summary": { "total": 0, "filesScanned": <number> }`, `"findings": []`, and `"warnings": []` **And** the process exits with code 0

3. **Given** JSON output is produced **When** the output is inspected **Then** no ANSI color codes are present in the JSON regardless of TTY status, `NO_COLOR`, or `FORCE_COLOR` settings

4. **Given** warnings were collected during scanning (parse errors, rule errors) **When** JSON output is produced **Then** warnings appear in the `"warnings"` array as string messages **And** warnings are also written to stderr in human-readable format

5. **Given** no `--format` flag is provided **When** the tool runs **Then** the default human-readable output is produced (not JSON)

6. **Given** the `--format` flag is provided with an unsupported value **When** the CLI processes it **Then** an error message is displayed listing valid format options **And** the process exits with code 2

## Tasks / Subtasks

- [ ] Task 1: Create `src/formatters/json-formatter.ts` (AC: 1, 2, 3)
  - [ ] Implement `formatJson(result: AnalysisResult): string` as a named export
  - [ ] Return `JSON.stringify(output, null, 2)` where `output` matches the architecture schema exactly
  - [ ] Map `result.warnings` (array of `Warning` objects) to an array of plain strings via `warning.message`
  - [ ] Never import or call `colors.ts` — JSON formatter must be color-free by design
  - [ ] Write unit tests in `src/formatters/json-formatter.test.ts`

- [ ] Task 2: Update `src/formatters/index.ts` barrel (AC: 1)
  - [ ] Add `export * from './json-formatter.js'` so `formatJson` is importable via the barrel

- [ ] Task 3: Wire `--format json` into `src/cli.ts` (AC: 1, 2, 3, 4, 5, 6)
  - [ ] Import `formatJson` from `./formatters/json-formatter.js`
  - [ ] In `run(targetPath, format)`, branch on `format`:
    - `'json'` → call `formatJson(result)`, write to stdout, write warnings to stderr
    - `'human'` (default) → existing `formatHuman(result)` path unchanged
  - [ ] Rename `_format` parameter to `format` (the `_` prefix stub is no longer needed)
  - [ ] Confirm `.choices(['human', 'json'])` is already enforced in `createProgram()` — invalid values handled by Commander at parse time with exit code 2 (already implemented in Story 1.6)

- [ ] Task 4: Write unit tests for `json-formatter.ts` (AC: 1, 2, 3, 4)
  - [ ] Test: findings present → valid JSON string, `pass: false`, correct summary counts, all finding fields present
  - [ ] Test: no findings → valid JSON string, `pass: true`, `total: 0`, `findings: []`, `warnings: []`
  - [ ] Test: warnings in result → `warnings` array contains string messages (not objects)
  - [ ] Test: output contains no ANSI escape sequences (search for `\x1b[` or `String.fromCharCode(27)` pattern)
  - [ ] Test: JSON is parseable (verify `JSON.parse(formatJson(result))` does not throw)
  - [ ] Test: all Finding fields appear in each findings entry (`file`, `line`, `column`, `rule`, `violation`, `suggestion`, `element`, `replacement`)

- [ ] Task 5: Write integration tests for `--format json` CLI path (AC: 1, 2, 5)
  - [ ] Test: `run(fixturesDir, 'json')` → stdout JSON parseable and `pass` matches whether violations exist
  - [ ] Test: `run(fixturesDir, 'human')` → stdout is NOT JSON (verify does not start with `{`)
  - [ ] Use existing fixture files: `src/__fixtures__/raw-html-elements.tsx` (violations) and `src/__fixtures__/clean-component.tsx` (no violations)

## Dev Notes

### JSON Output Schema (Exact)

The architecture mandates this exact schema. Do not deviate:

```json
{
  "pass": false,
  "summary": { "total": 3, "filesScanned": 42 },
  "findings": [
    {
      "file": "src/pages/settings.tsx",
      "line": 24,
      "column": 5,
      "rule": "prefer-shadcn-select",
      "violation": "Raw <select> detected. Use <Select> from shadcn/ui.",
      "suggestion": "Use <Select> from shadcn/ui.",
      "element": "select",
      "replacement": "Select"
    }
  ],
  "warnings": []
}
```

Note: `violation` and `suggestion` are both present as separate fields in the `Finding` type. Check `src/types.ts` — the `Finding` type has both `violation: string` and `suggestion: string`. The JSON formatter maps `result.findings` directly (all fields are already on the `Finding` type). No field transformation needed except `warnings`.

[Source: _bmad-output/planning-artifacts/architecture.md#JSON-Output-Schema]

### `formatJson` Implementation Pattern

```typescript
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
```

Key points:
- `result.findings` can be spread directly — all fields on `Finding` match the schema
- `result.warnings` must be mapped: `Warning` is `{ message: string }`, but JSON schema expects `string[]`
- `JSON.stringify(output, null, 2)` produces pretty-printed JSON (2-space indent)
- No trailing newline needed — `process.stdout.write(formatJson(result))` in `cli.ts` handles output

[Source: _bmad-output/planning-artifacts/epics.md#Story-2.1, src/types.ts]

### Critical: No Colors in JSON Formatter

The JSON formatter **must never import `colors.ts`** or call picocolors. This is an architectural boundary:

> "JSON formatter must never pass through color utility" — UX-DR19

If ANSI codes appear in JSON output, it will break machine consumption regardless of `NO_COLOR` or TTY state. The formatter itself must be stateless and color-free.

[Source: _bmad-output/planning-artifacts/epics.md#Requirements-UX-DR19]

### `cli.ts` Changes Required

The `run()` function currently has `_format` (underscore prefix = unused stub). This story activates the parameter:

**Current `src/cli.ts` (lines 10–30):**
```typescript
export async function run(targetPath = '.', _format = 'human') {
  try {
    const result = await analyze(targetPath);
    for (const warning of result.warnings) {
      process.stderr.write(`\u26a0 ${warning.message}\n`);
    }
    process.stdout.write(formatHuman(result));
    process.exitCode = result.pass ? 0 : 1;
  } catch (err: unknown) { ... }
}
```

**Required change:**
```typescript
import { formatJson } from './formatters/json-formatter.js';

export async function run(targetPath = '.', format = 'human') {
  try {
    const result = await analyze(targetPath);
    for (const warning of result.warnings) {
      process.stderr.write(`\u26a0 ${warning.message}\n`);
    }
    if (format === 'json') {
      process.stdout.write(formatJson(result));
    } else {
      process.stdout.write(formatHuman(result));
    }
    process.exitCode = result.pass ? 0 : 1;
  } catch (err: unknown) { ... }
}
```

Note: Warnings always go to stderr regardless of format (both human and JSON modes write warnings to stderr). This is already the pattern in `cli.ts` — do not change the warning output behavior.

[Source: src/cli.ts lines 10-30, _bmad-output/planning-artifacts/epics.md#Story-2.1-AC4]

### `--format` Validation Already Implemented

Story 1.6 already wired Commander with `.choices(['human', 'json'])` in `createProgram()`. Invalid `--format` values are rejected at Commander parse time, before `run()` is called, with a Commander-generated error and exit code 2. AC #6 is already satisfied — **do not re-implement format validation** in `run()` or `formatJson`.

Verify by reading `src/cli.ts` `createProgram()` — it has:
```typescript
new Option('--format <format>', 'Output format: human or json')
  .default('human')
  .choices(['human', 'json'])
```

[Source: src/cli.ts lines 38-43]

### Biome Lint: Remove `_` Prefix on `format` Parameter

The `_format` parameter in `run()` was named with an underscore because Biome requires unused parameters to start with `_`. Now that `format` is actively used, **remove the underscore** from both the function signature and the call site. Biome will fail if a used parameter retains the `_` prefix.

[Source: _bmad-output/implementation-artifacts/spec-code-review-fixes.md, src/cli.ts]

### Output Path for File Paths in JSON

File paths in JSON findings already arrive normalized from `analyze()` via `rule-engine.ts`:
- `path.relative(rootPath, file).split(path.sep).join(path.posix.sep)` — forward slashes, relative to scan root

The JSON formatter must pass these paths through unchanged. Do not call `path.posix` or any path normalization inside `formatJson` — it is already done upstream.

[Source: _bmad-output/planning-artifacts/epics.md#Requirements-UX-DR20, src/engine/rule-engine.ts line 24]

### Warnings: stderr AND JSON Array

When `--format json` is used:
1. **stdout** — JSON output includes `"warnings": ["message text", ...]` (string array)
2. **stderr** — each warning is still written as `⚠ {message}` (same as human format)

This dual-output is mandated by AC #4. The `cli.ts` loop that writes warnings to stderr runs before the formatter call, so both outputs are always produced.

[Source: _bmad-output/planning-artifacts/epics.md#Story-2.1-AC4]

### Files to Create

| File | Purpose |
|---|---|
| `src/formatters/json-formatter.ts` | `formatJson(result: AnalysisResult): string` — pure, color-free JSON serializer |
| `src/formatters/json-formatter.test.ts` | Unit tests for JSON output correctness |

### Files to Modify

| File | Change |
|---|---|
| `src/formatters/index.ts` | Add `export * from './json-formatter.js'` |
| `src/cli.ts` | Rename `_format` → `format`, import `formatJson`, add `format === 'json'` branch |

### Files That Must NOT Change

| File | Reason |
|---|---|
| `src/types.ts` | `Finding`, `AnalysisResult`, `Warning` types are complete — no new fields needed |
| `src/analyzer.ts` | Analysis pipeline unchanged — `formatJson` receives the same `AnalysisResult` |
| `src/engine/rule-engine.ts` | Rule engine and finding production unchanged |
| `src/rules/` | No rule changes — JSON formatter consumes existing `Finding` fields |
| `src/formatters/colors.ts` | Must not be imported by the JSON formatter |
| `src/formatters/human-formatter.ts` | No changes — human path is unchanged |
| `bin/shadcn-doctor.js` | Still calls `run()` with no args; Commander handles `process.argv` |

### Deferred Issues from Previous Stories (Do Not Fix Here)

From `_bmad-output/implementation-artifacts/deferred-work.md`:
1. `absoluteFilePath` from ts-morph may contain URI-encoded characters causing the `startsWith` path guard in `rule-engine.ts` to silently skip files — **known issue, do not fix in this story**
2. Integration test `src/rules/all-rules-integration.test.ts:28` may fail in CI due to `projectRoot` resolution — **known issue, do not fix in this story**
3. Single non-TS file passed as explicit path produces "No TypeScript files found" — **deferred, do not fix here**
4. TOCTOU race in `analyzer.ts` + `scanner.ts` — **deferred, pre-existing concern**

From `src/cli.ts` Story 1.6 open review findings (unpatched):
- `fs.stat` catch may swallow non-ENOENT errors — known, deferred
- AC #3 test in `cli.test.ts` does not exercise the actual default `.` path — known, deferred
- `buildProgram()` in test file is a manual copy — known, deferred

Do not spend time on these. Keep scope to JSON formatter only.

### Testing Approach

Use Vitest with `vi.spyOn` on `process.stdout.write` to capture output in CLI integration tests. For unit tests on `formatJson`, call the function directly with constructed `AnalysisResult` objects.

```typescript
// Unit test example
import { formatJson } from './json-formatter.js';
import type { AnalysisResult } from '../types.js';

const result: AnalysisResult = {
  pass: false,
  summary: { total: 1, filesScanned: 5 },
  findings: [{
    file: 'src/foo.tsx',
    line: 10,
    column: 3,
    rule: 'prefer-shadcn-button',
    violation: 'Raw <button> detected. Use <Button> from shadcn/ui.',
    suggestion: 'Use <Button> from shadcn/ui.',
    element: 'button',
    replacement: 'Button',
  }],
  warnings: [{ message: 'Skipped: bad.tsx (parse error)' }],
};

it('produces parseable JSON with correct shape', () => {
  const output = formatJson(result);
  const parsed = JSON.parse(output); // must not throw
  expect(parsed.pass).toBe(false);
  expect(parsed.findings).toHaveLength(1);
  expect(parsed.warnings).toEqual(['Skipped: bad.tsx (parse error)']); // strings, not objects
});
```

Fixture files for integration tests:
- `src/__fixtures__/raw-html-elements.tsx` — produces findings (violations present)
- `src/__fixtures__/clean-component.tsx` — produces no findings (clean pass)

### Project Structure Notes

- All formatter files in `src/formatters/` — do not place `json-formatter.ts` anywhere else
- Co-located test: `src/formatters/json-formatter.test.ts`
- Named exports only — `export function formatJson(...)`, no default export
- Barrel: `src/formatters/index.ts` must export from `./json-formatter.js` (ESM `.js` extension required)

[Source: _bmad-output/planning-artifacts/architecture.md#Structure-Patterns, _bmad-output/planning-artifacts/architecture.md#Module-Organization]

### References

- Story requirements: [Source: _bmad-output/planning-artifacts/epics.md#Story-2.1-JSON-Output-Formatter]
- Architecture JSON schema: [Source: _bmad-output/planning-artifacts/architecture.md#JSON-Output-Schema]
- Architecture project structure: [Source: _bmad-output/planning-artifacts/architecture.md#Project-Structure]
- Architecture boundary rules: [Source: _bmad-output/planning-artifacts/architecture.md#Architectural-Boundaries]
- UX color rules: [Source: _bmad-output/planning-artifacts/epics.md#Requirements-UX-DR19]
- UX path formatting: [Source: _bmad-output/planning-artifacts/epics.md#Requirements-UX-DR20]
- FR15: `--format` flag: [Source: _bmad-output/planning-artifacts/epics.md#Functional-Requirements]
- FR19: Machine-readable JSON output: [Source: _bmad-output/planning-artifacts/epics.md#Functional-Requirements]
- FR23: JSON schema for AI agent consumption: [Source: _bmad-output/planning-artifacts/epics.md#Functional-Requirements]
- FR25: Fix-and-rerun loop support: [Source: _bmad-output/planning-artifacts/epics.md#Functional-Requirements]
- Current `src/cli.ts`: `_format` stub, `createProgram()` with `.choices()`: [Source: src/cli.ts]
- Current `src/formatters/index.ts`: barrel, currently exports `../types.js` and `./human-formatter.js`: [Source: src/formatters/index.ts]
- Previous story human formatter pattern: [Source: _bmad-output/planning-artifacts/1-4-human-readable-output-formatter.md]
- Deferred issues: [Source: _bmad-output/implementation-artifacts/deferred-work.md]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
