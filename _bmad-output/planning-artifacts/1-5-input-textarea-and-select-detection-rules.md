# Story 1.5: Input, Textarea, and Select Detection Rules

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer using shadcn-doctor,
I want the tool to detect raw `<input>`, `<textarea>`, and `<select>` elements and suggest their shadcn/ui equivalents,
so that the four most commonly misused form elements are covered by the analysis.

## Acceptance Criteria

1. **Given** a TSX file containing a raw `<input>` JSX element **When** the rule engine processes the file **Then** a finding is produced with rule ID `prefer-shadcn-input`, violation "Raw <input> detected. Use <Input> from shadcn/ui.", element `input`, replacement `Input`

2. **Given** a TSX file containing a raw `<textarea>` JSX element **When** the rule engine processes the file **Then** a finding is produced with rule ID `prefer-shadcn-textarea`, violation "Raw <textarea> detected. Use <Textarea> from shadcn/ui.", element `textarea`, replacement `Textarea`

3. **Given** a TSX file containing a raw `<select>` JSX element **When** the rule engine processes the file **Then** a finding is produced with rule ID `prefer-shadcn-select`, violation "Raw <select> detected. Use <Select> from shadcn/ui.", element `select`, replacement `Select`

4. **Given** a TSX file using shadcn/ui `<Input>`, `<Textarea>`, or `<Select>` components **When** the rule engine processes the file **Then** no findings are produced for those components

5. **Given** a TSX file with a mix of raw HTML elements and shadcn/ui components **When** the rule engine processes the file **Then** only the raw HTML elements produce findings **And** the shadcn/ui components are not flagged

6. **Given** all four initial rules (button, input, textarea, select) are registered **When** a file with all four raw elements is scanned **Then** four separate findings are produced, one per element, in line-number order

## Tasks / Subtasks

- [x] Task 1: Create `prefer-shadcn-input` rule (AC: 1, 4, 5)
  - [x] Create `src/rules/prefer-shadcn-input.ts` following the exact same structure as `prefer-shadcn-button.ts`
  - [x] Detect `JsxOpeningElement` and `JsxSelfClosingElement` with tag name `input` (case-sensitive, lowercase only)
  - [x] Return finding with: rule `prefer-shadcn-input`, violation `"Raw <input> detected. Use <Input> from shadcn/ui."`, suggestion `"Use <Input> from shadcn/ui."`, element `input`, replacement `Input`
  - [x] Use `.trim()` on tag name (matches existing pattern in prefer-shadcn-button.ts)
  - [x] Leave `file`, `line`, `column` as empty/0 — engine fills these in

- [x] Task 2: Create `prefer-shadcn-textarea` rule (AC: 2, 4, 5)
  - [x] Create `src/rules/prefer-shadcn-textarea.ts` following the same structure
  - [x] Detect `JsxOpeningElement` and `JsxSelfClosingElement` with tag name `textarea`
  - [x] Return finding with: rule `prefer-shadcn-textarea`, violation `"Raw <textarea> detected. Use <Textarea> from shadcn/ui."`, suggestion `"Use <Textarea> from shadcn/ui."`, element `textarea`, replacement `Textarea`

- [x] Task 3: Create `prefer-shadcn-select` rule (AC: 3, 4, 5)
  - [x] Create `src/rules/prefer-shadcn-select.ts` following the same structure
  - [x] Detect `JsxOpeningElement` and `JsxSelfClosingElement` with tag name `select`
  - [x] Return finding with: rule `prefer-shadcn-select`, violation `"Raw <select> detected. Use <Select> from shadcn/ui."`, suggestion `"Use <Select> from shadcn/ui."`, element `select`, replacement `Select`

- [x] Task 4: Register all three new rules in `src/rules/index.ts` (AC: 6)
  - [x] Import `preferShadcnInput`, `preferShadcnTextarea`, `preferShadcnSelect`
  - [x] Add all three to the `ALL_RULES` array (after `preferShadcnButton`)
  - [x] Add named exports for each new rule

