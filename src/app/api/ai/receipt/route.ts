
import { NextRequest, NextResponse } from 'next/server';
import { llm, DEFAULT_LLM, validateModel } from '@/lib/llm';

interface Receipt {
  vendor: string;
  date: string;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    // Validate request
    const body = await req.json();
    if (!body.imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Validate model availability
    const isModelValid = await validateModel();
    if (!isModelValid) {
      return NextResponse.json(
        { error: 'AI service is not available' },
        { status: 503 }
      );
    }

    // Prepare message for AI
    const systemPrompt = `You are an expert receipt analyzer. Extract information from the receipt image.
Return ONLY valid JSON with this exact structure:
{
  "vendor": "Business name",
  "date": "YYYY-MM-DD",
  "currency": "TZS",
  "subtotal": number,
  "tax": number,
  "total": number,
  "items": [
    {
      "description": "Item description",
      "quantity": number,
      "unitPrice": number,
      "total": number
    }
  ]
}`;

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract the receipt information from the image.'
          },
          {
            type: 'image_url',
            image_url: {
              url: body.imageUrl,
              detail: 'high'
            }
          }
        ]
      }
    ] satisfies Array<{
      role: 'system' | 'user';
      content: string | Array<{
        type: 'text' | 'image_url';
        text?: string;
        image_url?: {
          url: string;
          detail?: 'low' | 'high';
        };
      }>;
    }>;

    // Call AI service
    if (!llm) {
      return NextResponse.json({ error: 'AI provider not configured' }, { status: 500 });
    }
    const client = llm;
    const completion = await client.chat.completions.create({
      model: DEFAULT_LLM,
      temperature: 0,
      messages
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      throw new Error('No response from AI service');
    }

    // Parse and validate response
    let receipt: Receipt;
    try {
      receipt = JSON.parse(text);
      
      // Basic validation
      if (!receipt.vendor || !receipt.date || !receipt.total || !Array.isArray(receipt.items)) {
        throw new Error('Invalid receipt format');
      }
    } catch (e) {
      console.error('Receipt parsing error:', e);
      console.error('AI raw response:', text);
      return NextResponse.json(
        { error: 'Failed to parse receipt' },
        { status: 500 }
      );
    }

    return NextResponse.json({ receipt });
  } catch (error) {
    console.error('Receipt processing error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process receipt',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
