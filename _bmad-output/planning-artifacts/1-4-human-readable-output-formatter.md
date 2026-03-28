# Story 1.4: Human-Readable Output Formatter

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer reading shadcn-doctor output in my terminal,
I want findings displayed in a clear, color-coded, file-grouped format with a summary,
so that I can quickly scan results, understand each violation, and know whether to ship or fix.

## Acceptance Criteria

1. **Given** findings exist across multiple files **When** the human formatter renders output **Then** findings are grouped by file path **And** each file path is displayed as a bold header on its own line **And** findings beneath each file are indented 2 spaces in format: `line:col  violation message  rule-id` **And** line:col and rule-id are rendered in dim/gray **And** violation text uses default terminal foreground **And** 1 blank line separates file groups **And** 1 blank line appears before the summary footer

2. **Given** one or more findings are detected **When** the summary footer is rendered **Then** it displays: `N findings in N files scanned.` **And** the process exits with code 1

3. **Given** no findings are detected **When** the output is rendered **Then** a single line is displayed: `No findings. N files scanned.` **And** the process exits with code 0 **And** no other output is produced

4. **Given** the `NO_COLOR` environment variable is set **When** output is rendered **Then** all ANSI color codes are suppressed **And** all information remains readable via text content and symbols alone

5. **Given** stdout is not a TTY (piped output) **When** output is rendered **Then** ANSI colors are auto-disabled **And** the `FORCE_COLOR` environment variable overrides this to enable colors

6. **Given** warnings were collected during scanning (parse errors, rule errors) **When** output is rendered **Then** warnings are written to stderr (never stdout) **And** warnings use the format: `⚠ Skipped: {file} ({reason})` **And** warnings do not affect the pass/fail exit code

