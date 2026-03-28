import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { runRules } from '../engine/rule-engine.js';
import { preferShadcnAvatar } from './prefer-shadcn-avatar.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, '../__fixtures__');

describe('prefer-shadcn-avatar rule', () => {
  const project = new Project();

  it('should detect <img> elements styled as avatars', () => {
    const filePath = path.join(fixturesDir, 'raw-html-elements.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnAvatar], fixturesDir);

    expect(findings).toHaveLength(2);
    expect(findings[0]).toMatchObject({
      rule: 'prefer-shadcn-avatar',
      violation: 'Custom avatar detected. Use <Avatar> from shadcn/ui.',
      element: 'img',
      replacement: 'Avatar',
    });
    expect(findings[1]).toMatchObject({
      rule: 'prefer-shadcn-avatar',
      violation: 'Custom avatar detected. Use <Avatar> from shadcn/ui.',
      element: 'img',
      replacement: 'Avatar',
    });
  });

  it('should not detect shadcn/ui <Avatar> component', () => {
    const filePath = path.join(fixturesDir, 'clean-component.tsx');
    const sourceFile = project.addSourceFileAtPath(filePath);
    const { findings } = runRules(sourceFile, [preferShadcnAvatar], fixturesDir);

    expect(findings).toHaveLength(0);
  });
});
