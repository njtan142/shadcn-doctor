---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories", "step-04-final-validation"]
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
---

# shadcn-doctor - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for shadcn-doctor, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: User can scan a single TSX file for shadcn/ui adoption issues
FR2: User can scan a directory of files recursively for shadcn/ui adoption issues
FR3: System can parse TypeScript/TSX source files into an AST for pattern analysis
FR4: System can detect raw HTML elements where an equivalent shadcn/ui component exists
FR5: System can detect custom CSS-styled implementations where a shadcn/ui component would be appropriate
FR6: System can identify the specific shadcn/ui component that should replace each detected violation
FR7: System can evaluate source code against a built-in rule set covering all shadcn/ui component types
FR8: System can detect missed Button, Input, Textarea, Select, Checkbox, Switch, and RadioGroup opportunities
FR9: System can detect missed Card, Dialog, Alert, Tabs, Table, Badge, and Avatar opportunities
FR10: System can detect missed opportunities for all other components in the shadcn/ui registry
FR11: Each detection rule can report the file path, line number, violation type, and suggested replacement
FR12: User can invoke the tool via `npx shadcn-doctor`
FR13: User can specify a target path (file or directory) as a CLI argument
FR14: User can run the tool with no arguments to scan the current working directory
FR15: User can select output format via `--format` flag (human-readable or JSON)
FR16: System exits with code 0 when no findings are detected
FR17: System exits with code 1 when one or more findings are detected
FR18: System can produce human-readable output in test-runner style (default)
FR19: System can produce machine-readable JSON output with structured finding data
FR20: Each finding in output includes file path, line number, violation type, and suggested shadcn/ui replacement
FR21: System displays a summary count of total findings at the end of output
FR22: System displays a clear pass/fail status message
FR23: JSON output schema provides sufficient context for an AI agent to interpret and fix each finding without human assistance
FR24: System output is deterministic — identical input always produces identical output
FR25: System can be invoked repeatedly in a fix-and-rerun loop until exit code 0 is achieved

### NonFunctional Requirements

NFR1: Analysis completes in under 5 seconds for projects with up to 500 TSX files
NFR2: Analysis completes in under 15 seconds for projects with up to 2,000 TSX files
NFR3: Memory usage stays under 512MB for typical project sizes
NFR4: Startup time (CLI initialization to first file parsed) under 1 second
NFR5: False positive rate below 5% across all detection rules
NFR6: Zero false negatives for direct HTML-to-shadcn/ui mappings (e.g., raw `<button>` when `Button` is available)
NFR7: Deterministic output: identical source files always produce identical findings in identical order
NFR8: Graceful handling of malformed or unparseable files — skip with warning, don't crash
NFR9: Runs on Node.js 18 LTS and later
NFR10: Works on macOS, Linux, and Windows
NFR11: Handles TypeScript and TSX file formats (.ts, .tsx)
NFR12: Compatible with standard monorepo structures (scans specified paths, not opinionated about project layout)
NFR13: Zero configuration required for default usage — works out of the box
NFR14: Clear, actionable error messages when the tool encounters problems (e.g., no files found, invalid path)
NFR15: --help flag provides complete usage documentation

### Additional Requirements

- Starter template: Custom minimal setup with Commander (CLI), tsdown (build), Vitest 4.x (test), Biome (lint/format)
- AST parser: ts-morph v27.x wrapping TypeScript compiler API
- Rule engine: Visitor pattern with single AST walk per file — rules register for specific node types, engine dispatches matching nodes
- File discovery: Built-in Node.js `fs.readdir({ recursive: true })` with alphabetical path sorting for determinism
- Error handling: Per-file try/catch with warning collection; engine wraps each rule invocation in try/catch as safety net
- JSON output schema: `{ pass, summary: { total, filesScanned }, findings: [...], warnings: [...] }` with file, line, column, rule, violation, suggestion, element, replacement fields per finding
- Project structure: `src/cli.ts` (entry), `src/analyzer.ts` (orchestrator), `src/types.ts` (shared types), `src/scanner/`, `src/parser/`, `src/engine/`, `src/rules/`, `src/formatters/`, `src/__fixtures__/`
- Naming conventions: kebab-case files, camelCase functions, PascalCase types (no `I` prefix), UPPER_SNAKE_CASE constants
- Module patterns: Named exports only (no default exports), barrel `index.ts` per module directory
- Rule interface: `{ id: string, description: string, nodeTypes: SyntaxKind[], check: (node: Node) => Finding | null }`
- Rule behavior contract: Rules never throw (return null), never write to stdout/stderr, are pure functions, one rule per file
- Exit codes: 0 (no findings/pass), 1 (findings/fail), 2 (fatal error)
- `bin/shadcn-doctor.js` as npm bin entry point (ESM wrapper pointing to `dist/cli.js`)
- Co-located tests: `*.test.ts` files next to source files; test fixtures in `src/__fixtures__/`
- CI pipeline: Biome lint + format check → Vitest test suite → tsdown build verification
- Boundary rules: `rules/` only depends on shared types; `formatters/` only depends on shared types; only `analyzer.ts` orchestrates across modules; only `cli.ts` writes exit codes

