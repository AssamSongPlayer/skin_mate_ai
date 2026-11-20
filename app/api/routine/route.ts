import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';
import type { IndividualRoutine, Product, SkinProfile, UserProfile } from '@/types';
import { generateId } from '@/lib/validation';

function getClient(): Groq {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

const SYSTEM_PROMPT = `You are an expert dermatologist AI assistant. 
Given a list of selected skincare products, the user's skin profile, and their user profile, 
generate a detailed, structured skincare routine.

Respond ONLY with valid JSON matching this exact structure (no markdown, no extra text):
{
  "routineId": "<uuid>",
  "chatId": "<chatId from input>",
  "chatTitle": "<descriptive title>",
  "tasks": [
    {
      "taskId": "<uuid>",
      "productId": "<product productId>",
      "productName": "<product name>",
      "productCategory": "<category>",
      "action": "<clear action verb phrase e.g. 'Apply gently to damp face'>",
      "timeOfDay": "morning" | "night" | "both",
      "order": <integer starting at 1>,
      "duration": <minutes as integer>,
      "frequency": "<e.g. 'Twice daily'>",
      "instructions": "<step-by-step instructions>",
      "precautions": ["<precaution>"],
      "sourceChatId": "<chatId>"
    }
  ],
  "startDate": "<today YYYY-MM-DD>",
  "reviewDate": "<4 weeks from today YYYY-MM-DD>",
  "status": "active",
  "version": 1,
  "notes": "<overall routine notes>",
  "createdAt": "<ISO timestamp>",
  "updatedAt": "<ISO timestamp>"
}

Order tasks by correct skincare application order (cleanser → toner → serum → moisturizer → sunscreen for AM).
Assign timeOfDay based on product type and ingredients (e.g., retinol = night, SPF = morning).`;

export async function POST(request: NextRequest) {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
    return NextResponse.json(
      { error: 'GROQ_API_NOT_CONFIGURED', message: 'GROQ API key not configured.' },
      { status: 503 }
    );
  }

  let body: {
    chatId?: string;
    selectedProducts?: Product[];
    skinProfile?: SkinProfile;
    userProfile?: UserProfile;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON', message: 'Invalid request body.' }, { status: 400 });
  }

  const { chatId, selectedProducts, skinProfile, userProfile } = body;

  if (!chatId || !selectedProducts?.length) {
    return NextResponse.json(
      { error: 'MISSING_FIELDS', message: 'chatId and selectedProducts are required.' },
      { status: 400 }
    );
  }

  const userMessage = `
Chat ID: ${chatId}
Skin Profile: ${JSON.stringify(skinProfile ?? {}, null, 2)}
User Profile: ${JSON.stringify(userProfile ?? {}, null, 2)}
Selected Products: ${JSON.stringify(selectedProducts, null, 2)}

Generate the individual skincare routine JSON now.
`.trim();

  try {
    const model = process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b';
    const completion = await getClient().chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      stream: false,
      response_format: { type: 'json_object' },
    });

    const rawContent = completion.choices[0]?.message?.content ?? '{}';
    let routine: IndividualRoutine;
    try {
      routine = JSON.parse(rawContent) as IndividualRoutine;
      // Ensure IDs are present
      if (!routine.routineId) routine.routineId = generateId();
      routine.chatId = chatId;
    } catch {
      return NextResponse.json(
        { error: 'PARSE_ERROR', message: 'AI returned malformed JSON.', raw: rawContent },
        { status: 500 }
      );
    }

    return NextResponse.json({ routine });
  } catch (err: unknown) {
    if (err instanceof Groq.APIError) {
      return NextResponse.json(
        { error: 'GROQ_API_ERROR', message: err.message },
        { status: err.status ?? 500 }
      );
    }
    console.error('[api/routine] Unexpected error:', err);
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: 'Unexpected error.' }, { status: 500 });
  }
}
