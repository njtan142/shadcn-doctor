---
stepsCompleted: ["step-01-init", "step-02-discovery", "step-02b-vision", "step-02c-executive-summary", "step-03-success", "step-04-journeys", "step-05-domain", "step-06-innovation", "step-07-project-type", "step-08-scoping", "step-09-functional", "step-10-nonfunctional", "step-11-polish"]
inputDocuments: ["_bmad-output/planning-artifacts/product-brief-shadcn-doctor-2026-03-23.md"]
workflowType: 'prd'
briefCount: 1
researchCount: 0
brainstormingCount: 0
projectDocsCount: 0
classification:
  projectType: developer_tool
  domain: general
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document - shadcn-doctor

**Author:** James
**Date:** 2026-03-28

## Executive Summary

shadcn-doctor is a rule-based static analysis tool that detects missed shadcn/ui component adoption in React codebases. It targets a specific failure mode in AI-assisted development: agents that import shadcn/ui but default to custom HTML elements — raw `<button>`, `<input>`, and `<div>` implementations — instead of using available design system components. The result is technical debt that developers must manually identify and refactor.

The tool provides deterministic, machine-readable feedback that AI agents consume in an autonomous "develop, analyze, fix, repeat" loop. Unlike AI-powered analysis, shadcn-doctor uses AST-based pattern matching with community-driven rules, making it predictable, fast, and free of additional API costs. The primary audience is developers building with shadcn/ui who rely on AI coding tools and want to trust the output without a manual cleanup pass.

### What Makes This Special

shadcn-doctor is built for AI agents as the primary consumer, not human developers. Existing linters and design system checkers assume a human reads the output and decides what to do. shadcn-doctor assumes the consumer is an AI that needs fast, structured, actionable feedback it can act on immediately — closing the feedback loop at the generation step rather than at code review.

The core insight: AI agents don't fail at shadcn/ui adoption because they lack knowledge of the components. They fail because there is no tight feedback loop during generation. A deterministic, rule-based analyzer closes that loop without adding AI cost or unpredictability. No existing tool addresses this gap — shadcn-doctor is first-to-market for shadcn/ui adoption analysis.

## Project Classification

- **Project Type:** Developer tool (npm package + CLI)
- **Domain:** General (developer tooling)
- **Complexity:** Medium — AST parsing edge cases, extensible rule system, and a hard constraint on false-positive rate (<5%)
- **Project Context:** Greenfield

## Success Criteria

### User Success

- **Binary pass/fail workflow:** shadcn-doctor produces a clear pass or fail result, identical in behavior to `npm test`. No ambiguous warnings or advisory output — findings mean the code needs fixing.
- **Autonomous AI agent loop:** AI agents run shadcn-doctor, interpret failures, fix violations, and rerun until clean — without human intervention.
- **Trust the result:** When shadcn-doctor passes, the developer ships with confidence that shadcn/ui components are used correctly. No manual review pass needed.

### Business Success

- **Personal utility first:** The tool reliably solves the author's own daily workflow friction with AI-generated shadcn/ui code.
- **Open source, no gatekeeping:** Freely available on npm. Community can contribute rules and patterns via PRs.
- **Organic adoption:** No growth targets. Success is measured by sustained personal use and community contributions arriving naturally.

### Technical Success

- **False positive rate < 5%:** Every reported finding must represent a real missed shadcn/ui opportunity. False positives erode trust and break the autonomous loop.
- **Fast execution:** Analysis completes in under 5 seconds for typical project sizes.
- **Deterministic output:** Same input always produces the same result. No non-determinism or flakiness.

### Measurable Outcomes

- Developer completes AI-assisted coding sessions with zero manual shadcn/ui cleanup
- shadcn-doctor runs complete in under 5 seconds for typical project sizes
- Community PRs for new detection rules begin appearing within 3 months of public release

## Product Scope & Phased Development

### MVP Strategy

**Approach:** Problem-solving MVP — the smallest tool that eliminates manual shadcn/ui cleanup after AI code generation.
**Resource Requirements:** Solo developer (James). No external dependencies, no backend services, no accounts.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Journey 1 (James — The Daily Build): Full support
- Journey 2 (AI Agent — The Autonomous Loop): Full support
- Journey 3 (False Positive): Partial — no inline suppression, but low false-positive rate mitigates this

**Must-Have Capabilities:**
- CLI invoked via `npx shadcn-doctor [path]`
- AST-based scanning of TSX files in target directory
- Detection rules for **all shadcn/ui component types** — every component in the shadcn/ui registry is a detection target (Button, Input, Select, Card, Dialog, Textarea, Switch, Checkbox, RadioGroup, Tabs, Table, Badge, Alert, Avatar, etc.)
- Pattern matching: raw HTML elements and custom implementations where a shadcn/ui equivalent exists
- Binary pass/fail exit code (0 = clean, 1 = findings)
- Human-readable output (test-runner style) as default
- JSON output via `--format json` with file path, line number, violation type, and suggested shadcn/ui replacement
- Sub-5-second execution for typical projects

### Phase 2: Growth (Post-MVP)

