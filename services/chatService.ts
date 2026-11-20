import { UserProfile, SkinProfile, ChatMessage } from '@/types';

export function buildSystemPrompt(
  userProfile: UserProfile | null,
  skinProfile?: Partial<SkinProfile>
): string {
  const profileDetails = userProfile
    ? `User Profile:
- Name: ${userProfile.name || 'Friend'}
- Age: ${userProfile.age || 'Not specified'}
- Skin Type: ${userProfile.skinType || 'Unknown'}
- Known Allergies: ${userProfile.allergies?.join(', ') || 'None reported'}
- Budget Level: ${userProfile.budget || 'Medium'}
- Current Products: ${userProfile.currentProducts?.join(', ') || 'None specified'}
- Skin Goals: ${userProfile.skinGoals?.join(', ') || 'General skin health'}`
    : 'No profile details available yet.';

  return `You are Skin Mate, an intelligent, empathetic, and knowledgeable AI skincare assistant.
${profileDetails}

Your job:
1. Conduct a natural, thoughtful skincare consultation.
2. Ask only ONE or TWO targeted follow-up questions at a time to diagnose and understand the user's skin concerns (duration, triggers, sensitivity, past treatments).
3. Do NOT overwhelm the user with long questionnaires or checklists.
4. When presenting a timetable or routine overview in text, use clean markdown tables (| Time | Step | What to Do | Quick Tips |) or clear bullet points so the user can easily read and follow.
5. When you have collected adequate information and are ready to recommend skincare products, output a structured JSON code block formatted as:
\`\`\`json
{
  "type": "product_recommendation",
  "message": "Based on our conversation, here are my personalized product recommendations for you:",
  "products": [
    {
      "productId": "prod_1",
      "name": "Gentle Hydrating Cleanser",
      "brand": "CeraVe",
      "category": "cleanser",
      "ingredients": ["Ceramides", "Hyaluronic Acid", "Glycerin"],
      "keyIngredients": ["Ceramides", "Hyaluronic Acid"],
      "reason": "Replenishes skin barrier without stripping natural oils.",
      "usageInstructions": "Massage onto wet skin for 60 seconds morning and night, then rinse.",
      "frequency": "Twice daily",
      "precautions": ["Avoid contact with eyes"],
      "timeOfDay": "both",
      "approximatePrice": "$14 - $18",
      "selectedStatus": false,
      "isOwned": false
    }
  ],
  "allowMultipleSelection": true,
  "nextAction": "await_product_selection"
}
\`\`\`
6. Provide realistic, scientifically sound ingredients and clear product usage guidance.
7. When the user asks for alternatives, budget options, or ingredient questions, respond helpfully and adapt your recommendations.
8. Emphasize safety: never guarantee medical diagnoses, and advise consulting a certified dermatologist for severe cystic acne, sudden rashes, or abnormal lesions.`;
}

export function extractConcernSummary(messages: ChatMessage[], existingConcern?: string): { title: string; concern: string } {
  const allText = messages
    .map((m) => m.content)
    .join(' ');

  let concern = 'General Skin Care';
  let title = 'Skin Assessment';

  if (/cystic|cyst/i.test(allText)) {
    concern = 'Cystic Acne';
    title = 'Cystic Acne Assessment';
  } else if (/acne|pimple|breakout|blackhead|whitehead|papule|pustule/i.test(allText)) {
    concern = 'Acne & Breakouts';
    title = 'Acne & Breakout Care';
  } else if (/dark spot|pigment|hyperpigmentation|melasma|sun spot/i.test(allText)) {
    concern = 'Dark Spots & Pigmentation';
    title = 'Dark Spot & Brightening Care';
  } else if (/dry|flak|dehydrat|tight/i.test(allText)) {
    concern = 'Dryness & Dehydration';
    title = 'Dry Skin & Barrier Repair';
  } else if (/oil|sebum|shiny|greas|enlarged pore/i.test(allText)) {
    concern = 'Excess Oil & Large Pores';
    title = 'Oil Control & Pore Care';
  } else if (/sensitive|rosacea|irritat|burn|sting/i.test(allText)) {
    concern = 'Skin Sensitivity & Redness';
    title = 'Sensitive Skin Soothing Care';
  } else if (/wrinkle|fine line|aging|sag/i.test(allText)) {
    concern = 'Anti-Aging & Fine Lines';
    title = 'Anti-Aging & Firming Assessment';
  } else if (existingConcern && existingConcern !== 'General Skincare') {
    concern = existingConcern;
    title = `${existingConcern} Assessment`;
  }

  return { title, concern };
}
