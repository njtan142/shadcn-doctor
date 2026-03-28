---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-03-28'
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/product-brief-shadcn-doctor-2026-03-23.md"
  - "_bmad-output/planning-artifacts/implementation-readiness-report-2026-03-28.md"
workflowType: 'architecture'
project_name: 'shadcn-doctor'
user_name: 'James'
date: '2026-03-28'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
25 FRs spanning five areas: source code analysis (AST parsing + file scanning), detection rules (pattern matching across all shadcn/ui component types), CLI interface (invocation, path targeting, format flags, exit codes), output & reporting (human-readable + JSON with structured finding data), and AI agent integration (determinism, sufficient context for autonomous fix loops). The architectural challenge concentrates in the rule engine — it must be extensible across all shadcn/ui components while maintaining <5% false positives.

**Non-Functional Requirements:**
15 NFRs across four categories. The architecturally significant ones:
- **Performance:** Sub-5s for 500 files, sub-1s startup — constrains parser choice and initialization strategy
- **Accuracy:** <5% false positive rate, zero false negatives on direct mappings — constrains rule design toward conservative matching
- **Reliability:** Deterministic output ordering — constrains how files are traversed and results are collected
- **Compatibility:** Node.js 18+, cross-platform (macOS/Linux/Windows), .ts and .tsx formats

**Scale & Complexity:**

- Primary domain: Developer tooling (npm CLI package)
- Complexity level: Medium
- Estimated architectural components: ~6 (CLI entry point, file discovery/traversal, AST parser, rule engine, rule definitions, output formatters)

### Technical Constraints & Dependencies

- **Runtime:** Node.js 18 LTS+ only
- **Language:** TypeScript (source and target)
- **AST Parser:** Must use an established parser (Babel, ts-morph, or TypeScript compiler API) — no custom parser
- **Distribution:** npm registry via `npx shadcn-doctor` — must be self-contained
- **Zero config default:** Must work out of the box with no configuration file
- **MVP boundary:** No inline suppression, no config file, no watch mode, no severity levels, no programmatic API

### Cross-Cutting Concerns Identified

- **Determinism:** Affects file traversal order, rule execution order, and output ordering — must be enforced at every layer
- **False positive management:** Affects every rule's design — conservative matching is a global architectural principle, not a per-rule decision
- **Performance budgets:** File discovery, AST parsing, and rule execution must all fit within the sub-5s budget for 500 files
- **Extensibility (Phase 2 readiness):** Rule system design should not prevent future community-contributed rules, even though MVP is built-in only
- **Error resilience:** Malformed files must be skipped with warnings, not crash the process — affects parser integration and error boundaries

## Starter Template Evaluation

### Primary Technology Domain

CLI developer tool (npm package) based on project requirements analysis. Single-command interface with minimal flags, distributed via npm registry.

### Starter Options Considered

| Option | Framework | Install Size | Startup Overhead | Dependencies |
|---|---|---|---|---|
| **Custom Setup** | Commander | ~180KB | ~18ms | 0 |
| oclif | @oclif/core | ~12MB | 70-100ms | 30+ |
| typescript-cli-starter | Template | Variable | Variable | Variable |

oclif was rejected due to excessive overhead for a single-command tool — its plugin architecture, class-based command pattern, and 30+ dependencies are designed for complex multi-command CLIs. The typescript-cli-starter template was rejected as too generic, requiring significant customization without providing domain-specific value.

### Selected Starter: Custom Minimal Setup

**Rationale for Selection:**
shadcn-doctor is a focused single-command CLI with 3-4 flags. The minimal setup approach keeps dependencies low (supporting fast `npx` cold starts), startup overhead minimal (supporting sub-1s NFR), and gives full control over the project structure without fighting a framework's opinions.

**Initialization Command:**

