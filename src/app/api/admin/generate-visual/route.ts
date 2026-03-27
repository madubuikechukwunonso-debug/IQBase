// src/app/api/admin/generate-visual/route.ts
// ✅ FIXED: Uses experimental_generateImage (required in AI SDK v4.x)

import { experimental_generateImage as generateImage } from 'ai';
import { replicate } from '@ai-sdk/replicate';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const model = replicate.image('black-forest-labs/flux-schnell');

    const { image } = await generateImage({
      model,
      prompt,
      size: '1024x1024',
      numOutputs: 1,
    });

    // Convert binary image to base64 data URL (perfect for <img> and PDF embedding)
    const base64 = Buffer.from(image).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({ 
      success: true, 
      image: dataUrl 
    });

  } catch (error: any) {
    console.error('Admin visual generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
