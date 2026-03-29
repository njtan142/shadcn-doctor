# Story 1.1: project-initialization-cli-skeleton

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer contributing to shadcn-doctor,
I want the project scaffolded with TypeScript, build tooling, test framework, and a working CLI entry point,
So that development can begin on a solid, consistent foundation.

## Acceptance Criteria

1. **Given** the project directory is initialized **When** I run `npm run build` **Then** tsdown compiles `src/` to `dist/` with ESM output and declaration files **And** `bin/shadcn-doctor.js` exists as the npm bin entry point pointing to `dist/cli.js`
2. **Given** the project has dependencies installed **When** I check the production dependencies **Then** `commander` and `ts-morph` are installed **And** `typescript`, `tsdown`, `vitest`, `@biomejs/biome`, and `@types/node` are dev dependencies
3. **Given** the CLI entry point exists at `src/cli.ts` **When** I run `npx shadcn-doctor --help` **Then** Commander displays usage documentation with available options (path argument, --format flag) **And** the process exits cleanly
4. **Given** the project has Biome configured **When** I run `npm run lint` **Then** Biome checks the codebase for lint and formatting issues
5. **Given** the project has Vitest configured **When** I run `npm test` **Then** Vitest discovers and runs `*.test.ts` files from `src/`
6. **Given** the project structure is created **When** I inspect the `src/` directory **Then** the following directories exist: `scanner/`, `parser/`, `engine/`, `rules/`, `formatters/`, `__fixtures__/` **And** `types.ts` exists with the `Finding`, `Rule`, `AnalysisResult`, and `Warning` type definitions **And** each module directory has a barrel `index.ts` file

## Tasks / Subtasks

- [x] Task 1: Initialize Project and Setup Package (AC: 1, 2)
  - [x] Initialize `package.json` and set type to module
  - [x] Install production dependencies: `commander` and `ts-morph`
  - [x] Install dev dependencies: `typescript`, `tsdown`, `vitest`, `@biomejs/biome`, `@types/node`
  - [x] Setup `bin/shadcn-doctor.js` pointing to `dist/cli.js`
- [x] Task 2: Configure Tooling (AC: 1, 4, 5)
  - [x] Configure `tsconfig.json` for ESM and strict mode
  - [x] Configure `tsdown.config.ts` for ESM compilation to `dist/`
  - [x] Configure `vitest.config.ts`
  - [x] Configure `biome.json`
  - [x] Add `build`, `lint`, and `test` scripts to `package.json`
- [x] Task 3: Setup Project Structure and Shared Types (AC: 6)
  - [x] Create `src/` directory and subdirectories: `scanner/`, `parser/`, `engine/`, `rules/`, `formatters/`, `__fixtures__/`
  - [x] Create barrel `index.ts` files in each subdirectory
  - [x] Define shared types in `src/types.ts`: `Finding`, `Rule`, `AnalysisResult`, `Warning`
- [x] Task 4: Implement CLI Entry Point (AC: 3)
  - [x] Create `src/cli.ts` using Commander
  - [x] Setup arguments (`[path]`) and `--format` flag
  - [x] Add `--help` description and `--version`
  - [x] Implement cleanly exiting process logic

## Dev Notes

- **Technical Stack:** Node.js 18+ LTS, TypeScript (strict, ESM), Commander for CLI, tsdown for bundling, Vitest 4.x for testing, Biome for lint/formatting.

### Project Structure Notes

- kebab-case for all files (e.g., `cli.ts`, `types.ts`).
- PascalCase for types (no `I` prefix), camelCase for functions.
- Named exports only, no default exports anywhere.
- Use `bin/shadcn-doctor.js` as the npm bin entry point, strictly forwarding to `dist/cli.js`.
- Error Handling boundary: Process never crashes on bad input, use `try/catch`. CLI entry point defines exit code.

### References

- [Source: `_bmad-output/planning-artifacts/architecture.md`#Starter-Template-Evaluation]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Implementation-Patterns-&-Consistency-Rules]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Complete-Project-Directory-Structure]
- [Source: `_bmad-output/planning-artifacts/epics.md`#Story-1.1]

## Dev Agent Record

### Agent Model Used

minimax-m2.7

### Debug Log References

### Completion Notes List

- Fixed tsdown config to output `.js` extension instead of `.mjs` by adding `fixedExtension: false`
- Fixed bin/shadcn-doctor.js to properly use Commander for argument parsing instead of directly calling `run()`

### File List

- tsdown.config.ts (modified: added `fixedExtension: false`)
- bin/shadcn-doctor.js (modified: use Commander properly)

## Change Log

- 2026-03-29: Initial implementation complete. Fixed tsdown ESM output to use `.js` extension via `fixedExtension: false`. Fixed bin entry to use Commander for proper `--help` handling.