```bash
mkdir shadcn-doctor && cd shadcn-doctor
npm init -y
npm install commander
npm install -D typescript tsdown vitest @biomejs/biome @types/node
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript with strict mode, targeting Node.js 18 LTS+. ESM output format (modern Node.js default).

**CLI Framework:**
Commander — lightweight argument parsing with built-in `--help` generation, zero dependencies, ~18ms overhead.

**Build Tooling:**
tsdown — zero-config TypeScript bundler powered by Rolldown (spiritual successor to tsup). Produces ESM output with declaration files. Fast builds for development iteration.

**Testing Framework:**
Vitest 4.x — native TypeScript support, fast execution, compatible with the project's ESM output.

**Linting & Formatting:**
Biome — single tool replacing ESLint + Prettier. Fast, zero-config defaults, TypeScript-native.

**Code Organization:**
Manual project structure (defined in next architectural step) — no framework-imposed conventions.

**Development Experience:**
TypeScript watch mode via tsdown for development builds, Vitest watch mode for TDD workflow.

**Note:** Project initialization using these commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- AST Parser: ts-morph (v27.x)
- Rule Engine: Visitor pattern with single AST walk per file
- JSON Output Schema: Structured format with file, line, column, rule ID, violation, suggestion

**Important Decisions (Shape Architecture):**
- File Discovery: Built-in `fs.readdir({ recursive: true })` with alphabetical sort for determinism
- Error Handling: Per-file try/catch with stderr warnings, non-blocking

**Deferred Decisions (Post-MVP):**
- Config file format and schema (Phase 2)
- Inline suppression comment syntax (Phase 2)
- Severity levels and warning vs error distinction (Phase 2)
- Programmatic API surface (Phase 3)

### AST Parser

- **Decision:** ts-morph v27.x
- **Rationale:** Wraps the TypeScript compiler API with a developer-friendly higher-level API. Same parsing engine speed as raw TS compiler (2x faster than Babel). The friendlier API reduces rule authoring complexity — critical for Phase 2 community-contributed rules. No type information needed for MVP pattern matching, but available if future rules require it.
- **Affects:** Rule engine, all detection rules, performance budget
- **Trade-off:** ~5MB dependency size vs raw TypeScript compiler API, acceptable for npx distribution

### Rule Engine

- **Decision:** Visitor pattern — rules register for specific AST node types, engine walks each file's AST once
- **Rationale:** Most rules target the same node types (JsxElement, JsxSelfClosingElement). Single walk per file scales O(nodes) regardless of rule count, vs O(nodes × rules) with per-rule tree walks. Directly supports sub-5s performance target as rule count grows.
- **Affects:** All detection rules, performance, extensibility
- **Rule Interface:** Rules declare which node types they visit; engine dispatches matching nodes to registered rules; each rule returns zero or more findings per node

### File Discovery & Traversal

- **Decision:** Built-in Node.js `fs.readdir({ recursive: true })` with alphabetical path sorting
- **Rationale:** Zero additional dependencies. Available since Node 18.17 (within our Node 18+ requirement). Alphabetical sort guarantees deterministic output ordering across platforms (NFR7).
- **Affects:** Determinism, cross-platform compatibility

### Error Handling

- **Decision:** Per-file try/catch with warning collection
- **Rationale:** Malformed or unparseable files are skipped with a warning to stderr. Warnings are collected separately from findings and do not affect the pass/fail exit code. Process never crashes on bad input (NFR8).
- **Affects:** Reliability, output formatting

### JSON Output Schema

- **Decision:** Structured schema with pass/fail status, summary counts, findings array, and warnings array
- **Schema:**
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
      "violation": "Raw <select> element detected",
      "suggestion": "Use <Select> from shadcn/ui",
      "element": "select",
      "replacement": "Select"
    }
  ],
  "warnings": []
}
```
- **Rationale:** Provides AI agents with exact location (file/line/column), machine-readable rule ID, human-readable violation description, and actionable suggestion — all required for autonomous fix loops (FR23). The `pass` boolean and `summary` enable quick status checks without parsing the findings array.

### Decision Impact Analysis

**Implementation Sequence:**
1. Project scaffolding (Commander + tsdown + Vitest + Biome)
2. File discovery module (fs.readdir + sort + .ts/.tsx filtering)
3. AST parsing integration (ts-morph setup with error boundaries)
4. Rule engine (visitor pattern dispatcher)
5. Initial detection rules (starting with highest-frequency components)
6. Output formatters (human-readable + JSON)
7. CLI wiring (Commander options, exit codes)

**Cross-Component Dependencies:**
- Rule engine depends on ts-morph AST node types
- Output formatters depend on the Finding type produced by rules
- CLI exit code depends on findings count from rule engine
- Deterministic ordering flows from file discovery sort through to output

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
6 areas where AI agents could make different choices: naming conventions, test organization, rule definition format, import/export style, error handling in rules, and logging.

### Naming Patterns

**File Naming:**
- kebab-case for all files: `rule-engine.ts`, `output-formatter.ts`, `prefer-shadcn-button.ts`
- Test files co-located with source: `rule-engine.test.ts` next to `rule-engine.ts`

