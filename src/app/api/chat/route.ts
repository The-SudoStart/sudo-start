import { NextRequest } from 'next/server';
import Groq from 'groq-sdk';
import { enforceRateLimit, getClientIP, isValidGroqApiKey, sanitizeApiKey } from '@/lib/security';
import { isBoundedString, isRecord, readJsonBody, RequestValidationError } from '@/lib/request-validation';

function getGroqClient() {
  const rawKey = process.env.GROQ_API_KEY;
  if (!rawKey) {
    throw new Error('GROQ_API_KEY is not configured on the server. Please check your environment variables.');
  }
  const apiKey = sanitizeApiKey(rawKey);
  // SECURITY: Validate API key format to catch misconfigurations early
  if (!isValidGroqApiKey(apiKey)) {
    console.error('[Security] Invalid GROQ_API_KEY format detected');
    throw new Error('Invalid GROQ_API_KEY format. Key must start with gsk_.');
  }
  return new Groq({ apiKey, timeout: 20_000, maxRetries: 1 });
}

// Rate limit: 10 requests per minute per IP
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Rate limiting check
    const clientIP = getClientIP(request);
    const rateLimit = await enforceRateLimit(`chat:${clientIP}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
          }
        }
      );
    }

    const body = await readJsonBody(request, 128 * 1024);
    if (!isRecord(body)) throw new RequestValidationError('Invalid request body');
    const { messages, bucketContext } = body;
    if (!Array.isArray(messages) || messages.length < 1 || messages.length > 30 ||
        !messages.every((message) => isRecord(message) &&
          (message.role === 'user' || message.role === 'assistant') &&
          isBoundedString(message.content, 4000))) {
      return new Response(JSON.stringify({ error: 'Invalid messages' }), { status: 400 });
    }
    if (bucketContext !== undefined && (!Array.isArray(bucketContext) ||
        bucketContext.length > 100 ||
        !bucketContext.every((item) => isBoundedString(item, 100)))) {
      throw new RequestValidationError('Invalid bucket context');
    }

    const bucketSection = Array.isArray(bucketContext) && bucketContext.length > 0
      ? `\n\nCurrent bucket (already selected by the user): ${bucketContext.join(', ')}.`
      : '\n\nCurrent bucket: empty.';

    const systemPrompt = {
      role: 'system' as const,
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

    const client = getGroqClient();
    const candidateModels = [
      process.env.GROQ_MODEL,
      'openai/gpt-oss-20b',
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-120b',
      'llama-3.1-8b-instant',
      'llama-3.3-70b-versatile',
    ].filter((m): m is string => Boolean(m && typeof m === 'string'));

    let stream = null;
    let lastError: unknown = null;

    for (const model of candidateModels) {
      try {
        stream = await client.chat.completions.create({
          messages: [systemPrompt, ...messages],
          model,
          temperature: 0.7,
          max_tokens: 1024,
          stream: true,
        });
        break;
      } catch (err: unknown) {
        lastError = err;
        const is404 = typeof err === 'object' && err !== null && 'status' in err && (err as { status: number }).status === 404;
        if (is404) {
          console.warn(`[Groq] Model ${model} not accessible (404), trying next candidate...`);
          continue;
        }
        throw err;
      }
    }

    if (!stream) {
      throw lastError || new Error('No accessible chat model found for this API key.');
    }

    // Stream the response as Server-Sent Events
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = '';
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? '';
            if (delta) {
              fullContent += delta;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ delta, done: false })}\n\n`)
              );
            }
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ delta: '', done: true, full: fullContent })}\n\n`)
          );
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
      },
    });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    // SECURITY: Never leak the API key in error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const safeErrorMessage = errorMessage.includes('gsk_')
      ? 'Internal server error'
      : errorMessage;
    
    // Log with masked key if present
    if (errorMessage.includes('gsk_')) {
      console.error('Chat API error: [REDACTED - API key detected in error]');
    } else {
      console.error('Chat API error:', error);
    }
    
    return new Response(
      JSON.stringify({ error: safeErrorMessage }),
      { status: error instanceof Error && error.message.includes('Shared Redis') ? 503 : 500 }
    );
  }
}
