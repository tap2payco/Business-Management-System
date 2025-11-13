import { NextRequest, NextResponse } from 'next/server';
import { llm, DEFAULT_LLM } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.note) {
      return NextResponse.json(
        { error: 'Note is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert invoice generator. Convert natural language into a structured invoice draft.
Return ONLY valid JSON with this exact structure:
{
  "customer": {
    "name": "Full business name",
    "address": "Complete address with street, city, state, zip",
    "email": "contact email",
    "phone": "contact phone"
  },
  "items": [
    {
      "description": "Clear product/service description",
      "quantity": number,
      "unitPrice": number,
      "taxRate": number (e.g. 0.18 for 18%)
    }
  ],
  "currency": "TZS",
  "taxRate": number (e.g. 0.18 for 18%),
  "notes": "Optional additional notes",
  "terms": "Optional payment terms",
  "dueInDays": number (default to 30)
}`;

    if (!llm) {
      console.error('AI client not configured (OPENAI_API_KEY missing)');
      return NextResponse.json({ error: 'AI provider not configured' }, { status: 500 });
    }

    console.log('Attempting AI draft with model:', DEFAULT_LLM);
    console.log('LLM client config:', {
      apiKey: llm.apiKey ? '***' : 'not set',
      baseURL: llm.baseURL
    });

    const completion = await llm.chat.completions.create({
      model: DEFAULT_LLM,
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: body.note }
      ]
    });

    const text = completion.choices[0]?.message?.content;

    if (!text) {
      throw new Error('No response from AI service');
    }

    let draft;
    try {
      draft = JSON.parse(text);
    } catch (e) {
      console.error('AI response parsing error:', e);
      console.error('AI raw response:', text);
      return NextResponse.json(
        { error: 'Invalid response format from AI service' },
        { status: 500 }
      );
    }

    return NextResponse.json({ draft });
  } catch (error) {
    console.error('AI Draft Error:', error);
    return NextResponse.json(
      {
        error: 'Error processing draft request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}