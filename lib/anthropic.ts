import Anthropic from "@anthropic-ai/sdk";
import type { Platform } from "./types";

export const MODEL = "claude-sonnet-4-6";

export function createAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

export const AGENT_PROMPTS = {
  linkedin: (content: string) =>
    `You are a LinkedIn content expert. Repurpose the following content into a compelling LinkedIn post. Use line breaks for readability, include 3-5 relevant hashtags at the end, and aim for ~200 words. Output ONLY the post itself, nothing else — no preamble, no explanation. Content: ${content}`,

  twitter: (content: string) =>
    `You are a viral Twitter/X expert. Repurpose into a 5-tweet thread. Number each (1/, 2/, etc.). Each tweet must be under 280 characters. Make tweet 1 a compelling hook. Output ONLY the thread, nothing else. Content: ${content}`,

  email: (content: string) =>
    `You are an email marketing expert. Repurpose into an email newsletter snippet with: a punchy subject line, 2-sentence preview text, 150-word body, and a clear CTA. Format with labels: SUBJECT:, PREVIEW:, BODY:, CTA: Output ONLY the email snippet. Content: ${content}`,

  video: (content: string) =>
    `You are a short-form video scriptwriter. Repurpose into a 60-second script. Use [HOOK], [MAIN POINTS], and [CTA] section headers. Use spoken, conversational language. Output ONLY the script. Content: ${content}`,

  seo: (content: string) =>
    `You are an SEO specialist. Generate: 1) SEO-optimized page title (under 60 chars), 2) Meta description (under 155 chars), 3) 5 target keywords. Format: TITLE: / META: / KEYWORDS: (comma-separated) Output ONLY these three items. Content: ${content}`,
} satisfies Record<Platform, (content: string) => string>;