### UX Design Requirements

UX-DR1: Terminal color system using standard ANSI codes — Red (31) for findings/fail, Green (32) for success/pass, Yellow (33) for warnings, Bold (1) for file path headers, Dim (2) for rule IDs and line:column numbers, Reset (0) for violation/suggestion text
UX-DR2: NO_COLOR environment variable compliance — suppress all ANSI codes when `NO_COLOR` is set (no-color.org standard)
UX-DR3: TTY detection — auto-disable colors when stdout is not a TTY (piped output); respect `FORCE_COLOR` environment variable to force colors on
UX-DR4: File Header output component — bold file path on standalone line as section separator for grouped findings
UX-DR5: Finding Line output component — 2-space indent + `line:col` (dim) + natural language violation+suggestion (default) + rule-id (dim), targeting under 120 characters
UX-DR6: Diff Source Line output component — `  - <element attributes...>` in red showing the detected source code line
UX-DR7: Diff Suggestion Line output component — `  + <Component attributes...>` in green showing the style-aware replacement code
UX-DR8: Summary Footer output component — `N findings in N files scanned.` for failures; `No findings. N files scanned.` for clean pass
UX-DR9: Warning Line output component — `⚠ Skipped: {file} ({reason})` in yellow, always on stderr, never mixed with stdout findings
UX-DR10: Error Message output component — `Error: {description}: {detail}` on stderr for fatal errors (exit code 2)
UX-DR11: JSON output includes `sourceLine` and `suggestedLine` fields for style-aware replacement suggestions in addition to the architecture-defined schema fields
UX-DR12: Setup command (`npx shadcn-doctor setup`) with interactive prompts for formatting style (auto-detect/prettier/compact/expanded), indent style (2-space/4-space/tabs), and quote style (double/single) using @inquirer/prompts
UX-DR13: Auto-detect option in setup command that scans existing JSX/TSX files to infer formatting conventions, showing detected settings and asking for confirmation
UX-DR14: `.shadcn-doctorrc.json` config file generated by setup command storing style, indent, quotes, and printWidth preferences — designed for version control
UX-DR15: Style-aware suggestion generation — replacement code formatted according to configured preset (compact: single-line when possible; expanded: always multi-line; prettier: threshold-based wrapping at print width)
UX-DR16: Finding message formula consistency — all rules use "Raw <{element}> detected. Use <{Component}> from shadcn/ui." pattern with "detected" as the verb for violations and "Use" as the verb for suggestions
UX-DR17: Output spacing rules — 1 blank line before first file group, 2-space indent for findings beneath file headers, no blank lines between findings in same file, 1 blank line between file groups, 1 blank line before summary footer, no trailing blank line
UX-DR18: Clean pass output — single line `No findings. N files scanned.` with no extra output; brevity is the reward
UX-DR19: Color utility implementation using picocolors (tiny, zero-dependency) — never hard-code ANSI escape sequences; JSON formatter must never pass through color utility
UX-DR20: Cross-platform path formatting using `path.posix` for forward slashes in all output paths regardless of OS

### FR Coverage Map

