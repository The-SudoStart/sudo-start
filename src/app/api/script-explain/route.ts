import { NextRequest } from 'next/server';
import Groq from 'groq-sdk';
import { checkRateLimit, isValidGroqApiKey } from '@/lib/security';

let groq: Groq | null = null;

// Rate limit: 10 requests per minute per IP
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function getGroqClient() {
  if (!groq) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not defined');
    }
    // SECURITY: Validate API key format to catch misconfigurations early
    if (!isValidGroqApiKey(apiKey)) {
      console.error('[Security] Invalid GROQ_API_KEY format detected');
      throw new Error('Invalid GROQ_API_KEY format');
    }
    groq = new Groq({ apiKey });
  }
  return groq;
}

function getClientIP(request: NextRequest): string {
  // Get IP from various headers, fallback to 'unknown'
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || realIP || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Rate limiting check
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`script-explain:${clientIP}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    
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

    const { script, packages, os, shell } = await request.json();

    if (!script || typeof script !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid script' }), { status: 400 });
    }

    if (!packages || !Array.isArray(packages)) {
      return new Response(JSON.stringify({ error: 'Invalid packages' }), { status: 400 });
    }

    // Build the AI prompt
    const packageList = packages.map((p: { name: string; description: string; category: string; version: string }) => 
      `- ${p.name} (${p.category}): ${p.description}${p.version ? ` [v${p.version}]` : ''}`
    ).join('\n');

    const systemPrompt = {
      role: 'system' as const,
      content: `You are "Root", an expert DevOps assistant for the SudoStart application. 

Your task is to explain installation scripts in plain, friendly English. Help users understand what will be installed and why.

Guidelines:
- Be concise but informative (2-4 paragraphs)
- Use markdown formatting for readability
- Highlight the purpose of the setup
- Mention any notable tools or configurations
- Keep a helpful, professional tone
- Focus on what the user will get after running the script`,
    };

    const userPrompt = {
      role: 'user' as const,
      content: `Explain this installation script in plain English:

**Target System:**
- OS: ${os}
- Shell: ${shell}

**Tools to Install (${packages.length} total):**
${packageList}

**Script Preview (first 50 lines):**
\`\`\`bash
${script.split('\n').slice(0, 50).join('\n')}
\`\`\`

Provide a brief, helpful summary of what this script does and what the user will have after running it.`,
    };

    const client = getGroqClient();
    const stream = await client.chat.completions.create({
      messages: [systemPrompt, userPrompt],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
    });

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
                encoder.encode(`data: ${JSON.stringify({ delta, done: false })}

`)
              );
            }
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ delta: '', done: true, full: fullContent })}

`)
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
    // SECURITY: Never leak the API key in error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const safeErrorMessage = errorMessage.includes('gsk_')
      ? 'Internal server error'
      : errorMessage;
    
    // Log with masked key if present
    if (errorMessage.includes('gsk_')) {
      console.error('Script explain API error: [REDACTED - API key detected in error]');
    } else {
      console.error('Script explain API error:', error);
    }
    
    return new Response(
      JSON.stringify({ error: safeErrorMessage }),
      { status: 500 }
    );
  }
}