- Inline suppression comments (`// shadcn-doctor-ignore-next-line`)
- Configuration file (`.shadcn-doctorrc`) for project-specific rule tuning and exclusions
- Extensible rule system — community-authored detection rules via PR
- Watch mode for continuous analysis
- Severity levels (error vs. warning)

### Phase 3: Expansion (Future)

- Programmatic Node.js API (`import { analyze } from 'shadcn-doctor'`)
- IDE integration (VS Code extension)
- Plugin ecosystem for design systems beyond shadcn/ui
- AI agent SDK hooks for direct integration with coding tools
- Adoption analytics and trend reporting

### Risk Mitigation Strategy

**Technical Risks:**
- *AST parsing edge cases* — shadcn/ui has a large component surface. Mitigate by using TypeScript compiler API for accurate parsing and building rules incrementally, starting with the most commonly misused components.
- *False positives exceeding 5% threshold* — Mitigate by conservative pattern matching: only flag clear-cut cases where a raw HTML element directly maps to a shadcn/ui component. When in doubt, don't flag.
- *AI agents may not reliably parse tool output* — JSON output format with explicit schema; test against major AI coding tools.
- *shadcn/ui API changes break detection rules* — Version-aware rule definitions; community-maintained rule updates in Phase 2.

**Market Risks:**
- *Only the author uses it* — Acceptable outcome. The tool succeeds if it solves James's problem. Community adoption is a bonus, not a requirement.

**Resource Risks:**
- *Solo developer bandwidth* — MVP is intentionally minimal. CLI + rules + two output formats. No web UI, no backend, no accounts. If time is tight, reduce initial rule count and expand post-launch.

## User Journeys

### Journey 1: James — The Daily Build (Primary User, Success Path)

James is building a new dashboard page for a client project. He opens his AI coding tool, describes what he needs: "Create a settings page with a form for user preferences, including dropdowns, toggles, and a save button. Use shadcn/ui components."

The AI generates the page. In the old world, James would eyeball the output, notice raw `<select>` elements instead of shadcn's `<Select>`, sigh, tell the AI to fix it, get back a half-fix, correct it again — three or four rounds before the code is actually right. By then he's lost 20 minutes and his flow state.

With shadcn-doctor, the AI agent runs `npx shadcn-doctor ./src/pages/settings.tsx` as part of its generation step. The tool returns findings: "Line 24: raw `<select>` detected — use `<Select>` from shadcn/ui. Line 41: raw `<button>` detected — use `<Button>`." The agent reads the structured output, fixes both violations, reruns. Clean pass. The agent presents the final code to James.

James sees the finished settings page. It uses the right components. He ships it. One prompt, done.

**Emotional arc:** Frustration -> trust -> relief. The moment James stops checking the AI's work is the moment shadcn-doctor has succeeded.

### Journey 2: AI Agent — The Autonomous Loop (Automated Consumer)

The AI coding agent receives a user prompt to build a component. It generates React/TSX code, writes it to disk, then runs shadcn-doctor as a validation step. The tool exits with code 1 and returns JSON output listing three findings with file paths, line numbers, violation types, and suggested shadcn/ui replacements.

The agent parses the JSON, applies the fixes, reruns shadcn-doctor. Exit code 0, no findings. The agent presents the validated code to the user.

If the agent can't resolve a finding after 3 attempts (e.g., ambiguous pattern), it presents the code to the user with the remaining findings flagged — transparent about what it couldn't fix.

**Key requirement:** Output must be machine-readable (JSON), deterministic, and include enough context (file, line, violation, suggestion) for an agent to act without human interpretation.

### Journey 3: James — The False Positive (Primary User, Edge Case)

James is building a custom animation component that intentionally uses a raw `<div>` with specific event handlers that don't map to any shadcn/ui component. shadcn-doctor flags it as a missed opportunity for `<Card>`.

James knows this is a legitimate custom element. He needs a way to suppress this specific finding — an inline comment like `// shadcn-doctor-ignore-next-line` or a config-level exclusion.

If suppression isn't available in MVP, the false positive must at least not block the pass/fail result in a way that breaks the AI agent loop. The tool's credibility depends on not crying wolf.

**Emotional arc:** Annoyance -> "okay, I can deal with this" -> confidence that the tool is smart enough to trust.

### Journey Requirements Summary

| Capability | Revealed By |
|---|---|
| CLI with pass/fail exit codes | Journey 1, 2 |
| AST-based detection of shadcn/ui violations | Journey 1, 2 |
| JSON output with file, line, violation type, suggestion | Journey 2 |
| Human-readable test-runner output | Journey 1 |
| Inline suppression comments (Phase 2) | Journey 3 |
| Clear, actionable finding messages | Journey 1, 2 |
| Fast execution (sub-5-second) | Journey 2 |

## Innovation & Novel Patterns

### Detected Innovation Areas

