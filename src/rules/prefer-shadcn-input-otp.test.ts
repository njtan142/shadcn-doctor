import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnInputOtp } from './prefer-shadcn-input-otp.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

describe('prefer-shadcn-input-otp rule', () => {
  const project = new Project();

  it('should detect <input maxLength="1" /> (string literal)', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_input_otp_maxlen_str__.tsx',
      `export const Test = () => <input maxLength="1" />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnInputOtp], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-input-otp',
      replacement: 'InputOTP',
    });
  });

  it('should detect <input maxLength={1} /> (JSX expression)', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_input_otp_maxlen_expr__.tsx',
      `export const Test = () => <input maxLength={1} />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnInputOtp], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-input-otp',
      replacement: 'InputOTP',
    });
  });

  it('should detect <input> with className containing "otp"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_input_otp_classname__.tsx',
      `export const Test = () => <input className="otp-field" />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnInputOtp], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-input-otp',
      replacement: 'InputOTP',
    });
  });

  it('should detect <div> with className containing "otp"', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_input_otp_div__.tsx',
      `export const Test = () => <div className="otp-container"><input /></div>;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnInputOtp], rootDir);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-input-otp',
      replacement: 'InputOTP',
    });
  });

  it('should not flag shadcn/ui InputOTP component', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_input_otp_clean__.tsx',
      `import { InputOTP } from '@/components/ui/input-otp';
export const Clean = () => <InputOTP maxLength={6} />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnInputOtp], rootDir);
    expect(findings).toHaveLength(0);
  });

  it('should not flag <input maxLength="6" />', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_input_otp_maxlen6__.tsx',
      `export const Clean = () => <input maxLength="6" />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnInputOtp], rootDir);
    expect(findings).toHaveLength(0);
  });

  it('should not flag a plain <input type="text" />', () => {
    const sourceFile = project.createSourceFile(
      '__test_prefer_shadcn_input_otp_notext__.tsx',
      `export const Clean = () => <input type="text" />;`,
      { overwrite: true },
    );
    const { findings } = runRules(sourceFile, [preferShadcnInputOtp], rootDir);
    expect(findings).toHaveLength(0);
  });
});
