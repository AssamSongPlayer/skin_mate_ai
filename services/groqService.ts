import {
  ChatMessage,
  UserProfile,
  GroqChatResponse,
  IndividualRoutine,
  MasterTimetable,
  Product,
  SkinProfile,
} from '@/types';

export async function sendChatMessage(
  chatId: string,
  messages: ChatMessage[],
  systemPrompt: string,
  userProfile: UserProfile | null
): Promise<GroqChatResponse> {
  const payloadMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: payloadMessages,
      systemPrompt,
      userProfile,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 503) {
      throw new Error(
        errorData.message ||
          'GROQ API key is not configured. Please add GROQ_API_KEY to .env.local.'
      );
    }
    throw new Error(errorData.message || `Server error (${res.status})`);
  }

  const data = await res.json();
  const rawContent = data.content || '';

  // Attempt to parse JSON blocks from AI response
  try {
    const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/) || rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      if (parsed && typeof parsed === 'object') {
        return parsed as GroqChatResponse;
      }
    }
  } catch (err) {
    // Non-JSON plain text response is expected in normal conversation turns
  }

  return {
    type: 'text',
    message: rawContent,
  };
}

export async function generateIndividualRoutine(
  chatId: string,
  selectedProducts: Product[],
  skinProfile: SkinProfile,
  userProfile: UserProfile | null
): Promise<IndividualRoutine> {
  const res = await fetch('/api/routine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chatId,
      selectedProducts,
      skinProfile,
      userProfile,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to generate skincare routine.');
  }

  const data = await res.json();
  return data.routine;
}

export async function generateMasterTimetable(
  routines: IndividualRoutine[],
  existingTimetable: MasterTimetable | null,
  userProfile: UserProfile | null
): Promise<MasterTimetable> {
  const res = await fetch('/api/timetable', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      routines,
      existingTimetable,
      userProfile,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to generate master timetable.');
  }

  const data = await res.json();
  return data.timetable;
}
