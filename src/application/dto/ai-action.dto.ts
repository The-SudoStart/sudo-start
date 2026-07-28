import { Package } from '@/types';

export interface ParsedAIAction {
  type: 'add' | 'remove';
  packages: Array<{ pkg: Package; versionId?: string }>;
}

export interface ParsedAIResponse {
  text: string;
  action: ParsedAIAction | null;
  executed: boolean;
}
