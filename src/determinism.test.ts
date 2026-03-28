import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { run } from './cli.js';

describe('Story 2.2: AI Agent Loop Validation & Determinism', () => {
  let stderrSpy: ReturnType<typeof vi.spyOn>;
  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let originalExitCode: number | undefined;
  let tempDir: string;

  beforeEach(async () => {
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    originalExitCode = process.exitCode as number | undefined;
    process.exitCode = undefined;
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'shadcn-doctor-loop-'));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    process.exitCode = originalExitCode;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('AC 3: Determinism - repeated runs produce byte-for-byte identical JSON output', async () => {
    // Create a few files with violations
    const file1 = path.join(tempDir, 'b.tsx');
    const file2 = path.join(tempDir, 'a.tsx');
    const content = 'export const App = () => <div><button>Click</button><input /></div>;';
    
    await fs.writeFile(file1, content);
    await fs.writeFile(file2, content);

    // Run 1
    await run(tempDir, 'json');
    const stdout1 = (stdoutSpy.mock.calls as unknown[][]).flat().map(String).join('');
    stdoutSpy.mockClear();

    // Run 2
    await run(tempDir, 'json');
    const stdout2 = (stdoutSpy.mock.calls as unknown[][]).flat().map(String).join('');

    expect(stdout1).toBe(stdout2);
    
    const parsed = JSON.parse(stdout1);
    // Files should be sorted: a.tsx then b.tsx
    expect(parsed.findings[0].file).toBe('a.tsx');
    expect(parsed.findings[2].file).toBe('b.tsx');
    // Findings within file should be sorted by column (line is same)
    expect(parsed.findings[0].column).toBeLessThan(parsed.findings[1].column);
  });

  it('AC 2: Fix-and-rerun loop - finding count decreases as violations are fixed', async () => {
    const filePath = path.join(tempDir, 'component.tsx');
    const originalContent = 'export const App = () => <div><button>Click</button><input /></div>;';
    await fs.writeFile(filePath, originalContent);

    // Initial run
    await run(tempDir, 'json');
    let stdout = (stdoutSpy.mock.calls as unknown[][]).flat().map(String).join('');
    let parsed = JSON.parse(stdout);
    expect(parsed.summary.total).toBe(2);
    expect(parsed.pass).toBe(false);
    stdoutSpy.mockClear();

    // Fix one violation (replace <button> with <Button>)
    const fixedOneContent = 'export const App = () => <div><Button>Click</Button><input /></div>;';
    await fs.writeFile(filePath, fixedOneContent);

    // Second run
    await run(tempDir, 'json');
    stdout = (stdoutSpy.mock.calls as unknown[][]).flat().map(String).join('');
    parsed = JSON.parse(stdout);
    expect(parsed.summary.total).toBe(1);
    expect(parsed.findings[0].element).toBe('input');
    stdoutSpy.mockClear();

    // Fix remaining violation
    const fixedAllContent = 'export const App = () => <div><Button>Click</Button><Input /></div>;';
    await fs.writeFile(filePath, fixedAllContent);

    // Final run
    await run(tempDir, 'json');
    stdout = (stdoutSpy.mock.calls as unknown[][]).flat().map(String).join('');
    parsed = JSON.parse(stdout);
    expect(parsed.summary.total).toBe(0);
    expect(parsed.pass).toBe(true);
  });

  it('AC 4: Fatal error handling in JSON mode - stdout is empty, exit code 2', async () => {
    const nonExistentPath = path.join(tempDir, 'ghost');
    
    await run(nonExistentPath, 'json');
    
    const stdout = (stdoutSpy.mock.calls as unknown[][]).flat().map(String).join('');
    const stderr = (stderrSpy.mock.calls as unknown[][]).flat().map(String).join('');

    expect(stdout).toBe('');
    expect(stderr).toContain('Path not found');
    expect(process.exitCode).toBe(2);
  });
});