- **AI-agent-first developer tooling:** Traditional static analysis tools produce output for human interpretation. shadcn-doctor inverts this by designing output primarily for machine consumption — structured, deterministic, and actionable without human mediation.
- **Design system adoption analysis:** No existing tools analyze whether a codebase is *under-utilizing* its design system. Linters check for incorrect usage; shadcn-doctor detects *missed* usage — a fundamentally different detection model.
- **Generation-time quality gate:** Shifts design system compliance from code review (reactive) to code generation (proactive), closing the feedback loop before a human ever sees the output.

### Market Context & Competitive Landscape

- No direct competitors exist for shadcn/ui adoption analysis
- Adjacent tools (ESLint plugins, design system checkers) target human developers and check for misuse, not missed use
- The AI coding tool market is growing rapidly, but quality gates for AI-generated code are nascent — shadcn-doctor addresses this gap for one specific, high-frequency pain point

### Validation Approach

- **Dogfooding:** James uses the tool daily in his own shadcn/ui projects with AI agents. If it reduces back-and-forth to zero, the core thesis is validated.
- **False positive tracking:** Monitor the <5% false positive target. If exceeded, the innovation of "trust the tool blindly" breaks down.
- **Community signal:** Organic GitHub interest and rule contributions indicate the problem resonates beyond the author.

## Developer Tool Technical Requirements

### Architecture

- **Runtime:** Node.js 18 LTS and later
- **Language:** TypeScript — the tool itself is written in TypeScript, analyzing TypeScript/TSX source files
- **AST Parser:** Established parser (Babel, ts-morph, or TypeScript compiler API) — no custom parser
- **Distribution:** npm registry, invoked via `npx shadcn-doctor`

### Installation & Usage

- **Primary method:** `npx shadcn-doctor` (zero-install execution)
- **Alternative:** `npm install -D shadcn-doctor` for project-local installation
- **Package managers:** npm is canonical; yarn/pnpm/bun work via standard npm registry compatibility but are not explicitly tested or documented

### Documentation

- **README.md** with: quick start, usage examples, supported rules, output format documentation
- **No docs site for MVP** — README is the single source of truth
- **Code examples:** Include sample findings output (both JSON and human-readable) in README

## Functional Requirements

### Source Code Analysis

- FR1: User can scan a single TSX file for shadcn/ui adoption issues
- FR2: User can scan a directory of files recursively for shadcn/ui adoption issues
- FR3: System can parse TypeScript/TSX source files into an AST for pattern analysis
- FR4: System can detect raw HTML elements where an equivalent shadcn/ui component exists
- FR5: System can detect custom CSS-styled implementations where a shadcn/ui component would be appropriate
- FR6: System can identify the specific shadcn/ui component that should replace each detected violation

### Detection Rules

- FR7: System can evaluate source code against a built-in rule set covering all shadcn/ui component types
- FR8: System can detect missed Button, Input, Textarea, Select, Checkbox, Switch, and RadioGroup opportunities
- FR9: System can detect missed Card, Dialog, Alert, Tabs, Table, Badge, and Avatar opportunities
- FR10: System can detect missed opportunities for all other components in the shadcn/ui registry
- FR11: Each detection rule can report the file path, line number, violation type, and suggested replacement

### CLI Interface

- FR12: User can invoke the tool via `npx shadcn-doctor`
- FR13: User can specify a target path (file or directory) as a CLI argument
- FR14: User can run the tool with no arguments to scan the current working directory
- FR15: User can select output format via `--format` flag (human-readable or JSON)
- FR16: System exits with code 0 when no findings are detected
- FR17: System exits with code 1 when one or more findings are detected

### Output & Reporting

- FR18: System can produce human-readable output in test-runner style (default)
- FR19: System can produce machine-readable JSON output with structured finding data
- FR20: Each finding in output includes file path, line number, violation type, and suggested shadcn/ui replacement
- FR21: System displays a summary count of total findings at the end of output
- FR22: System displays a clear pass/fail status message

### AI Agent Integration

- FR23: JSON output schema provides sufficient context for an AI agent to interpret and fix each finding without human assistance
- FR24: System output is deterministic — identical input always produces identical output
- FR25: System can be invoked repeatedly in a fix-and-rerun loop until exit code 0 is achieved

## Non-Functional Requirements

### Performance

- Analysis completes in under 5 seconds for projects with up to 500 TSX files
- Analysis completes in under 15 seconds for projects with up to 2,000 TSX files
- Memory usage stays under 512MB for typical project sizes
- Startup time (CLI initialization to first file parsed) under 1 second

### Accuracy & Reliability

- False positive rate below 5% across all detection rules
- Zero false negatives for direct HTML-to-shadcn/ui mappings (e.g., raw `<button>` when `Button` is available)
- Deterministic output: identical source files always produce identical findings in identical order
- Graceful handling of malformed or unparseable files — skip with warning, don't crash

### Compatibility

- Runs on Node.js 18 LTS and later
- Works on macOS, Linux, and Windows
- Handles TypeScript and TSX file formats (`.ts`, `.tsx`)
- Compatible with standard monorepo structures (scans specified paths, not opinionated about project layout)

### Developer Experience

- Zero configuration required for default usage — works out of the box
- Clear, actionable error messages when the tool encounters problems (e.g., no files found, invalid path)
- `--help` flag provides complete usage documentation
