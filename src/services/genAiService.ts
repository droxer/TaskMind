import { GenAiGoalBreakdownResponse } from '@/types';
import { t } from '@/i18n';

interface GoalBreakdownInput {
  goal: string;
  targetDate?: string;
  context?: string;
  signal?: AbortSignal;
}

function getFallbackResponse(): GenAiGoalBreakdownResponse {
  return {
    summary: t('genAi.fallback.summary'),
    tasks: [
      { title: t('genAi.fallback.taskClarify'), priority: 'high' },
      { title: t('genAi.fallback.taskBlockers'), priority: 'medium' },
      { title: t('genAi.fallback.taskMilestones'), priority: 'medium' }
    ]
  };
}

export async function requestGoalBreakdown(
  input: GoalBreakdownInput
): Promise<GenAiGoalBreakdownResponse> {
  const endpoint = process.env.EXPO_PUBLIC_GENAI_ENDPOINT;
  if (!endpoint) {
    return getFallbackResponse();
  }

  const { signal, ...payload } = input;

  try {
    const response = await fetch(`${endpoint}/goal-breakdown`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal
    });

    if (!response.ok) {
      throw new Error(`GenAI endpoint failed: ${response.status}`);
    }

    const data = (await response.json()) as GenAiGoalBreakdownResponse;
    if (!data?.tasks?.length) {
      throw new Error('Malformed GenAI response');
    }
    return data;
  } catch (error) {
    console.warn('GenAI breakdown failed – using fallback', error);
    return getFallbackResponse();
  }
}