- [x] Task 5: Update fixture files (AC: 1, 2, 3, 4, 5, 6)
  - [x] Update `src/__fixtures__/raw-html-elements.tsx` to include raw `<input>`, `<textarea>`, and `<select>` elements
  - [x] Update `src/__fixtures__/clean-component.tsx` to include shadcn/ui `<Input>`, `<Textarea>`, and `<Select>` components
  - [x] Ensure fixture elements are on distinct lines for deterministic line-number assertions in tests

- [x] Task 6: Write unit tests for each new rule (AC: 1, 2, 3, 4, 5, 6)
  - [x] Create `src/rules/prefer-shadcn-input.test.ts`
    - [x] Test: detects raw `<input>` (self-closing) — assert finding count, rule ID, violation, element, replacement, line
    - [x] Test: detects raw `<input>` (opening element variant if applicable)
    - [x] Test: does NOT flag `<Input>` shadcn/ui component
  - [x] Create `src/rules/prefer-shadcn-textarea.test.ts`
    - [x] Test: detects raw `<textarea>` (opening+closing) — assert finding count, rule ID, violation, element, replacement, line
    - [x] Test: does NOT flag `<Textarea>` shadcn/ui component
  - [x] Create `src/rules/prefer-shadcn-select.test.ts`
    - [x] Test: detects raw `<select>` (opening+closing) — assert finding count, rule ID, violation, element, replacement, line
    - [x] Test: does NOT flag `<Select>` shadcn/ui component
  - [x] Create or update an integration test that verifies all four rules fire correctly when a file contains all four raw elements in line-number order (AC: 6)

## Dev Notes

### Critical: Follow `prefer-shadcn-button.ts` Pattern Exactly

The `prefer-shadcn-button.ts` implementation is the established pattern for all detection rules. Do not deviate from it. Key structure:

```typescript
import { SyntaxKind, type Node, type JsxOpeningElement, type JsxSelfClosingElement } from 'ts-morph';
import type { Finding, Rule } from '../types.js';

export const preferShadcnInput: Rule = {
  id: 'prefer-shadcn-input',
  description: 'Detects raw <input> elements and suggests using shadcn/ui <Input> component.',
  nodeTypes: [SyntaxKind.JsxOpeningElement, SyntaxKind.JsxSelfClosingElement],
  check: (node: Node): Finding | null => {
    let tagName = '';
    if (node.isKind(SyntaxKind.JsxOpeningElement)) {
      tagName = (node as JsxOpeningElement).getTagNameNode().getText().trim();
    } else if (node.isKind(SyntaxKind.JsxSelfClosingElement)) {
      tagName = (node as JsxSelfClosingElement).getTagNameNode().getText().trim();
    }
    if (tagName === 'input') {
      return {
        file: '',
        line: 0,
        column: 0,
        rule: 'prefer-shadcn-input',
        violation: 'Raw <input> detected. Use <Input> from shadcn/ui.',
        suggestion: 'Use <Input> from shadcn/ui.',
        element: 'input',
        replacement: 'Input',
      };
    }
    return null;
  },
};
```

Repeat this structure for `textarea` → `Textarea` and `select` → `Select`.

[Source: src/rules/prefer-shadcn-button.ts]

### Rule Behavior Contract (Must Follow)

- Rules **never throw** — return `null` on no-match, `Finding` on match
- Rules **never write to stdout/stderr**
- Rules are **pure functions** — no side effects
- Rules **return file/line/column as empty/0** — `runRules()` in `rule-engine.ts` overwrites these with correct values from `sourceFile.getLineAndColumnAtPos(node.getStart())`
- One rule per file — one exported const per file

