import { GenerateScriptInput, GenerateScriptOutput } from '@/application/dto/generate-script.dto';

export interface GenerateScriptPort {
  execute(input: GenerateScriptInput): Promise<GenerateScriptOutput>;
}
