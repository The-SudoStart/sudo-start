import { useMemo } from 'react';
import { clientContainer } from '@/infrastructure/config/client-container';

export function useClientUseCases() {
  return useMemo(() => clientContainer, []);
}