[Source: _bmad-output/planning-artifacts/epics.md#Additional-Requirements]

### False Positive Prevention

Tag name matching is **case-sensitive lowercase only**:
- `'input'` matches, `'Input'` does NOT match (that's the shadcn/ui component — correct behavior)
- `'textarea'` matches, `'Textarea'` does NOT match
- `'select'` matches, `'Select'` does NOT match

`.trim()` on `.getText()` prevents whitespace-related false negatives (this fix was applied to prefer-shadcn-button in story 1.3 code review — use it consistently).

[Source: _bmad-output/implementation-artifacts/spec-code-review-fixes.md#Fixed-3]

### `src/rules/index.ts` Update Pattern

Current state of `src/rules/index.ts`:
```typescript
import { preferShadcnButton } from './prefer-shadcn-button.js';
import type { Rule } from '../types.js';

export const ALL_RULES: Rule[] = [
  preferShadcnButton,
];

export * from '../types.js';
export { preferShadcnButton };
```

Updated state must include all four rules in `ALL_RULES` in order (button, input, textarea, select). Add imports and named exports for the three new rules.

[Source: src/rules/index.ts]

### Fixture Updates

**`src/__fixtures__/raw-html-elements.tsx`** — current state has only `<button>` elements. This file must be extended with `<input />`, `<textarea></textarea>`, and `<select></select>` elements for the new rules to have test targets. Place each on its own line for predictable line-number assertions.

**`src/__fixtures__/clean-component.tsx`** — current state has only `<Button>` components. Extend with shadcn/ui `<Input>`, `<Textarea>`, and `<Select>` to verify no false positives. Example:
```tsx
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
```

**IMPORTANT:** The existing `prefer-shadcn-button.test.ts` asserts `findings.toHaveLength(3)` against `raw-html-elements.tsx`. When you add new raw elements to this fixture, those existing tests will still pass because they call `runRules` with only `[preferShadcnButton]` — not `ALL_RULES`. The button rule won't fire on `<input>`/`<textarea>`/`<select>`. Safe to add.

[Source: src/rules/prefer-shadcn-button.test.ts, src/__fixtures__/raw-html-elements.tsx]

### Test Pattern to Follow

Use the identical test structure from `prefer-shadcn-button.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { preferShadcnInput } from './prefer-shadcn-input.js';
import { runRules } from '../engine/rule-engine.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, '../__fixtures__');

describe('prefer-shadcn-input rule', () => {
  const project = new Project();

  it('should detect raw <input> elements', () => {
    const filePath = path.join(fixturesDir, 'raw-html-elements.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnInput], fixturesDir);

    expect(findings.length).toBeGreaterThanOrEqual(1);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-input',
      violation: 'Raw <input> detected. Use <Input> from shadcn/ui.',
      element: 'input',
      replacement: 'Input',
    });
  });

  it('should not detect shadcn/ui <Input> component', () => {
    const filePath = path.join(fixturesDir, 'clean-component.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnInput], fixturesDir);

    expect(findings).toHaveLength(0);
  });
});
```

[Source: src/rules/prefer-shadcn-button.test.ts]

### Violation Message Formula

All rules follow the UX-DR16 formula exactly:

```
"Raw <{element}> detected. Use <{Component}> from shadcn/ui."
```

- `input` → `"Raw <input> detected. Use <Input> from shadcn/ui."`
- `textarea` → `"Raw <textarea> detected. Use <Textarea> from shadcn/ui."`
- `select` → `"Raw <select> detected. Use <Select> from shadcn/ui."`

The `suggestion` field mirrors this:

- `"Use <Input> from shadcn/ui."`
- `"Use <Textarea> from shadcn/ui."`
- `"Use <Select> from shadcn/ui."`

[Source: _bmad-output/planning-artifacts/epics.md#UX-DR16]

### Files to Create

| File | Purpose |
|---|---|
| `src/rules/prefer-shadcn-input.ts` | Input detection rule |
| `src/rules/prefer-shadcn-input.test.ts` | Unit tests for input rule |
| `src/rules/prefer-shadcn-textarea.ts` | Textarea detection rule |
| `src/rules/prefer-shadcn-textarea.test.ts` | Unit tests for textarea rule |
| `src/rules/prefer-shadcn-select.ts` | Select detection rule |
| `src/rules/prefer-shadcn-select.test.ts` | Unit tests for select rule |

### Files to Modify

| File | Change |
|---|---|
| `src/rules/index.ts` | Import and register all 3 new rules in `ALL_RULES`, add named exports |
| `src/__fixtures__/raw-html-elements.tsx` | Add `<input />`, `<textarea></textarea>`, `<select></select>` |
| `src/__fixtures__/clean-component.tsx` | Add `<Input>`, `<Textarea>`, `<Select>` shadcn/ui components |

### No Changes Required In

- `src/types.ts` — Rule and Finding types are already correct
- `src/engine/rule-engine.ts` — Engine requires no changes; new rules use the same visitor pattern
- `src/analyzer.ts` — Imports `ALL_RULES` from `src/rules/index.ts`; adding rules to that array is sufficient
- `src/cli.ts` — No changes
- Any formatter files — No changes

### Project Structure Notes

- All rule files live in `src/rules/`
- Test files are co-located: `src/rules/prefer-shadcn-input.test.ts`
- Named exports only — no default exports (`export const preferShadcnInput = ...`)
- One barrel file `src/rules/index.ts` — update exports there

[Source: _bmad-output/planning-artifacts/epics.md#Additional-Requirements, _bmad-output/planning-artifacts/architecture.md]

### Previous Story Learnings (Stories 1.3 & 1.4)

**From Story 1.3 code review (now patched):**
- The `startsWith` path guard in `rule-engine.ts` was fixed — no impact on this story
- `.trim()` fix on `prefer-shadcn-button.ts` is the established pattern — use it on all new rules
- `console.log` was accidentally left in a rule — **never add `console.log` to rule files**
- `Warning` type is `{ message: string }` — rules never emit warnings directly

**From Story 1.4:**
- The human formatter is now wired in `src/cli.ts` — adding new rules to `ALL_RULES` is all that's needed for them to appear in output
- `picocolors` is installed and `colors.ts` exists — no changes needed
- `process.exitCode` pattern is established in `cli.ts` — no changes needed

[Source: _bmad-output/planning-artifacts/1-3-rule-engine-button-detection.md#Review-Findings, _bmad-output/planning-artifacts/1-4-human-readable-output-formatter.md#Dev-Notes]

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.5]
- [Source: _bmad-output/planning-artifacts/epics.md#Additional-Requirements (rule interface and behavior contract)]
- [Source: _bmad-output/planning-artifacts/epics.md#UX-DR16 (violation message formula)]
- [Source: src/rules/prefer-shadcn-button.ts (canonical rule pattern)]
- [Source: src/rules/index.ts (current ALL_RULES registration)]
- [Source: src/rules/prefer-shadcn-button.test.ts (canonical test pattern)]
- [Source: src/__fixtures__/raw-html-elements.tsx (fixture to extend)]
- [Source: src/__fixtures__/clean-component.tsx (fixture to extend)]
- [Source: _bmad-output/implementation-artifacts/spec-code-review-fixes.md#Fixed-3 (.trim() pattern)]
- [Source: _bmad-output/planning-artifacts/architecture.md#Rule-Engine]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- Created three new detection rules following the exact `prefer-shadcn-button.ts` pattern: `prefer-shadcn-input`, `prefer-shadcn-textarea`, `prefer-shadcn-select`
- All rules use case-sensitive lowercase tag matching and `.trim()` to prevent false positives/negatives
- Registered all three new rules in `src/rules/index.ts` `ALL_RULES` array with named exports
- Extended `src/__fixtures__/raw-html-elements.tsx` with `<input />`, `<textarea></textarea>`, `<select></select>` on lines 7–9 for deterministic line assertions
- Extended `src/__fixtures__/clean-component.tsx` with shadcn/ui `<Input>`, `<Textarea>`, `<Select>` — no false positives
- Created 3 unit test files (2 tests each: detection + false positive check) and 1 integration test file (3 tests: AC6 four-finding check, fixture-based check, clean check)
- Fixed pre-existing Windows path normalization bug in `src/engine/rule-engine.ts`: `startsWith` comparison now normalizes backslashes to forward slashes before comparing, resolving test failures on Windows where ts-morph returns forward-slash paths but Node `path.resolve` returns backslash paths
- All 37 new and existing tests pass; 2 pre-existing failures in `rule-engine.test.ts` (using `rootPath = '/'`) were present before this story

### File List

- src/rules/prefer-shadcn-input.ts (created)
- src/rules/prefer-shadcn-textarea.ts (created)
- src/rules/prefer-shadcn-select.ts (created)
- src/rules/prefer-shadcn-input.test.ts (created)
- src/rules/prefer-shadcn-textarea.test.ts (created)
- src/rules/prefer-shadcn-select.test.ts (created)
- src/rules/all-rules-integration.test.ts (created)
- src/rules/index.ts (modified)
- src/__fixtures__/raw-html-elements.tsx (modified)
- src/__fixtures__/clean-component.tsx (modified)
- src/engine/rule-engine.ts (modified — Windows path normalization fix)

### Review Findings

- [ ] [Review][Patch] Wrong rule used in prefer-shadcn-select.test.ts false-positive test — the "should not detect shadcn/ui `<Select>` component" test calls `runRules(sourceFile, [preferShadcnInput], fixturesDir)` instead of `[preferShadcnSelect]`; the test does not actually verify the select rule's false-positive path [src/rules/prefer-shadcn-select.test.ts:31]
- [ ] [Review][Patch] Loose `toBeGreaterThanOrEqual(1)` assertions in unit detection tests mask double-firing regressions — replace with `toHaveLength(1)` in prefer-shadcn-input.test.ts, prefer-shadcn-textarea.test.ts, and prefer-shadcn-select.test.ts [src/rules/prefer-shadcn-input.test.ts:17, prefer-shadcn-textarea.test.ts:17, prefer-shadcn-select.test.ts:17]
- [ ] [Review][Patch] Shared ts-morph Project instance across integration test `it` blocks risks stale AST or duplicate `addSourceFileAtPath` errors — use `project.getSourceFile(filePath) ?? project.addSourceFileAtPath(filePath)` pattern [src/rules/all-rules-integration.test.ts:47]
- [ ] [Review][Patch] Path normalization in rule-engine.ts is incomplete for mixed-separator rootPath (e.g. `C:/foo\bar`) — `split(path.sep)` only replaces the OS separator; a path with both `/` and `\` is not fully normalised; use `.replace(/\\/g, '/')` instead [src/engine/rule-engine.ts:13-14]
- [x] [Review][Defer] Integration test creates inline file at projectRoot-resolved path; if projectRoot resolves differently in CI the file-outside-root guard fires and the test produces 0 findings [src/rules/all-rules-integration.test.ts:28] — deferred, pre-existing
- [x] [Review][Defer] Self-closing `<textarea />` and `<select />` JSX variants are handled by the rules but have no dedicated test coverage — regression risk if nodeTypes changes [src/rules/prefer-shadcn-textarea.ts, prefer-shadcn-select.ts] — deferred, pre-existing
- [x] [Review][Defer] absoluteFilePath from ts-morph may contain URI-encoded characters (e.g. %20 in spaces), causing startsWith path guard to fail and silently skip the file [src/engine/rule-engine.ts:15] — deferred, pre-existing

## Change Log

- 2026-03-29: Implemented story 1.5 — created input, textarea, and select detection rules; registered in ALL_RULES; updated fixtures; wrote unit and integration tests; fixed Windows path normalization bug in rule-engine.ts (Date: 2026-03-29)