**Rule ID Naming:**
- kebab-case: `prefer-shadcn-button`, `prefer-shadcn-select`, `prefer-shadcn-card`
- Pattern: `prefer-shadcn-{component-name}`
- Matches ESLint rule naming conventions for ecosystem familiarity

**Code Naming:**
- Functions: camelCase — `analyzeFile`, `createFinding`, `formatOutput`
- Types/Interfaces: PascalCase, no `I` prefix — `Finding`, `Rule`, `AnalysisResult`
- Constants: UPPER_SNAKE_CASE — `DEFAULT_EXTENSIONS`, `EXIT_CODE_FINDINGS`
- Variables: camelCase — `fileCount`, `findings`, `sourceFile`

### Structure Patterns

**Test Organization:**
- Co-located tests: `src/rules/prefer-shadcn-button.test.ts` next to `src/rules/prefer-shadcn-button.ts`
- Vitest discovers `*.test.ts` files automatically
- Test fixtures in `src/__fixtures__/` directory for shared TSX samples

**Module Organization:**
- One barrel file (`index.ts`) per major module directory for clean imports
- Named exports only — no default exports anywhere in the codebase
- Direct imports within a module, barrel imports across modules

### Rule Definition Pattern

**Standard Rule Interface:**
```typescript
interface Rule {
  id: string;                     // "prefer-shadcn-button"
  description: string;            // Human-readable: "Detects raw <button> elements..."
  nodeTypes: SyntaxKind[];        // AST node types this rule visits
  check: (node: Node) => Finding | null;
}
```

**Rule Behavior Contract:**
- Rules NEVER throw — return `null` for no finding, `Finding` for a match
- Rules NEVER write to stdout or stderr
- Rules are pure functions of their input node — no side effects, no shared state
- One rule per file, exported as a named export
- Rule file name matches rule ID: `prefer-shadcn-button.ts` exports rule with id `prefer-shadcn-button`

### Format Patterns

**Finding Type:**
```typescript
interface Finding {
  file: string;       // Relative path from scan root
  line: number;       // 1-based line number
  column: number;     // 1-based column number
  rule: string;       // Rule ID: "prefer-shadcn-button"
  violation: string;  // Human-readable: "Raw <button> element detected"
  suggestion: string; // Human-readable: "Use <Button> from shadcn/ui"
  element: string;    // The detected element: "button"
  replacement: string;// The shadcn/ui component: "Button"
}
```

**Path Formatting:**
- All file paths in output are relative to the scan root, using forward slashes regardless of platform
- Normalized with `path.posix` for cross-platform determinism

### Process Patterns

**Error Handling:**
- Engine wraps each rule invocation in try/catch as a safety net
- Rule failures are collected as warnings, not thrown
- File parse failures emit a warning and skip the file — never crash
- Warnings do not affect the pass/fail exit code

**Logging & Output Ownership:**
- No logging abstraction for MVP
- `console.error` for warnings only (file parse failures, rule errors)
- Output formatters own all stdout content — nothing else writes to stdout
- Rules never interact with console directly

