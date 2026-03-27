// src/app/api/admin/generate-visual/route.ts
// ✅ FINAL WORKING VERSION (AI SDK v6 + Replicate Flux)

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
      aspectRatio: '1:1',           // Official & supported for Flux-Schnell
    });

    // Convert to base64 (works with current AI SDK v6)
    const base64 = Buffer.from(image.uint8Array).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({
      success: true,
      image: dataUrl,
    });

  } catch (error: any) {
    // ← This now returns the REAL error to the browser so you can see it
    console.error('Admin visual generation error:', error);
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