FR1: Epic 1 - Scan single TSX file
FR2: Epic 1 - Scan directory recursively
FR3: Epic 1 - Parse TS/TSX to AST
FR4: Epic 1 - Detect raw HTML elements
FR5: Epic 3 - Detect custom CSS-styled implementations
FR6: Epic 1 - Identify specific shadcn/ui replacement
FR7: Epic 3 - Evaluate against full built-in rule set
FR8: Epic 1 (Button, Input, Textarea, Select) + Epic 3 (Checkbox, Switch, RadioGroup)
FR9: Epic 3 - Card, Dialog, Alert, Tabs, Table, Badge, Avatar detection
FR10: Epic 3 - All other shadcn/ui registry components
FR11: Epic 1 - Rules report file, line, violation, suggestion
FR12: Epic 1 - Invoke via npx shadcn-doctor
FR13: Epic 1 - Specify target path as CLI argument
FR14: Epic 1 - No arguments scans cwd
FR15: Epic 2 - --format flag for output format selection
FR16: Epic 1 - Exit code 0 when clean
FR17: Epic 1 - Exit code 1 when findings detected
FR18: Epic 1 - Human-readable test-runner style output
FR19: Epic 2 - Machine-readable JSON output
FR20: Epic 1 - Findings include file, line, violation, suggestion
FR21: Epic 1 - Summary count of total findings
FR22: Epic 1 - Clear pass/fail status message
FR23: Epic 2 - JSON schema for AI agent consumption
FR24: Epic 1 - Deterministic output
FR25: Epic 2 - Fix-and-rerun loop support

## Epic List

### Epic 1: Core Analysis Pipeline
Developer can run `npx shadcn-doctor [path]`, scan TSX files, and detect the most common missed shadcn/ui components (Button, Input, Textarea, Select) with human-readable terminal output and pass/fail exit codes. This delivers a complete, usable tool end-to-end.
**FRs covered:** FR1, FR2, FR3, FR4, FR6, FR8 (partial: Button, Input, Textarea, Select), FR11, FR12, FR13, FR14, FR16, FR17, FR18, FR20, FR21, FR22, FR24
**NFRs addressed:** NFR1-4 (performance), NFR5-8 (accuracy/reliability), NFR9-12 (compatibility), NFR13-15 (DX)
**UX-DRs addressed:** UX-DR1, UX-DR2, UX-DR3, UX-DR4, UX-DR5, UX-DR8, UX-DR9, UX-DR10, UX-DR16, UX-DR17, UX-DR18, UX-DR19, UX-DR20

## Epic 1: Core Analysis Pipeline

Developer can run `npx shadcn-doctor [path]`, scan TSX files, and detect the most common missed shadcn/ui components (Button, Input, Textarea, Select) with human-readable terminal output and pass/fail exit codes.

### Story 1.1: Project Initialization & CLI Skeleton

As a developer contributing to shadcn-doctor,
I want the project scaffolded with TypeScript, build tooling, test framework, and a working CLI entry point,
So that development can begin on a solid, consistent foundation.

**Acceptance Criteria:**

**Given** the project directory is initialized
**When** I run `npm run build`
**Then** tsdown compiles `src/` to `dist/` with ESM output and declaration files
**And** `bin/shadcn-doctor.js` exists as the npm bin entry point pointing to `dist/cli.js`

**Given** the project has dependencies installed
**When** I check the production dependencies
**Then** `commander` and `ts-morph` are installed
**And** `typescript`, `tsdown`, `vitest`, `@biomejs/biome`, and `@types/node` are dev dependencies

**Given** the CLI entry point exists at `src/cli.ts`
**When** I run `npx shadcn-doctor --help`
**Then** Commander displays usage documentation with available options (path argument, --format flag)
**And** the process exits cleanly

**Given** the project has Biome configured
**When** I run `npm run lint`
**Then** Biome checks the codebase for lint and formatting issues

**Given** the project has Vitest configured
**When** I run `npm test`
**Then** Vitest discovers and runs `*.test.ts` files from `src/`

**Given** the project structure is created
**When** I inspect the `src/` directory
**Then** the following directories exist: `scanner/`, `parser/`, `engine/`, `rules/`, `formatters/`, `__fixtures__/`
**And** `types.ts` exists with the `Finding`, `Rule`, `AnalysisResult`, and `Warning` type definitions
**And** each module directory has a barrel `index.ts` file

### Story 1.2: File Discovery & AST Parsing

As a developer using shadcn-doctor,
I want the tool to discover all TypeScript/TSX files in a target path and parse them into ASTs,
So that source code can be analyzed for shadcn/ui adoption issues.

**Acceptance Criteria:**

**Given** a directory containing `.ts` and `.tsx` files
**When** the file discovery module scans the directory
**Then** all `.ts` and `.tsx` files are found recursively
**And** files are returned in alphabetical path order for deterministic processing
**And** non-TypeScript files (`.js`, `.css`, `.json`, etc.) are excluded

