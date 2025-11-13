
import OpenAI from 'openai';

let _llm: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  _llm = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 30000, maxRetries: 3 });
} else {
  console.warn('OPENAI_API_KEY not set — AI endpoints will return an error at runtime.');
}

export const llm = _llm;
export const DEFAULT_LLM = process.env.NEBIUS_DEFAULT_MODEL || 'gpt-3.5-turbo';

export type NLLMResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function validateModel() {
  try {
  if (!llm) throw new Error('LLM client not configured');
  const models = await llm.models.list();
  const isValidModel = models.data.some((m: any) => m.id === DEFAULT_LLM);
    if (!isValidModel) {
      throw new Error(`Model ${DEFAULT_LLM} is not available`);
    }
    return true;
  } catch (error) {
    console.error('Model validation error:', error);
    return false;
  }
}