**Exit Codes:**
- `0` — no findings (pass)
- `1` — one or more findings (fail)
- `2` — fatal error (e.g., target path doesn't exist)

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow the `Rule` interface exactly — no variations, no subclasses, no factory patterns
- Use kebab-case for file names and rule IDs
- Co-locate tests with source files
- Use named exports only
- Keep rules as pure functions with no side effects
- Never write to stdout from anywhere except output formatters

**Anti-Patterns:**
- `export default` anywhere in the codebase
- Rules that throw exceptions instead of returning null
- Rules that access the filesystem or network
- Direct `console.log` calls outside output formatters
- `I`-prefixed interfaces (`IFinding`, `IRule`)
- Class-based rule definitions

## Project Structure & Boundaries

### Requirements to Structure Mapping

| FR Category | Directory |
|---|---|
| Source Code Analysis (FR1-FR6) | `src/scanner/`, `src/parser/` |
| Detection Rules (FR7-FR11) | `src/rules/` |
| CLI Interface (FR12-FR17) | `src/cli.ts` (entry point) |
| Output & Reporting (FR18-FR22) | `src/formatters/` |
| AI Agent Integration (FR23-FR25) | Cross-cutting (formatters + engine determinism) |

### Complete Project Directory Structure

```
shadcn-doctor/
├── README.md
├── package.json
├── tsconfig.json
├── tsdown.config.ts
├── biome.json
├── vitest.config.ts
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml
├── bin/
│   └── shadcn-doctor.js          # npm bin entry point (ESM wrapper)
├── src/
│   ├── cli.ts                     # Commander setup, argument parsing, entry point
│   ├── analyzer.ts                # Orchestrator: file discovery → parse → rules → output
│   ├── types.ts                   # Shared types: Finding, Rule, AnalysisResult, Warning
│   ├── scanner/
│   │   ├── index.ts               # Barrel export
│   │   ├── file-discovery.ts      # fs.readdir recursive + sort + .ts/.tsx filter
│   │   └── file-discovery.test.ts
│   ├── parser/
│   │   ├── index.ts               # Barrel export
│   │   ├── ast-parser.ts          # ts-morph project setup + file parsing with error boundary
│   │   └── ast-parser.test.ts
│   ├── engine/
│   │   ├── index.ts               # Barrel export
│   │   ├── rule-engine.ts         # Visitor pattern dispatcher: walks AST, dispatches to rules
│   │   ├── rule-engine.test.ts
│   │   ├── rule-registry.ts       # Collects and indexes all rules by node type
│   │   └── rule-registry.test.ts
│   ├── rules/
│   │   ├── index.ts               # Barrel: exports ALL_RULES array
│   │   ├── prefer-shadcn-button.ts
│   │   ├── prefer-shadcn-button.test.ts
│   │   ├── prefer-shadcn-input.ts
│   │   ├── prefer-shadcn-input.test.ts
│   │   ├── prefer-shadcn-select.ts
│   │   ├── prefer-shadcn-select.test.ts
│   │   ├── prefer-shadcn-textarea.ts
│   │   ├── prefer-shadcn-textarea.test.ts
│   │   ├── prefer-shadcn-checkbox.ts
│   │   ├── prefer-shadcn-checkbox.test.ts
│   │   ├── prefer-shadcn-switch.ts
│   │   ├── prefer-shadcn-switch.test.ts
│   │   ├── prefer-shadcn-radio-group.ts
│   │   ├── prefer-shadcn-radio-group.test.ts
│   │   ├── prefer-shadcn-card.ts
│   │   ├── prefer-shadcn-card.test.ts
│   │   ├── prefer-shadcn-dialog.ts
│   │   ├── prefer-shadcn-dialog.test.ts
│   │   ├── prefer-shadcn-alert.ts
│   │   ├── prefer-shadcn-alert.test.ts
│   │   ├── prefer-shadcn-tabs.ts
│   │   ├── prefer-shadcn-tabs.test.ts
│   │   ├── prefer-shadcn-table.ts
│   │   ├── prefer-shadcn-table.test.ts
│   │   ├── prefer-shadcn-badge.ts
│   │   ├── prefer-shadcn-badge.test.ts
│   │   ├── prefer-shadcn-avatar.ts
│   │   └── prefer-shadcn-avatar.test.ts
│   ├── formatters/
│   │   ├── index.ts               # Barrel export
│   │   ├── human-formatter.ts     # Test-runner style output (default)
│   │   ├── human-formatter.test.ts
│   │   ├── json-formatter.ts      # Structured JSON output
│   │   └── json-formatter.test.ts
│   └── __fixtures__/
│       ├── clean-component.tsx     # No violations — used for pass tests
│       ├── raw-html-elements.tsx   # Raw <button>, <input>, etc. — used for detection tests
│       ├── mixed-usage.tsx         # Some shadcn, some raw — partial violation
│       ├── malformed.tsx           # Unparseable file — used for error handling tests
│       └── custom-styled.tsx       # Custom CSS implementations — FR5 detection
└── dist/                           # tsdown build output (gitignored)
```

### Architectural Boundaries

**Module Boundaries:**

| Module | Responsibility | Depends On | Depended On By |
|---|---|---|---|
| `cli` | Argument parsing, exit codes | analyzer, formatters | — (entry point) |
| `analyzer` | Orchestration of scan pipeline | scanner, parser, engine, formatters | cli |
| `scanner` | File discovery and path resolution | Node.js `fs` | analyzer |
| `parser` | AST parsing via ts-morph | ts-morph | analyzer |
| `engine` | Visitor dispatch, rule execution | rules, ts-morph types | analyzer |
| `rules` | Detection logic per component | types (Finding, Rule) | engine |
| `formatters` | Output rendering (human + JSON) | types (Finding, AnalysisResult) | analyzer, cli |

**Data Flow:**
```
CLI args → analyzer → scanner (discover files)
                    → parser (parse each file to AST)
                    → engine (walk AST, dispatch to rules, collect findings)
                    → formatters (render findings to stdout)
         → exit code (0/1/2)
```

**Boundary Rules:**
- `rules/` never imports from `engine/`, `scanner/`, `parser/`, or `formatters/` — rules only depend on shared types
- `formatters/` never imports from `rules/`, `engine/`, or `scanner/` — formatters only depend on shared types
- `engine/` imports from `rules/` (to get the registry) but never from `scanner/` or `formatters/`
- Only `analyzer.ts` orchestrates across all modules — it's the single integration point
- Only `cli.ts` writes exit codes and invokes the analyzer

### Development Workflow Integration

**Build Process:**
- `tsdown` compiles `src/` → `dist/` with ESM output
- `bin/shadcn-doctor.js` is the npm `bin` entry, pointing to `dist/cli.js`
- `npm run build` produces the distributable package

**Test Process:**
- `vitest` discovers all `*.test.ts` files co-located in `src/`
- Fixtures in `src/__fixtures__/` are shared across rule tests
- `npm test` runs all tests; `npm run test:watch` for TDD

**CI Pipeline:**
- Biome lint + format check
- Vitest test suite
- tsdown build verification
- (Future: npm publish on tag)

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices (Commander, ts-morph v27.x, tsdown, Vitest 4.x, Biome) are TypeScript-native, ESM-compatible, and have no version conflicts. Node.js 18+ requirement satisfies all API dependencies including `fs.readdir({ recursive: true })`.

**Pattern Consistency:**
Naming conventions (kebab-case files, camelCase functions, PascalCase types), module patterns (named exports, barrel files), and process patterns (error handling, output ownership) are consistent across all architectural components.

**Structure Alignment:**
Project directory structure directly maps to module boundaries. Single orchestrator pattern (`analyzer.ts`) respects all boundary rules. Data flow matches directory organization.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
All 25 FRs have explicit architectural support. FR1-FR6 (analysis) maps to scanner + parser modules. FR7-FR11 (rules) maps to rules directory with visitor pattern engine. FR12-FR17 (CLI) maps to Commander-based cli.ts. FR18-FR22 (output) maps to formatters module. FR23-FR25 (AI agent integration) is addressed by JSON schema design and determinism guarantees.

**Non-Functional Requirements Coverage:**
All 15 NFRs are architecturally supported. Performance (NFR1-4) addressed by ts-morph speed, visitor pattern efficiency, Commander low overhead, and per-file processing. Accuracy (NFR5-6) addressed by conservative matching principle. Reliability (NFR7-8) addressed by alphabetical sort and per-file error boundaries. Compatibility (NFR9-12) addressed by Node.js 18+ target, path normalization, and path-based scanning. DX (NFR13-15) addressed by zero-config default and Commander's built-in help.

### Gap Analysis Results

**Critical Gaps:** None.

**Important Gaps (non-blocking):**
- FR10 (all shadcn/ui components) — architecture supports unlimited rules, but full component list is an implementation-time enumeration task
- FR5 (custom CSS-styled detection) — architecturally supported, but heuristic rule design will require careful false-positive testing

**Nice-to-Have:**
- npm publish CI workflow not yet defined (future enhancement)

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Rule definition pattern specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — all requirements covered, no critical gaps, coherent decisions

**Key Strengths:**
- Clean separation of concerns with explicit module boundaries
- Visitor pattern scales efficiently as rule count grows
- Rule interface is simple enough for community contributors (Phase 2)
- Determinism enforced at every layer (file discovery, rule execution, output)
- Conservative matching principle baked into architecture, not just individual rules

**Areas for Future Enhancement:**
- Config file support (Phase 2) — architecture doesn't prevent this, just not included in MVP
- Inline suppression (Phase 2) — would require rule engine to check for preceding comments
- Programmatic API (Phase 3) — `analyzer.ts` orchestrator could be exported directly

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and module boundaries
- Refer to this document for all architectural questions
- When in doubt on a detection rule, err toward not flagging (conservative matching)

**First Implementation Priority:**
```bash
mkdir shadcn-doctor && cd shadcn-doctor
npm init -y
npm install commander ts-morph
npm install -D typescript tsdown vitest @biomejs/biome @types/node
```
