# Story 1.3: Rule Engine & Button Detection

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer using shadcn-doctor,
I want the tool to detect raw `<button>` elements in my TSX files and suggest using shadcn/ui's `<Button>` component,
so that I get actionable feedback on missed shadcn/ui adoption for the most common interactive element.

## Acceptance Criteria

1. **Given** a TSX file containing a raw `<button>` JSX element **When** the rule engine processes the file's AST **Then** a finding is produced with: file path, line number, column number, rule ID `prefer-shadcn-button`, violation message "Raw <button> detected. Use <Button> from shadcn/ui.", element `button`, and replacement `Button`
2. **Given** a TSX file containing a shadcn/ui `<Button>` component **When** the rule engine processes the file's AST **Then** no finding is produced for that component (no false positive)
3. **Given** a TSX file with multiple raw `<button>` elements **When** the rule engine processes the file **Then** a separate finding is produced for each raw `<button>` with its correct line and column
4. **Given** the rule engine with registered rules **When** it walks a file's AST **Then** the AST is walked exactly once (visitor pattern) **And** matching JSX nodes are dispatched to registered rules **And** each rule returns either a `Finding` or `null`
5. **Given** a rule that encounters an unexpected error during execution **When** the engine catches the error **Then** a warning is collected for that rule/file combination **And** processing continues with remaining rules and files
6. **Given** multiple files are scanned **When** findings are collected **Then** findings maintain deterministic order (alphabetical by file path, then by line number within each file)

## Tasks / Subtasks

- [ ] Task 1: Define Rule and Finding interfaces in `src/types.ts` (AC: 4, 5)
  - [ ] Add `Finding`, `Rule`, `AnalysisResult`, and `Warning` type definitions as specified in Architecture.
- [ ] Task 2: Implement Rule Engine (AC: 4, 5)
  - [ ] Create `src/engine/rule-engine.ts` using `ts-morph`'s visitor pattern (`forEachDescendant`).
  - [ ] Implement rule registration/dispatching based on `SyntaxKind`.
  - [ ] Wrap rule execution in try/catch to collect warnings without halting.
- [ ] Task 3: Implement Button Detection Rule (AC: 1, 2, 3)
  - [ ] Create `src/rules/prefer-shadcn-button.ts`.
  - [ ] Detect `JsxOpeningElement` and `JsxSelfClosingElement` with name `button`.
- [ ] Task 4: Update Analyzer Orchestrator (AC: 6)
  - [ ] Implement `src/analyzer.ts` to coordinate `scanner`, `parser`, and `engine`.
  - [ ] Ensure findings are sorted by file path (alphabetical) then line number.
- [ ] Task 5: Unit Tests
  - [ ] Write unit tests for the Rule Engine.
  - [ ] Write unit tests for the `prefer-shadcn-button` rule using fixtures in `src/__fixtures__/`.

## Dev Notes

- **Rule Engine Architecture:** Visitor pattern using `forEachDescendant` on the `SourceFile` node. Rules register for specific `SyntaxKind`s (e.g., `JsxOpeningElement`, `JsxSelfClosingElement`).
- **Determinism:** Findings must be sorted. The `scanner` already sorts files alphabetically; the engine should ensure findings within a file are ordered by line/column.
- **Error Handling:** Use the `Warning` type to capture rule-level failures.
- **Naming:** Follow kebab-case for files and rule IDs (`prefer-shadcn-button`).

### Project Structure Notes

- Types go in `src/types.ts`.
- Engine logic goes in `src/engine/`.
- Rules go in `src/rules/`.
- Orchestrator is `src/analyzer.ts`.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Rule-Engine]
- [Source: _bmad-output/planning-artifacts/architecture.md#Rule-Definition-Pattern]
- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.3]

### Review Findings

- [ ] [Review][Decision] `pass: true` on empty file discovery silently masks bad targetPath — When `discoverFiles` returns an empty array (wrong path, misconfigured directory), `analyze()` returns `pass: true` with only a warning in `warnings[]`. Callers checking only `pass` will silently succeed. Decide: should an empty scan be `pass: false` (treat as error), `pass: true` with warning (current behaviour), or throw? Cannot patch without knowing the intended contract.
- [ ] [Review][Patch] `startsWith` path guard is not a proper path-prefix check [src/engine/rule-engine.ts:13]
- [ ] [Review][Patch] Unguarded `throw` in `runRules` crashes `analyze()` instead of producing a warning — violates AC5 [src/engine/rule-engine.ts:13-15]
- [ ] [Review][Patch] `console.log` left in production rule — pollutes stdout on every JSX element [src/rules/prefer-shadcn-button.ts:15]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Pro

### Debug Log References

### Completion Notes List

### File List
