import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';
import type { IndividualRoutine, MasterTimetable, UserProfile } from '@/types';
import { generateId } from '@/lib/validation';

function getClient(): Groq {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

const SYSTEM_PROMPT = `You are an expert dermatologist AI assistant specialising in skincare routine optimisation.
Given multiple individual skincare routines (each from a separate consultation), merge them into a single Master Timetable.

Rules:
1. Deduplicate products that appear across multiple routines.
2. Detect ingredient conflicts (e.g., AHA/BHA with retinol, vitamin C with niacinamide in high concentrations).
3. Assign optimal times ("morning" / "night") to each activity.
4. Order activities correctly within each time slot.
5. Flag any conflicts with type, description, and recommendation.

Respond ONLY with valid JSON matching this exact structure (no markdown, no extra text):
{
  "timetableId": "<uuid>",
  "version": <integer>,
  "generatedAt": "<ISO timestamp>",
  "sourceRoutineIds": ["<routineId>"],
  "morningActivities": [
    {
      "activityId": "<uuid>",
      "productId": "<productId>",
      "productName": "<name>",
      "productCategory": "<category>",
      "action": "<action>",
      "timeOfDay": "morning",
      "scheduledTime": "07:00",
      "order": 1,
      "duration": <minutes>,
      "frequency": "<e.g. Daily>",
      "sourceChatIds": ["<chatId>"],
      "sourceRoutineIds": ["<routineId>"],
      "isShared": false,
      "notes": ""
    }
  ],
  "nightActivities": [ /* same shape, timeOfDay: "night", scheduledTime: "21:00" */ ],
  "conflicts": [
    {
      "conflictId": "<uuid>",
      "type": "ingredient_conflict" | "timing_conflict" | "frequency_conflict" | "compatibility_unknown",
      "productIds": ["<productId>"],
      "description": "<what the conflict is>",
      "recommendation": "<how to resolve>"
    }
  ],
  "status": "active",
  "aiAnalysis": "<2-3 sentence summary of the combined routine>"
}`;

export async function POST(request: NextRequest) {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
    return NextResponse.json(
      { error: 'GROQ_API_NOT_CONFIGURED', message: 'GROQ API key not configured.' },
      { status: 503 }
    );
  }

  let body: {
    routines?: IndividualRoutine[];
    existingTimetable?: MasterTimetable | null;
    userProfile?: UserProfile;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON', message: 'Invalid request body.' }, { status: 400 });
  }

  const { routines, existingTimetable, userProfile } = body;

  if (!routines?.length) {
    return NextResponse.json(
      { error: 'MISSING_FIELDS', message: 'routines array is required and must not be empty.' },
      { status: 400 }
    );
  }

  const existingVersion = existingTimetable?.version ?? 0;

  const userMessage = `
User Profile: ${JSON.stringify(userProfile ?? {}, null, 2)}
Existing Timetable Version: ${existingVersion}
Individual Routines (${routines.length}):
${JSON.stringify(routines, null, 2)}

Generate the Master Timetable JSON now. Set version to ${existingVersion + 1}.
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
    let timetable: MasterTimetable;
    try {
      timetable = JSON.parse(rawContent) as MasterTimetable;
      if (!timetable.timetableId) timetable.timetableId = generateId();
      if (!timetable.generatedAt) timetable.generatedAt = new Date().toISOString();
      timetable.status = 'active';
    } catch {
      return NextResponse.json(
        { error: 'PARSE_ERROR', message: 'AI returned malformed JSON.', raw: rawContent },
        { status: 500 }
      );
    }

    return NextResponse.json({ timetable });
  } catch (err: unknown) {
    if (err instanceof Groq.APIError) {
      return NextResponse.json(
        { error: 'GROQ_API_ERROR', message: err.message },
        { status: err.status ?? 500 }
      );
    }
    console.error('[api/timetable] Unexpected error:', err);
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: 'Unexpected error.' }, { status: 500 });
  }
}
