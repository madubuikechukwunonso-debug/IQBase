// src/app/api/admin/generate-visual/route.ts
import { generateImage } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // ← Switch to Google Imagen-4
    const model = google.image('imagen-4.0-generate-001');   // or 'imagen-4.0-fast-generate-001' for faster/cheaper

    const { image } = await generateImage({
      model,
      prompt: prompt.trim(),
      aspectRatio: '1:1',           // or '16:9', '9:16', etc.
    });

    // Convert to base64 (works with current AI SDK)
    const base64 = Buffer.from(image.uint8Array).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({
      success: true,
      image: dataUrl,
    });

  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
