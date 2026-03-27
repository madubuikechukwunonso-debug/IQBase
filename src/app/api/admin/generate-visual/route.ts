// src/app/api/admin/generate-visual/route.ts
// ✅ DIAGNOSTIC VERSION – shows exact error

import { generateImage } from 'ai';
import { replicate } from '@ai-sdk/replicate';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is missing in Vercel environment variables');
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const model = replicate.image('black-forest-labs/flux-schnell');

    const { image } = await generateImage({
      model,
      prompt: prompt.trim(),
      aspectRatio: '1:1',
    });

    const base64 = Buffer.from(image.uint8Array).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({
      success: true,
      image: dataUrl,
    });

  } catch (error: any) {
    console.error('=== FULL IMAGE GENERATION ERROR ===');
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate image',
        details: error.stack || 'No stack trace',
      },
      { status: 500 }
    );
  }
}