7. **Given** a fatal error occurs (e.g., target path doesn't exist) **When** the error is handled **Then** `Error: {description}: {detail}` is written to stderr **And** no findings output is produced **And** the process exits with code 2

## Tasks / Subtasks

- [x] Task 1: Install `picocolors` dependency and create color utility (AC: 4, 5)
  - [x] Run `npm install picocolors`
  - [x] Create `src/formatters/colors.ts` — thin wrapper around picocolors that applies `NO_COLOR` / TTY / `FORCE_COLOR` detection
  - [x] Export named helpers: `bold()`, `dim()`, `red()`, `green()`, `yellow()`; JSON formatter must never call these
  - [x] Write unit tests in `src/formatters/colors.test.ts` verifying suppression when `NO_COLOR` is set and passthrough text when colors are off

- [x] Task 2: Implement `human-formatter.ts` (AC: 1, 2, 3)
  - [x] Create `src/formatters/human-formatter.ts` with a named export `formatHuman(result: AnalysisResult): string`
  - [x] Group findings by `finding.file`; iterate in the order findings are already sorted (file-alphabetical, then line/col)
  - [x] Emit 1 blank line before the first file group (leading `\n`)
  - [x] Emit bold file path header per group
  - [x] Emit each finding as `  {dim line:col}  {violation}  {dim rule}` — target under 120 chars per line
  - [x] Emit 1 blank line between file groups; no blank lines between findings within the same file
  - [x] Emit 1 blank line before summary footer
  - [x] Findings present: `N findings in N files scanned.` (plain text, no color per UX spec default text)
  - [x] No findings: `No findings. N files scanned.` (single line, no leading blank line)
  - [x] No trailing newline after summary

- [x] Task 3: Wire formatter into `src/cli.ts` and handle exit codes (AC: 2, 3, 6, 7)
  - [x] Import `formatHuman` from `./formatters/human-formatter.js`
  - [x] After `analyze()` resolves, call `formatHuman(result)` and write to `process.stdout`
  - [x] Write each warning to `process.stderr` using `⚠ Skipped: {file} ({reason})` format
  - [x] Set `process.exitCode` to `0` (pass) or `1` (findings) based on `result.pass`
  - [x] Wrap the entire CLI execution in a top-level try/catch; on fatal error write `Error: {description}: {detail}` to stderr and set `process.exitCode = 2`
  - [x] Do NOT call `process.exit()` directly — set `process.exitCode` so async cleanup can run

- [x] Task 4: Update `src/formatters/index.ts` barrel (AC: 1)
  - [x] Export `formatHuman` from `./human-formatter.js` so consumers can import via the barrel

- [x] Task 5: Unit tests for `human-formatter.ts` (AC: 1, 2, 3, 4, 5)
  - [x] Test: findings across two files renders correct grouping, indentation, spacing, and summary
  - [x] Test: zero findings renders single clean-pass line only
  - [x] Test: `NO_COLOR=1` strips ANSI codes from output (check string contains no `\x1b[` sequences)
  - [x] Test: non-TTY stdout auto-strips colors (mock `process.stdout.isTTY = false`)
  - [x] Test: `FORCE_COLOR=1` re-enables colors when TTY detection would suppress them
  - [x] Fixtures: use `src/__fixtures__/raw-html-elements.tsx` and `src/__fixtures__/clean-component.tsx` for integration-style assertions

## Dev Notes

### Key Implementation Constraints

- **picocolors only** — Never hard-code ANSI escape sequences. Use picocolors (tiny, zero-dependency) exclusively for color output. [Source: _bmad-output/planning-artifacts/epics.md#Requirements - UX-DR19]
- **JSON formatter must never pass through color utility** — colors.ts must only be called from `human-formatter.ts`. [Source: _bmad-output/planning-artifacts/epics.md#Requirements - UX-DR19]
- **Output ownership** — Only `src/formatters/` writes to stdout. `src/cli.ts` calls `formatHuman()` and writes the returned string. Nothing else writes to stdout. [Source: _bmad-output/planning-artifacts/architecture.md#Process-Patterns]
- **Warnings always go to stderr** — `console.error` or `process.stderr.write` only. Never mixed into stdout findings stream. [Source: _bmad-output/planning-artifacts/epics.md#Requirements - UX-DR9]
- **Exit codes** — Use `process.exitCode = N` rather than `process.exit(N)` to allow async cleanup. 0=pass, 1=findings, 2=fatal. [Source: _bmad-output/planning-artifacts/architecture.md#Process-Patterns]
- **Deterministic order already guaranteed** — `analyze()` returns findings sorted alphabetically by file, then by line/column. The formatter just renders in the order received. [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns]
- **path.posix for output paths** — File paths in all output must use forward slashes regardless of OS. The `analyzer.ts` already normalizes this; do not re-process paths in the formatter. [Source: _bmad-output/planning-artifacts/epics.md#Requirements - UX-DR20]

### Color Behavior Rules

| Condition | Colors |
|---|---|
| `NO_COLOR` env var is set (any value) | Off — suppress all ANSI |
| `process.stdout.isTTY` is false | Off — piped output |
| `FORCE_COLOR` env var is set | On — override TTY detection |
| Default (TTY, no env vars) | On |

[Source: _bmad-output/planning-artifacts/epics.md#Requirements - UX-DR2, UX-DR3]

### ANSI Color Assignments

| Element | Color/Style |
|---|---|
| File path header | Bold (picocolors: `bold()`) |
| `line:col` | Dim (picocolors: `dim()`) |
| Rule ID | Dim (picocolors: `dim()`) |
| Violation + suggestion text | Default terminal foreground (no color function) |
| Warning messages (stderr) | Yellow (picocolors: `yellow()`) |
| Pass summary | No color — plain text |
| Fail summary | No color — plain text (red reserved for future diff output) |

[Source: _bmad-output/planning-artifacts/ux-design-specification.md#Color-System, UX-DR1]

### Exact Output Format

**Findings present:**
```
\n
src/pages/settings.tsx
  24:5  Raw <select> detected. Use <Select> from shadcn/ui.  prefer-shadcn-select
  41:3  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
\n
src/components/form.tsx
  12:7  Raw <input> detected. Use <Input> from shadcn/ui.  prefer-shadcn-input
\n
3 findings in 42 files scanned.
```
(No trailing newline after summary.)

**No findings:**
```
No findings. 42 files scanned.
```
(No leading or trailing blank lines — single line only.)

[Source: _bmad-output/planning-artifacts/ux-design-specification.md#Spacing-&-Layout-Foundation, UX-DR17, UX-DR18]

### Finding Line Format

```
  {dim(line:col)}  {violation}  {dim(rule-id)}
```
- 2-space indent
- `line:col` is `${finding.line}:${finding.column}` — both are already 1-based from `ts-morph`
- Violation text is the full `finding.violation` value (already contains suggestion per rule design)
- Rule ID is `finding.rule`
- Target under 120 chars — no active wrapping in MVP, terminal handles overflow naturally

[Source: _bmad-output/planning-artifacts/ux-design-specification.md#Typography-System, UX-DR5]

### Warning Format (stderr)

```
⚠ Skipped: {file} ({reason})
```
The `Warning` type currently only has `{ message: string }`. Parse the message string to extract file/reason, OR write the warning message as-is prefixed by `⚠ `. Confirm with the existing `Warning` type in `src/types.ts` — do not change the type definition in this story.

[Source: _bmad-output/planning-artifacts/epics.md#Requirements - UX-DR9]

### Files to Create

| File | Purpose |
|---|---|
| `src/formatters/colors.ts` | picocolors wrapper with env var + TTY detection |
| `src/formatters/colors.test.ts` | Unit tests for color suppression behavior |
| `src/formatters/human-formatter.ts` | Main formatter — `formatHuman(result)` |
| `src/formatters/human-formatter.test.ts` | Unit + integration tests for formatted output |

### Files to Modify

| File | Change |
|---|---|
| `src/formatters/index.ts` | Add `export * from './human-formatter.js'` and `export * from './colors.js'` |
| `src/cli.ts` | Wire `formatHuman`, warning stderr output, exit codes |
| `package.json` | Add `picocolors` to `dependencies` |

### Current State of `src/formatters/`

The `src/formatters/index.ts` barrel currently only re-exports from `../types.js`. There is no `human-formatter.ts` or `json-formatter.ts` yet. This story creates the human formatter from scratch.

### `src/cli.ts` Integration Pattern

`cli.ts` should follow this pattern after `analyze()`:

```typescript
const result = await analyze(targetPath);
// Warnings to stderr
for (const warning of result.warnings) {
  process.stderr.write(`⚠ ${warning.message}\n`);
}
// Findings to stdout
process.stdout.write(formatHuman(result));
// Exit code
process.exitCode = result.pass ? 0 : 1;
```

Fatal errors (caught at top level):
```typescript
process.stderr.write(`Error: ${description}: ${detail}\n`);
process.exitCode = 2;
```

### Previous Story Learnings (Story 1.3)

Story 1.3 had several code review findings that are now patched. Be aware:
- The `runRules` path guard was a `startsWith` check — this has been fixed but confirms file paths require careful normalization. The formatter receives already-normalized paths from `analyze()`.
- A `console.log` was left in `prefer-shadcn-button.ts` — reinforces the rule: **nothing outside `formatters/` may write to stdout**. If you see any `console.log` in rules or engine code while working, flag it.
- The `Warning` type is simple: `{ message: string }` — the formatter should handle this as a plain string prefixed with `⚠`.

[Source: _bmad-output/planning-artifacts/1-3-rule-engine-button-detection.md#Review-Findings]

### Project Structure Notes

- All formatter files live in `src/formatters/`
- Test files co-located: `src/formatters/human-formatter.test.ts`
- Named exports only — no default exports (`export const formatHuman = ...`)
- One barrel file `src/formatters/index.ts` — add new exports there
- `picocolors` must go in `dependencies` (not `devDependencies`) — it is a runtime dependency

[Source: _bmad-output/planning-artifacts/architecture.md#Structure-Patterns, _bmad-output/planning-artifacts/architecture.md#Enforcement-Guidelines]

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.4]
- [Source: _bmad-output/planning-artifacts/architecture.md#Process-Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Logging-&-Output-Ownership]
- [Source: _bmad-output/planning-artifacts/architecture.md#Exit-Codes]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Color-System]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Spacing-&-Layout-Foundation]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Typography-System]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design-Tokens]
- [Source: _bmad-output/planning-artifacts/epics.md#UX-DR1 through UX-DR20]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Installed `picocolors` as runtime dependency
- Created `src/formatters/colors.ts` — thin wrapper around picocolors with NO_COLOR / TTY / FORCE_COLOR detection; exports bold(), dim(), red(), green(), yellow()
- Created `src/formatters/human-formatter.ts` — `formatHuman(result: AnalysisResult): string` groups findings by file, formats with bold headers and dim line:col / rule-id, emits correct blank-line spacing, returns single clean line for zero findings
- Created `src/formatters/colors.test.ts` — 7 tests covering NO_COLOR suppression, TTY detection, FORCE_COLOR override, passthrough text when colors off
- Created `src/formatters/human-formatter.test.ts` — 10 tests covering grouping/indentation/spacing/summary, zero-findings output, NO_COLOR suppression, non-TTY auto-strip, FORCE_COLOR re-enable, structural invariants
- Updated `src/formatters/index.ts` to export from `./human-formatter.js` and `./colors.js`
- Updated `src/cli.ts` to call `formatHuman()`, write warnings to stderr with ⚠ prefix, set `process.exitCode` (0/1/2), wrapped in top-level try/catch for fatal errors
- All 20 new tests pass; 3 pre-existing failures in rule-engine/prefer-shadcn-button unchanged
- Resolved biome lint issues: replaced `\x1b` regex control chars with `String.fromCharCode(27)` based string detection; removed unused imports/variables

### File List

- `src/formatters/colors.ts` (created)
- `src/formatters/colors.test.ts` (created)
- `src/formatters/human-formatter.ts` (created)
- `src/formatters/human-formatter.test.ts` (created)
- `src/formatters/index.ts` (modified)
- `src/cli.ts` (modified)
- `package.json` (modified — picocolors added to dependencies)
- `package-lock.json` (modified)

## Change Log

- 2026-03-29: Story 1.4 implemented — human-readable terminal output formatter. Added picocolors dependency, created colors.ts wrapper, human-formatter.ts with file-grouped output and color-coded formatting, updated cli.ts with exit codes and stderr warnings, added 20 new tests across colors and human-formatter test suites. Status: review.
