import { Package, Category } from '@/types';

export type RegistryType = 'homebrew' | 'npm' | 'pypi' | 'apt';

export interface RegistryConfig {
  id: RegistryType;
  name: string;
  description: string;
  enabled: boolean;
  baseUrl?: string;
}

export interface RegistrySearchResult {
  name: string;
  description: string;
  version: string;
  homepage?: string;
  license?: string;
}

export interface RegistryAdapter {
  id: RegistryType;
  search(query: string, limit?: number): Promise<RegistrySearchResult[]>;
  toPackage(result: RegistrySearchResult, category?: Category): Package;
}

export const defaultRegistries: RegistryConfig[] = [
  {
    id: 'homebrew',
    name: 'Homebrew',
    description: 'macOS package manager',
    enabled: true,
    baseUrl: 'https://formulae.brew.sh/api',
  },
  {
    id: 'npm',
    name: 'npm',
    description: 'Node.js package registry',
    enabled: true,
    baseUrl: 'https://registry.npmjs.org',
  },
  {
    id: 'pypi',
    name: 'PyPI',
    description: 'Python package index',
    enabled: true,
    baseUrl: 'https://pypi.org/pypi',
  },
  {
    id: 'apt',
    name: 'APT',
    description: 'Debian/Ubuntu package manager',
    enabled: true,
  },
];
