# Deferred Work

## Deferred from: code review of 1-6-cli-argument-handling-error-cases (2026-03-29)

- Single non-TS file (e.g. `.js`) passed as explicit path produces "No TypeScript files found in: {path}" — misleading because the file exists but has the wrong type. Needs a distinct error or message for this case (`src/analyzer.ts`, `src/scanner/scanner.ts`).
- TOCTOU race: `analyzer.ts` does `fs.stat` then `discoverFiles` also does `fs.stat` — path could vanish between the two, producing an unformatted scanner error. Both stat calls should ideally be a single stat with the result passed down, or the scanner error should be normalized (`src/analyzer.ts:12`, `src/scanner/scanner.ts:8`).
- All-warnings scan: if every discovered file fails to parse and returns a Warning, `filesScanned` stays 0 and `pass: true` is returned with no findings — this may surprise users scanning a directory where all files are unparseable. Consider throwing "No files could be parsed" in this case (`src/analyzer.ts:28-41`).

## Deferred from: code review of 1-5-input-textarea-and-select-detection-rules (2026-03-29)

- Integration test creates inline source file at a `projectRoot`-resolved path; if `projectRoot` resolves differently in CI the file-outside-root guard fires, producing 0 findings and a misleading test failure (`src/rules/all-rules-integration.test.ts:28`)
- Self-closing `<textarea />` and `<select />` JSX variants are handled by the rules but have no dedicated test exercising that path — regression risk if `nodeTypes` changes in future (`src/rules/prefer-shadcn-textarea.ts`, `prefer-shadcn-select.ts`)
- `absoluteFilePath` from ts-morph may contain URI-encoded characters (e.g. `%20` for spaces), causing the `startsWith` path guard in `runRules` to fail and silently skip the file with a warning instead of processing it (`src/engine/rule-engine.ts:15`)