**Given** a single `.tsx` file path is provided
**When** the file discovery module processes it
**Then** only that single file is returned for scanning

**Given** a discovered `.tsx` file with valid TypeScript/JSX syntax
**When** the AST parser processes it via ts-morph
**Then** a parsed source file AST is returned for rule analysis

**Given** a discovered file with malformed or unparseable syntax
**When** the AST parser attempts to process it
**Then** a warning is collected: `⚠ Skipped: {file} (parse error)`
**And** the file is skipped without crashing the process
**And** remaining files continue to be processed

**Given** all output file paths
**When** they are formatted for display
**Then** paths use forward slashes regardless of OS (via `path.posix`)
**And** paths are relative to the scan root

### Story 1.3: Rule Engine & Button Detection

As a developer using shadcn-doctor,
I want the tool to detect raw `<button>` elements in my TSX files and suggest using shadcn/ui's `<Button>` component,
So that I get actionable feedback on missed shadcn/ui adoption for the most common interactive element.

**Acceptance Criteria:**

**Given** a TSX file containing a raw `<button>` JSX element
**When** the rule engine processes the file's AST
**Then** a finding is produced with: file path, line number, column number, rule ID `prefer-shadcn-button`, violation message "Raw <button> detected. Use <Button> from shadcn/ui.", element `button`, and replacement `Button`

**Given** a TSX file containing a shadcn/ui `<Button>` component
**When** the rule engine processes the file's AST
**Then** no finding is produced for that component (no false positive)

**Given** a TSX file with multiple raw `<button>` elements
**When** the rule engine processes the file
**Then** a separate finding is produced for each raw `<button>` with its correct line and column

**Given** the rule engine with registered rules
**When** it walks a file's AST
**Then** the AST is walked exactly once (visitor pattern)
**And** matching JSX nodes are dispatched to registered rules
**And** each rule returns either a `Finding` or `null`

**Given** a rule that encounters an unexpected error during execution
**When** the engine catches the error
**Then** a warning is collected for that rule/file combination
**And** processing continues with remaining rules and files

**Given** multiple files are scanned
**When** findings are collected
**Then** findings maintain deterministic order (alphabetical by file path, then by line number within each file)

### Story 1.4: Human-Readable Output Formatter

As a developer reading shadcn-doctor output in my terminal,
I want findings displayed in a clear, color-coded, file-grouped format with a summary,
So that I can quickly scan results, understand each violation, and know whether to ship or fix.

**Acceptance Criteria:**

**Given** findings exist across multiple files
**When** the human formatter renders output
**Then** findings are grouped by file path
**And** each file path is displayed as a bold header on its own line
**And** findings beneath each file are indented 2 spaces in format: `line:col  violation message  rule-id`
**And** line:col and rule-id are rendered in dim/gray
**And** violation text uses default terminal foreground
**And** 1 blank line separates file groups
**And** 1 blank line appears before the summary footer

**Given** one or more findings are detected
**When** the summary footer is rendered
**Then** it displays: `N findings in N files scanned.`
**And** the process exits with code 1

**Given** no findings are detected
**When** the output is rendered
**Then** a single line is displayed: `No findings. N files scanned.`
**And** the process exits with code 0
**And** no other output is produced

**Given** the `NO_COLOR` environment variable is set
**When** output is rendered
**Then** all ANSI color codes are suppressed
**And** all information remains readable via text content and symbols alone

**Given** stdout is not a TTY (piped output)
**When** output is rendered
**Then** ANSI colors are auto-disabled
**And** the `FORCE_COLOR` environment variable overrides this to enable colors

**Given** warnings were collected during scanning (parse errors, rule errors)
**When** output is rendered
**Then** warnings are written to stderr (never stdout)
**And** warnings use the format: `⚠ Skipped: {file} ({reason})`
**And** warnings do not affect the pass/fail exit code

