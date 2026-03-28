# Story 1.1: project-initialization-cli-skeleton

Status: ready-for-dev

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

- [ ] Task 1: Initialize Project and Setup Package (AC: 1, 2)
  - [ ] Initialize `package.json` and set type to module
  - [ ] Install production dependencies: `commander` and `ts-morph`
  - [ ] Install dev dependencies: `typescript`, `tsdown`, `vitest`, `@biomejs/biome`, `@types/node`
  - [ ] Setup `bin/shadcn-doctor.js` pointing to `dist/cli.js`
- [ ] Task 2: Configure Tooling (AC: 1, 4, 5)
  - [ ] Configure `tsconfig.json` for ESM and strict mode
  - [ ] Configure `tsdown.config.ts` for ESM compilation to `dist/`
  - [ ] Configure `vitest.config.ts`
  - [ ] Configure `biome.json`
  - [ ] Add `build`, `lint`, and `test` scripts to `package.json`
- [ ] Task 3: Setup Project Structure and Shared Types (AC: 6)
  - [ ] Create `src/` directory and subdirectories: `scanner/`, `parser/`, `engine/`, `rules/`, `formatters/`, `__fixtures__/`
  - [ ] Create barrel `index.ts` files in each subdirectory
  - [ ] Define shared types in `src/types.ts`: `Finding`, `Rule`, `AnalysisResult`, `Warning`
- [ ] Task 4: Implement CLI Entry Point (AC: 3)
  - [ ] Create `src/cli.ts` using Commander
  - [ ] Setup arguments (`[path]`) and `--format` flag
  - [ ] Add `--help` description and `--version`
  - [ ] Implement cleanly exiting process logic

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

Gemini 2.5 Pro

### Debug Log References

### Completion Notes List

### File List

