import { RegistryAdapter, RegistryType } from './types';
import { HomebrewAdapter } from './homebrew';
import { NpmAdapter } from './npm';
import { PyPIAdapter } from './pypi';
import { AptAdapter } from './apt';

export const registryAdapters: Record<RegistryType, RegistryAdapter> = {
  homebrew: new HomebrewAdapter(),
  npm: new NpmAdapter(),
  pypi: new PyPIAdapter(),
  apt: new AptAdapter(),
};

export { HomebrewAdapter, NpmAdapter, PyPIAdapter, AptAdapter };
export * from './types';
