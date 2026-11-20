import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

// Initialise client lazily to avoid build-time errors when the key is absent.
let _groq: Groq | null = null;
function getClient(): Groq {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

export async function POST(request: NextRequest) {
  // ── Guard: API key ────────────────────────────────────────────────────────
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
    return NextResponse.json(
      {
        error: 'GROQ_API_NOT_CONFIGURED',
        message:
          'GROQ_API_KEY is not configured. Please add your key to .env.local and restart the dev server.',
      },
      { status: 503 }
    );
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: {
    messages?: Array<{ role: string; content: string }>;
    systemPrompt?: string;
    userProfile?: unknown;
    responseFormat?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON', message: 'Request body is not valid JSON.' }, { status: 400 });
  }

  const { messages = [], systemPrompt, responseFormat } = body;

  // ── Build message array ───────────────────────────────────────────────────
  const groqMessages: Groq.Chat.ChatCompletionMessageParam[] = [];

  if (systemPrompt) {
    groqMessages.push({ role: 'system', content: systemPrompt });
  }

  for (const msg of messages) {
    if (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system') {
      groqMessages.push({ role: msg.role, content: msg.content });
    }
  }

  // ── Call Groq ─────────────────────────────────────────────────────────────
  const model = process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b';

  try {
    const completion = await getClient().chat.completions.create({
      model,
      messages: groqMessages,
      stream: false,
      ...(responseFormat === 'json_object' ? { response_format: { type: 'json_object' } } : {}),
    });

    const content = completion.choices[0]?.message?.content ?? '';
    return NextResponse.json({ content, usage: completion.usage });
  } catch (err: unknown) {
    // Handle Groq SDK errors
    if (err instanceof Groq.APIError) {
      if (err.status === 429) {
        return NextResponse.json(
          { error: 'RATE_LIMIT', message: 'Groq rate limit reached. Please try again shortly.' },
          { status: 429 }
        );
      }
      if (err.status === 401) {
        return NextResponse.json(
          { error: 'INVALID_API_KEY', message: 'The GROQ_API_KEY is invalid or expired.' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'GROQ_API_ERROR', message: err.message, status: err.status },
        { status: err.status ?? 500 }
      );
    }

    console.error('[api/chat] Unexpected error:', err);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
