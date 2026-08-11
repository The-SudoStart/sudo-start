import { describe, expect, it } from 'vitest';
import { GetPreviewCommandUseCase } from './get-preview-command.use-case';
import { Package } from '@/types';

const createPackage = (overrides: Partial<Package> = {}): Package => ({
  id: 'test',
  name: 'Test',
  description: 'Test package',
  category: 'tools',
  platforms: { macos: true, linux: true },
  defaultVersion: 'stable',
  versions: [
    { id: 'stable', label: 'Stable', macCommand: 'brew install test', linuxCommand: 'sudo apt install test' },
    { id: '1.0.0', label: 'v1.0.0', macCommand: 'brew install test@1.0.0', linuxCommand: 'sudo apt install test=1.0.0' },
  ],
  macosCommandTemplate: 'brew install test@${VERSION}',
  linuxCommandTemplate: 'sudo apt install test=${VERSION_NO_V}',
  ...overrides,
});

describe('GetPreviewCommandUseCase', () => {
  const useCase = new GetPreviewCommandUseCase();

  it('should return empty string when platform is null', () => {
    const pkg = createPackage();
    
    const result = useCase.execute({ package: pkg, platform: null, version: 'stable' });
    
    expect(result).toBe('');
  });

  it('should return macOS command for stable version', () => {
    const pkg = createPackage();
    
    const result = useCase.execute({ package: pkg, platform: 'macos', version: 'stable' });
    
    expect(result).toBe('brew install test');
  });

  it('should return Linux command for stable version', () => {
    const pkg = createPackage();
    
    const result = useCase.execute({ package: pkg, platform: 'linux', version: 'stable' });
    
    expect(result).toBe('sudo apt install test');
  });

  it('should use template with VERSION placeholder', () => {
    const pkg = createPackage();
    
    const result = useCase.execute({ package: pkg, platform: 'macos', version: '1.0.0' });
    
    expect(result).toBe('brew install test@v1.0.0');
  });

  it('should use template with VERSION_NO_V placeholder', () => {
    const pkg = createPackage();
    
    const result = useCase.execute({ package: pkg, platform: 'linux', version: '1.0.0' });
    
    expect(result).toBe('sudo apt install test=1.0.0');
  });

  it('should handle version already starting with v', () => {
    const pkg = createPackage();
    
    const result = useCase.execute({ package: pkg, platform: 'macos', version: 'v1.0.0' });
    
    expect(result).toBe('brew install test@v1.0.0');
  });

  it('should handle version with major.minor.patch', () => {
    const pkg = createPackage({
      macosCommandTemplate: 'brew install test@${VERSION_MAJOR}',
    });
    
    const result = useCase.execute({ package: pkg, platform: 'macos', version: '2.5.3' });
    
    expect(result).toBe('brew install test@2');
  });

  it('should fall back to version entry command when no template', () => {
    const pkg = createPackage({
      macosCommandTemplate: undefined,
    });
    
    const result = useCase.execute({ package: pkg, platform: 'macos', version: '1.0.0' });
    
    expect(result).toBe('brew install test@1.0.0');
  });

  it('should use template for unknown version when template exists', () => {
    const pkg = createPackage();
    
    const result = useCase.execute({ package: pkg, platform: 'macos', version: 'unknown' });
    
    // When template exists and version is not generic, it uses the template
    expect(result).toBe('brew install test@vunknown');
  });

  it('should use template for latest version', () => {
    const pkg = createPackage({
      versions: [
        { id: 'latest', label: 'Latest', macCommand: 'brew install test', linuxCommand: 'sudo apt install test' },
      ],
    });
    
    const result = useCase.execute({ package: pkg, platform: 'macos', version: 'latest' });
    
    // 'latest' is considered generic, so it uses the version entry command
    expect(result).toBe('brew install test');
  });
});
