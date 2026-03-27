// src/app/api/admin/generate-visual/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
    if (!HF_TOKEN) {
      return NextResponse.json({ error: "HUGGINGFACE_API_TOKEN is missing" }, { status: 500 });
    }

    // New Hugging Face Router endpoint (required in 2026)
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt.trim(),
          parameters: {
            num_inference_steps: 20,
            guidance_scale: 3.5,
            height: 1024,
            width: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face error: ${response.status} - ${errorText}`);
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({
      success: true,
      image: dataUrl,
    });
  } catch (error: any) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
