
import OpenAI from 'openai';

let _llm: any = null;
let providerName = 'none';

// Support Nebius provider via NEBIUS_API_KEY (+ optional NEBIUS_BASE_URL)
if (process.env.NEBIUS_API_KEY) {
  try {
    const opts: any = { apiKey: process.env.NEBIUS_API_KEY, timeout: 30000, maxRetries: 3 };
    // Nebius base URL should include /v1 path; if not provided, use default
    const baseUrl = process.env.NEBIUS_BASE_URL || 'https://api.studio.nebius.ai/v1';
    opts.baseURL = baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl}/v1`;
    _llm = new OpenAI(opts);
    providerName = 'nebius';
    console.info('Using Nebius AI provider with baseURL:', opts.baseURL);
  } catch (err) {
    console.error('Failed to initialize Nebius client:', err);
  }
}

// Fallback to official OpenAI if provided
if (!_llm && process.env.OPENAI_API_KEY) {
  try {
    _llm = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 30000, maxRetries: 3 });
    providerName = 'openai';
    console.info('Using OpenAI provider');
  } catch (err) {
    console.error('Failed to initialize OpenAI client:', err);
  }
}

if (!_llm) {
  console.warn('No AI API key configured — AI endpoints will return an error at runtime.');
}

export const llm = _llm;
export const LLM_PROVIDER = providerName;
export const DEFAULT_LLM = process.env.NEBIUS_DEFAULT_MODEL || process.env.OPENAI_DEFAULT_MODEL || 'gpt-3.5-turbo';

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
