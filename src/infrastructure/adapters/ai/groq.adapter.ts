import Groq from 'groq-sdk';
import { AIProvider } from '@/application/ports/outgoing/ai-provider.port';
import { ChatMessage } from '@/types';
import { isValidGroqApiKey } from '@/lib/security';

let groq: Groq | null = null;

function getGroqClient() {
  if (!groq) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not defined');
    }

    if (!isValidGroqApiKey(apiKey)) {
      console.error('[Security] Invalid GROQ_API_KEY format detected');
      throw new Error('Invalid GROQ_API_KEY format');
    }

    groq = new Groq({ apiKey });
  }

  return groq;
}

function buildSystemPrompt(bucketContext: string[]): ChatMessage {
  const bucketSection = bucketContext.length > 0
    ? `\n\nCurrent bucket (already selected by the user): ${bucketContext.join(', ')}.`
    : '\n\nCurrent bucket: empty.';

  return {
    role: 'assistant',
    content: `You are "Root", an expert Unix system administrator and helpful AI assistant for the SudoStart application.

Your purpose is to help users set up their development environment by recommending software packages and tools.

Start every response with a JSON object. Do not output plain text outside the JSON.
The JSON Schema is:
{
  "response": "Your conversational response to the user here (use Markdown)",
  "action": {
    "type": "add" | "remove",
    "packageIds": ["id1", "id2", "id3:version"]
  }
}
The "action" field is OPTIONAL. Only include it if the user explicitly asks to add or remove packages.

Full Package Catalog:
IDEs: windsurf, cursor, zed, vscode, vim, intellij
Browsers: zen-browser, arc, vivaldi, brave, google-chrome, microsoft-edge, firefox
Runtimes: nvm, nodejs, npm, python3, ruby, php, kotlin, rust, go, java, cpp
Package Managers: pnpm, yarn, pyenv, rbenv, sdkman
Build Tools: make, cmake, gradle, maven
Containers: docker, docker-desktop, podman, kubectl, minikube
Cloud CLIs: aws-cli, gcloud, azure-cli
Databases: postgresql, mysql, mariadb, sqlite3, redis, mongodb
Terminals: iterm2, warp, alacritty, kitty, hyper, ghostty
Frameworks: react, vue, angular, nextjs, django, flask, express
DevOps: jenkins, prometheus, docker-compose
Data Science: jupyter, tensorflow, pandas, numpy, matplotlib
Mobile: flutter, react-native, ionic, cordova, xcode
Game Dev: godot, blender, unity, unreal-engine
Desktop Dev: electron, tauri, qt
Web Servers: nginx, apache
Utilities: jq, wget, htop, tmux, openssh, ngrok, insomnia
Communication: zoom, microsoft-teams, telegram, slack, discord
Productivity: rectangle, raycast, 1password, bitwarden, docker-desktop
Tools: git, curl, zsh, oh-my-zsh, terraform, ansible, github-cli, postman, figma
${bucketSection}

Keep responses short and terminal-like. Be opinionated and helpful. Always be aware of what's already in the bucket.`,
  };
}

export class GroqAdapter implements AIProvider {
  async streamChat(messages: ChatMessage[], bucketContext: string[]): Promise<ReadableStream<Uint8Array>> {
    const client = getGroqClient();
    const stream = await client.chat.completions.create({
      messages: [
        { ...buildSystemPrompt(bucketContext), role: 'system' as const },
        ...messages,
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
    });

    const encoder = new TextEncoder();
    return new ReadableStream({
      async start(controller) {
        try {
          let fullContent = '';
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? '';
            if (delta) {
              fullContent += delta;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta, done: false })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: '', done: true, full: fullContent })}\n\n`));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }
}