**Given** a fatal error occurs (e.g., target path doesn't exist)
**When** the error is handled
**Then** `Error: {description}: {detail}` is written to stderr
**And** no findings output is produced
**And** the process exits with code 2

### Story 1.5: Input, Textarea, and Select Detection Rules

As a developer using shadcn-doctor,
I want the tool to detect raw `<input>`, `<textarea>`, and `<select>` elements and suggest their shadcn/ui equivalents,
So that the four most commonly misused form elements are covered by the analysis.

**Acceptance Criteria:**

**Given** a TSX file containing a raw `<input>` JSX element
**When** the rule engine processes the file
**Then** a finding is produced with rule ID `prefer-shadcn-input`, violation "Raw <input> detected. Use <Input> from shadcn/ui.", element `input`, replacement `Input`

**Given** a TSX file containing a raw `<textarea>` JSX element
**When** the rule engine processes the file
**Then** a finding is produced with rule ID `prefer-shadcn-textarea`, violation "Raw <textarea> detected. Use <Textarea> from shadcn/ui.", element `textarea`, replacement `Textarea`

**Given** a TSX file containing a raw `<select>` JSX element
**When** the rule engine processes the file
**Then** a finding is produced with rule ID `prefer-shadcn-select`, violation "Raw <select> detected. Use <Select> from shadcn/ui.", element `select`, replacement `Select`

**Given** a TSX file using shadcn/ui `<Input>`, `<Textarea>`, or `<Select>` components
**When** the rule engine processes the file
**Then** no findings are produced for those components

**Given** a TSX file with a mix of raw HTML elements and shadcn/ui components
**When** the rule engine processes the file
**Then** only the raw HTML elements produce findings
**And** the shadcn/ui components are not flagged

**Given** all four initial rules (button, input, textarea, select) are registered
**When** a file with all four raw elements is scanned
**Then** four separate findings are produced, one per element, in line-number order

### Story 1.6: CLI Argument Handling & Error Cases

As a developer using shadcn-doctor,
I want to specify a target file or directory as a CLI argument, or default to the current working directory,
So that I can easily scan any part of my project with a single command.

**Acceptance Criteria:**

**Given** the user runs `npx shadcn-doctor ./src/components`
**When** the CLI processes the argument
**Then** the tool scans all .ts/.tsx files recursively in `./src/components`

**Given** the user runs `npx shadcn-doctor ./src/page.tsx`
**When** the CLI processes the argument
**Then** the tool scans only that single file

**Given** the user runs `npx shadcn-doctor` with no arguments
**When** the CLI processes the command
**Then** the tool scans the current working directory recursively

**Given** the user runs `npx shadcn-doctor ./nonexistent`
**When** the target path does not exist
**Then** `Error: Path not found: ./nonexistent` is written to stderr
**And** the process exits with code 2

**Given** the user runs `npx shadcn-doctor ./empty-dir`
**When** the target directory contains no .ts/.tsx files
**Then** `Error: No TypeScript files found in: ./empty-dir` is written to stderr
**And** the process exits with code 2

**Given** the user runs `npx shadcn-doctor --help`
**When** the help flag is processed
**Then** complete usage documentation is displayed including: description, usage syntax, path argument, --format flag, and exit code meanings

**Given** the user runs `npx shadcn-doctor --version`
**When** the version flag is processed
**Then** the package version from package.json is displayed

---

**Epic 1 Summary:** 6 stories covering project scaffolding, file discovery, AST parsing, rule engine, 4 detection rules (button, input, textarea, select), human-readable output with colors, CLI argument handling, and error cases. All FRs assigned to Epic 1 are covered.

Now let's move to **Epic 2**. Here's the overview:

## Epic 2: Machine-Readable Output & AI Agent Loop

**Goal:** AI coding agents can consume structured JSON output with full finding context and run autonomous fix-and-rerun loops until the codebase passes.

**FRs covered:** FR15, FR19, FR23, FR25

I propose 2 stories for this epic:

| Story | Title | Scope |
|---|---|---|
| 2.1 | JSON Output Formatter | `--format json` flag produces structured JSON with pass/fail, summary, findings array, warnings array per the architecture schema |
| 2.2 | AI Agent Loop Validation | End-to-end validation that JSON output provides sufficient context for fix-and-rerun cycles; deterministic output across runs |

Does this breakdown work for Epic 2?

## Epic 2: Machine-Readable Output & AI Agent Loop

AI coding agents can consume structured JSON output with full finding context and run autonomous fix-and-rerun loops until the codebase passes.

### Story 2.1: JSON Output Formatter

As an AI agent developer,
I want shadcn-doctor to produce structured JSON output via a `--format json` flag,
So that my AI coding agent can parse findings programmatically and apply fixes without human interpretation.

**Acceptance Criteria:**

**Given** the user runs `npx shadcn-doctor [path] --format json`
**When** findings are detected
**Then** stdout contains valid JSON matching this schema:
```json
{
  "pass": false,
  "summary": { "total": <number>, "filesScanned": <number> },
  "findings": [
    {
      "file": "<relative path with forward slashes>",
      "line": <number>,
      "column": <number>,
      "rule": "<rule-id>",
      "violation": "<human-readable message>",
      "suggestion": "<human-readable suggestion>",
      "element": "<detected element>",
      "replacement": "<shadcn/ui component>"
    }
  ],
  "warnings": ["<warning messages>"]
}
```
**And** the process exits with code 1

**Given** the user runs `npx shadcn-doctor [path] --format json`
**When** no findings are detected
**Then** stdout contains valid JSON with `"pass": true`, `"summary": { "total": 0, "filesScanned": <number> }`, empty `"findings": []`, and `"warnings": []`
**And** the process exits with code 0

**Given** JSON output is produced
**When** the output is inspected
**Then** no ANSI color codes are present in the JSON regardless of TTY status, `NO_COLOR`, or `FORCE_COLOR` settings

**Given** warnings were collected during scanning (parse errors, rule errors)
**When** JSON output is produced
**Then** warnings appear in the `"warnings"` array as string messages
**And** warnings are also written to stderr in human-readable format

**Given** no `--format` flag is provided
**When** the tool runs
**Then** the default human-readable output is produced (not JSON)

**Given** the `--format` flag is provided with an unsupported value
**When** the CLI processes it
**Then** an error message is displayed listing valid format options
**And** the process exits with code 2

### Story 2.2: AI Agent Loop Validation

As an AI coding agent,
I want the JSON output to contain sufficient context for me to fix each finding and rerun until clean,
So that I can autonomously close the shadcn/ui compliance loop without human intervention.

**Acceptance Criteria:**

**Given** a JSON finding with `file`, `line`, `column`, `rule`, `violation`, `suggestion`, `element`, and `replacement` fields
**When** an AI agent reads the finding
**Then** the agent has enough context to locate the exact source location and understand what replacement to make

**Given** a file with 3 raw HTML element violations
**When** the tool is run with `--format json`, findings are fixed, and the tool is rerun
**Then** the second run produces fewer findings (progress is visible)
**And** when all violations are fixed and the tool is rerun, the output shows `"pass": true` with `"total": 0`

**Given** the same source files are scanned twice
**When** JSON output is compared between runs
**Then** the output is byte-for-byte identical (deterministic)
**And** findings appear in the same order (alphabetical by file, then by line number)

**Given** a fatal error occurs during a JSON-format run
**When** the error is handled
**Then** stderr contains the human-readable error message
**And** stdout contains no partial JSON output
**And** the process exits with code 2

---

**Epic 2 Summary:** 2 stories covering JSON output formatter with full schema implementation and AI agent loop validation for deterministic fix-and-rerun workflows. All FRs assigned to Epic 2 (FR15, FR19, FR23, FR25) are covered.

## Epic 3: Comprehensive Component Detection

Tool detects all remaining shadcn/ui component types — Checkbox, Switch, RadioGroup, Card, Dialog, Alert, Tabs, Table, Badge, Avatar — plus custom CSS-styled implementations where a shadcn/ui equivalent exists.

### Story 3.1: Form Control Detection Rules (Checkbox, Switch, RadioGroup)

As a developer using shadcn-doctor,
I want the tool to detect raw `<input type="checkbox">`, toggle/switch patterns, and `<input type="radio">` elements,
So that all form control components are covered by the analysis and I get suggestions for their shadcn/ui equivalents.

**Acceptance Criteria:**

**Given** a TSX file containing `<input type="checkbox" />`
**When** the rule engine processes the file
**Then** a finding is produced with rule ID `prefer-shadcn-checkbox`, violation "Raw <input type=\"checkbox\"> detected. Use <Checkbox> from shadcn/ui.", element `input`, replacement `Checkbox`

**Given** a TSX file containing a toggle/switch pattern (e.g., `<input type="checkbox" role="switch" />` or a `<div>` with toggle-like class names and click handlers)
**When** the rule engine processes the file
**Then** a finding is produced with rule ID `prefer-shadcn-switch`, violation "Custom switch detected. Use <Switch> from shadcn/ui.", element `input` or `div`, replacement `Switch`

**Given** a TSX file containing `<input type="radio" />` elements
**When** the rule engine processes the file
**Then** a finding is produced with rule ID `prefer-shadcn-radio-group`, violation "Raw <input type=\"radio\"> detected. Use <RadioGroup> from shadcn/ui.", element `input`, replacement `RadioGroup`

**Given** a TSX file using shadcn/ui `<Checkbox>`, `<Switch>`, or `<RadioGroup>` components
**When** the rule engine processes the file
**Then** no findings are produced for those components

**Given** an `<input>` element with `type="text"` or `type="email"` or other non-checkbox/radio type
**When** the checkbox and radio rules evaluate it
**Then** the checkbox and radio rules do not flag it (the input rule from Epic 1 handles generic inputs)

### Story 3.2: Layout & Feedback Component Detection Rules

As a developer using shadcn-doctor,
I want the tool to detect raw HTML patterns that should use shadcn/ui's Card, Dialog, Alert, Tabs, Table, Badge, and Avatar components,
So that structural and feedback components are included in the analysis.

**Acceptance Criteria:**

**Given** a TSX file containing a raw `<table>` element
**When** the rule engine processes the file
**Then** a finding is produced with rule ID `prefer-shadcn-table`, violation "Raw <table> detected. Use <Table> from shadcn/ui.", element `table`, replacement `Table`

**Given** a TSX file containing a raw `<dialog>` element or a `<div>` with `role="dialog"`
**When** the rule engine processes the file
**Then** a finding is produced with rule ID `prefer-shadcn-dialog`, violation "Raw <dialog> detected. Use <Dialog> from shadcn/ui." or "Custom modal <div> detected. Use <Dialog> from shadcn/ui.", element `dialog` or `div`, replacement `Dialog`

**Given** a TSX file containing a `<div>` with `role="alert"` or an alert-like aria pattern
**When** the rule engine processes the file
**Then** a finding is produced with rule ID `prefer-shadcn-alert`, violation "Custom alert <div> detected. Use <Alert> from shadcn/ui.", element `div`, replacement `Alert`

**Given** a TSX file containing a raw `<span>` or `<div>` with badge-like class names (e.g., `badge`, `tag`, `chip`, `label` with styling classes)
**When** the rule engine processes the file
**Then** a finding is produced with rule ID `prefer-shadcn-badge`, element `span` or `div`, replacement `Badge`

**Given** a TSX file containing a raw `<img>` element styled as a circular avatar (e.g., with `rounded-full` class and small fixed dimensions)
**When** the rule engine processes the file
**Then** a finding is produced with rule ID `prefer-shadcn-avatar`, element `img`, replacement `Avatar`

**Given** a TSX file containing tab-like navigation using raw `<button>` groups with tab-related attributes or class names
**When** the rule engine processes the file
**Then** a finding is produced with rule ID `prefer-shadcn-tabs`, replacement `Tabs`

**Given** a TSX file using shadcn/ui `<Table>`, `<Dialog>`, `<Alert>`, `<Badge>`, `<Avatar>`, or `<Tabs>` components
**When** the rule engine processes the file
**Then** no findings are produced for those components

**Given** ambiguous patterns where the developer's intent is unclear
**When** the rule evaluates the node
**Then** the rule does NOT flag it (conservative matching — when in doubt, don't flag)

### Story 3.3: Custom CSS-Styled Implementation Detection

As a developer using shadcn-doctor,
I want the tool to detect `<div>` elements with CSS styling patterns that indicate a custom implementation of a Card component,
So that even non-semantic custom implementations are flagged when a shadcn/ui equivalent clearly applies.

**Acceptance Criteria:**

**Given** a TSX file containing a `<div>` with card-like CSS classes (e.g., `border`, `rounded`, `shadow`, `p-4` or similar padding — multiple signals combined)
**When** the rule engine processes the file
**Then** a finding is produced with rule ID `prefer-shadcn-card`, violation "Custom styled <div> detected. Use <Card> from shadcn/ui.", element `div`, replacement `Card`

**Given** a `<div>` with only one card-like class (e.g., just `border` or just `rounded`)
**When** the rule evaluates it
**Then** no finding is produced (single signals are too ambiguous — conservative matching)

**Given** a `<div>` with classes that clearly indicate non-card usage (e.g., layout containers with `flex`, `grid` without card-like styling)
**When** the rule evaluates it
**Then** no finding is produced

**Given** a shadcn/ui `<Card>` component is already in use
**When** the rule evaluates it
**Then** no finding is produced

**Given** the false positive rate across all detection rules in this epic
**When** measured against a representative set of real-world TSX files
**Then** the false positive rate remains below 5% (NFR5)
**And** rules err toward not flagging when intent is ambiguous

---

**Epic 3 Summary:** 3 stories covering form controls (Checkbox, Switch, RadioGroup), layout & feedback components (Card, Dialog, Alert, Tabs, Table, Badge, Avatar), and custom CSS-styled implementation detection. All FRs assigned to Epic 3 (FR5, FR7, FR8 remainder, FR9, FR10) are covered.

## Epic 4: Style-Aware Diff Suggestions

Findings include git-style diff lines (-/+) showing the detected source code and a style-aware replacement suggestion, making every finding copy-paste ready for both human developers and AI agents.

### Story 4.1: Source Line Extraction & Diff Output

As a developer reading shadcn-doctor findings,
I want each finding to show the detected source code line and its suggested replacement in a git-style diff format,
So that I can immediately see exactly what to change without looking up the file.

**Acceptance Criteria:**

**Given** a TSX file with a raw `<button>` element at line 24
**When** the human formatter renders the finding
**Then** the output includes:
```
  24:5  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
  - <button className="bg-blue-500 text-white px-4 py-2" onClick={save}>
  + <Button onClick={save}>
```
**And** the `-` line is rendered in red (ANSI 31)
**And** the `+` line is rendered in green (ANSI 32)
**And** a blank line separates this finding block from the next finding in the same file

**Given** multiple findings in the same file
**When** the human formatter renders them
**Then** each finding is followed by its own `-/+` diff lines
**And** a blank line separates each finding block
**And** no blank lines appear between the finding message line and its diff lines

**Given** a clean pass with no findings
**When** the human formatter renders output
**Then** no diff lines are produced
**And** output remains: `No findings. N files scanned.`

**Given** `--format json` is used and findings exist
**When** the JSON formatter renders output
**Then** each finding object includes a `sourceLine` field containing the raw detected source code line
**And** each finding object includes a `suggestedLine` field containing the replacement suggestion
**And** no ANSI codes are present in either field

**Given** `NO_COLOR` is set or stdout is non-TTY
**When** diff lines are rendered in human output
**Then** the `-` and `+` prefix symbols remain visible
**And** all information is conveyed without color

### Story 4.2: Style-Aware Replacement Generation

As a developer or AI agent reading shadcn-doctor suggestions,
I want the replacement code in the `+` diff line to match my project's formatting style,
So that suggestions are copy-paste ready without needing manual reformatting.

**Acceptance Criteria:**

**Given** no `.shadcn-doctorrc.json` config exists
**When** replacement code is generated for the `+` diff line
**Then** the compact preset is used by default (single-line replacement when possible)
**And** double quotes and 2-space indentation are the defaults

**Given** a `.shadcn-doctorrc.json` with `"style": "compact"` exists in the project root
**When** replacement code is generated
**Then** the replacement fits on a single line when props are few
**And** the output matches the configured indent and quote style

**Given** a `.shadcn-doctorrc.json` with `"style": "expanded"` exists
**When** replacement code is generated
**Then** each prop appears on its own line
**And** the closing `>` or `/>` is on its own line
**And** indentation uses the configured indent style

**Given** a `.shadcn-doctorrc.json` with `"style": "prettier"` and `"printWidth": 80` exists
**When** replacement code is generated and the single-line version exceeds print width
**Then** the replacement is formatted as expanded (multi-line)
**When** the single-line version fits within print width
**Then** the replacement is formatted as compact (single-line)

**Given** config resolution runs
**When** no config file exists
**Then** defaults are used silently with no warning or message to the user

**Given** a `.shadcn-doctorrc.json` exists but contains malformed JSON
**When** config resolution runs
**Then** `⚠ Invalid config: .shadcn-doctorrc.json (using defaults)` is written to stderr
**And** the compact default preset is used

**Given** all replacement suggestions across different rules
**When** they are generated
**Then** the quote style (double or single) from config is applied consistently
**And** only the element-level swap is generated (complex child transformations like `<select>` + `<option>` children show opening element replacement only)

---

**Epic 4 Summary:** 2 stories covering source line extraction with diff output in both human and JSON formats, and style-aware replacement generation with compact/expanded/prettier presets and `.shadcn-doctorrc.json` config resolution. All UX-DRs assigned to Epic 4 (UX-DR6, UX-DR7, UX-DR11, UX-DR15) are covered.
