import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAnthropicClient, AGENT_PROMPTS, MODEL } from "@/lib/anthropic";
import { PLATFORMS, type Platform } from "@/lib/types";

function err(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  // ── 1. Auth gate ─────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return err("Unauthorized — please sign in.", 401);
  }

  // ── 2. Parse + validate body ──────────────────────────────────────────────
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
    return err(
      `platform must be one of: ${PLATFORMS.join(", ")}.`,
      400
    );
  }

  const validPlatform = platform as Platform;

  // ── 3. Call Anthropic ─────────────────────────────────────────────────────
  try {
    const anthropic = createAnthropicClient();
    const prompt = AGENT_PROMPTS[validPlatform](content.trim());

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const result = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    if (!result) {
      return err("The AI returned an empty response. Please try again.", 500);
    }

    return NextResponse.json({ result });
  } catch (error: unknown) {
    // Anthropic SDK typed errors
    if (error instanceof Anthropic.APIError) {
      if (error.status === 429) {
        return err(
          "Rate limit reached — please wait a moment and try again.",
          429
        );
      }
      if (error.status === 401) {
        console.error("[repurpose] Anthropic auth error — check API key");
        return err("AI service configuration error.", 500);
      }
      if (error.status === 529) {
        return err("Claude is currently overloaded. Please try again shortly.", 503);
      }
      console.error(`[repurpose] Anthropic APIError ${error.status}:`, error.message);
      return err("AI generation failed. Please try again.", 500);
    }

    console.error("[repurpose] Unexpected error:", error);
    return err("An unexpected error occurred.", 500);
  }
}

// Block all other HTTP methods
export async function GET() {
  return err("Method not allowed.", 405);
}
