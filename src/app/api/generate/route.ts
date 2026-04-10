import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

// Next.js App Router Caching & Streaming overrides
export const maxDuration = 300; // Allow 5-minute timeout for Vercel
export const dynamic = 'force-dynamic'; // CRITICAL: Disable caching completely
export const fetchCache = 'force-no-store'; // CRITICAL: Ensure fresh fetches every time

export async function POST(req: Request) {
  try {
    const { keyword, outlineData } = await req.json();

    if (!keyword || !outlineData) {
      return new Response("Missing required context", { status: 400 });
    }

    const outlineText = outlineData
      .map((item: any) => `${item.type.toUpperCase()}: ${item.text}`)
      .join("\n");

    const result = await streamText({
      model: anthropic('claude-sonnet-4-6'), // Updated to the active 2026 model
      system: "You are an expert Content Writer. Write the article using ONLY raw HTML tags (<h2>, <h3>, <p>, <strong>). Do not use markdown wrappers like ```html.",
      prompt: `Target Keyword: ${keyword}\n\nOutline:\n${outlineText}\n\nWrite the full article now. Make it engaging and professional.`,
      temperature: 0.7,
    });

    // Use standard text stream response to prevent client-side SDK mismatches
    return result.toTextStreamResponse();
    
  } catch (error) {
    console.error("AI Streaming Error:", error);
    return new Response("Failed to generate content stream.", { status: 500 });
  }
}