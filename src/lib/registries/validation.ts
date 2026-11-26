import type { RegistrySearchResult, RegistryType } from './types';

const NAME_PATTERNS: Record<RegistryType, RegExp> = {
  npm: /^(?:@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._+~-]*$/i,
  homebrew: /^[a-z0-9][a-z0-9._+~-]*(?:@[a-z0-9][a-z0-9._+~-]*)?$/i,
  pypi: /^[a-z0-9][a-z0-9._-]*$/i,
  apt: /^[a-z0-9][a-z0-9+.-]*$/,
};

// Versions from registries are metadata. Install commands use only validated names.
const VERSION_PATTERN = /^[a-z0-9][a-z0-9._+!:~-]*$/i;

export function isSafeRegistryResult(registry: RegistryType, result: RegistrySearchResult): boolean {
  return typeof result.name === 'string' && result.name.length <= 120 &&
    NAME_PATTERNS[registry].test(result.name) &&
    typeof result.version === 'string' && result.version.length <= 50 &&
    VERSION_PATTERN.test(result.version);
}
