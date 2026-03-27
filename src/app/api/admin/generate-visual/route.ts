// src/app/api/admin/generate-visual/route.ts
// ✅ CLEAN & FINAL VERSION FOR AI SDK v6 + @ai-sdk/replicate v2
// (No experimental_, no casts, no Buffer conversion needed)

import { generateImage } from 'ai';
import { replicate } from '@ai-sdk/replicate';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const model = replicate.image('black-forest-labs/flux-schnell');

    const { image } = await generateImage({
      model,
      prompt: prompt.trim(),
      n: 1,
      size: '1024x1024',
    });

    // ✅ NEW in AI SDK v6: image is a GeneratedFile object with .base64 already ready
    const dataUrl = `data:image/png;base64,${image.base64}`;

    return NextResponse.json({
      success: true,
      image: dataUrl,
    });

  } catch (error: any) {
    console.error('Admin visual generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
