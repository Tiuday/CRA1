import { NextResponse, type NextRequest } from "next/server";
import { generateContent, AGENT_PROMPTS } from "@/lib/anthropic";
import { PLATFORMS, type Platform } from "@/lib/types";

function err(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body.", 400);
  }

  const { content, platform } = body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return err("content is required and must be a non-empty string.", 400);
  }

  if (content.trim().length > 50_000) {
    return err("content exceeds the 50,000 character limit.", 400);
  }

  if (!platform || typeof platform !== "string") {
    return err("platform is required.", 400);
  }

  if (!PLATFORMS.includes(platform as Platform)) {
    return err(`platform must be one of: ${PLATFORMS.join(", ")}.`, 400);
  }

  const validPlatform = platform as Platform;

  try {
    const prompt = AGENT_PROMPTS[validPlatform](content.trim());
    const result = await generateContent(prompt);
    console.log("[repurpose] success:", result.slice(0, 60));
    return NextResponse.json({ result });
  } catch (error: unknown) {
    const e = error as { status?: number; message?: string };
    console.error("[repurpose] error:", e.status, e.message);

    if (e.status === 429) return err("Rate limit reached. Wait a moment and try again.", 429);
    if (e.status === 401) return err("OpenRouter API key is missing or invalid.", 401);
    if (e.status === 402) return err("OpenRouter account has no credits.", 402);

    return err(`Generation failed: ${e.message ?? "unknown error"}`, 500);
  }
}

export async function GET() {
  return err("Method not allowed.", 405);
}
