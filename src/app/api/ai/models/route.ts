
import { NextResponse } from 'next/server';
import { llm } from '@/lib/llm';

interface Model {
  id: string;
  created: number;
  owned_by: string;
}

export async function GET() {
  try {
    if (!llm) {
      return NextResponse.json({ error: 'AI provider not configured' }, { status: 500 });
    }

    const models = await llm.models.list();
    return NextResponse.json({
      models: models.data.map((m: Model) => ({
        id: m.id,
        created: m.created
      }))
    });
  } catch (error) {
    console.error('Models list error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch models',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
