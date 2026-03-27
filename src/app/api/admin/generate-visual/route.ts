import { generateImage } from 'ai';
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
      // optional params (highly recommended)
      size: '1024x1024',        // or '512x512' for faster/cheaper
      numOutputs: 1,
      // you can add more: seed, steps, etc. See Replicate Flux docs
    });

    // Return as base64 (perfect for immediate display or PDF embed)
    const base64 = Buffer.from(image).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({ 
      success: true, 
      image: dataUrl, 
      // if you prefer URL instead: imageUrl: output[0] 
    });

  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
