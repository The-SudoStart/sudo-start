import { describe, expect, it } from 'vitest';
import { ParseAIActionUseCase } from './parse-ai-action.use-case';
import { StaticPackageRepository } from '@/infrastructure/adapters/catalog/static-package.repository';

describe('ParseAIActionUseCase', () => {
  it('extracts validated add actions from AI JSON', async () => {
    const result = await new ParseAIActionUseCase(new StaticPackageRepository()).execute(
      '{"response":"Added Git","action":{"type":"add","packageIds":["git:stable"]}}',
    );

    expect(result.text).toBe('Added Git');
    expect(result.action?.type).toBe('add');
    expect(result.action?.packages[0].pkg.id).toBe('git');
    expect(result.action?.packages[0].versionId).toBe('stable');
  });

  it('falls back to plain text when no JSON is present', async () => {
    const result = await new ParseAIActionUseCase(new StaticPackageRepository()).execute('hello');

    expect(result).toEqual({ text: 'hello', action: null, executed: false });
  });

  it('ignores unsupported actions and invalid package payloads', async () => {
    const useCase = new ParseAIActionUseCase(new StaticPackageRepository());

    await expect(useCase.execute(
      '{"response":"Nope","action":{"type":"replace","packageIds":["git"]}}',
    )).resolves.toMatchObject({ text: 'Nope', action: null, executed: true });

    const result = await useCase.execute(
      '{"response":"Filtered","action":{"type":"add","packageIds":["not-a-real-package","git:bad;version",42]}}',
    );

    expect(result.action?.packages).toEqual([]);
  });
});
