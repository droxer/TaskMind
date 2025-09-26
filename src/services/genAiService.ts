import { GenAiGoalBreakdownResponse } from '@/types';

interface GoalBreakdownInput {
  goal: string;
  targetDate?: string;
  context?: string;
}

const FALLBACK_RESPONSE: GenAiGoalBreakdownResponse = {
  summary: 'Break down goals into actionable steps to stay on track.',
  tasks: [
    { title: 'Clarify success criteria', priority: 'high' },
    { title: 'Identify potential blockers', priority: 'medium' },
    { title: 'Schedule review milestones', priority: 'medium' }
  ]
};

export async function requestGoalBreakdown(
  input: GoalBreakdownInput,
  signal?: AbortSignal
): Promise<GenAiGoalBreakdownResponse> {
  const endpoint = process.env.EXPO_PUBLIC_GENAI_ENDPOINT;
  if (!endpoint) {
    return FALLBACK_RESPONSE;
  }

  try {
    const response = await fetch(`${endpoint}/goal-breakdown`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        goal: input.goal,
        targetDate: input.targetDate,
        context: input.context
      }),
      signal
    });

    if (!response.ok) {
      throw new Error(`GenAI endpoint failed: ${response.status}`);
    }

    const payload = (await response.json()) as GenAiGoalBreakdownResponse;
    if (!payload?.tasks?.length) {
      throw new Error('Malformed GenAI response');
    }
    return payload;
  } catch (error) {
    console.warn('GenAI breakdown failed – using fallback', error);
    return FALLBACK_RESPONSE;
  }
}
