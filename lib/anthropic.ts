import type { Platform } from "./types";

// Free models with their required max_tokens.
// Reasoning models (nvidia) need high limits because they burn tokens on internal thinking.
const FREE_MODELS: { id: string; maxTokens: number }[] = [
  { id: "google/gemma-4-31b-it:free",           maxTokens: 1024 },
  { id: "liquid/lfm-2.5-1.2b-instruct:free",    maxTokens: 1024 },
  { id: "nvidia/nemotron-3-nano-30b-a3b:free",   maxTokens: 3000 },
];

async function callOpenRouter(model: string, maxTokens: number, prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw Object.assign(new Error("OPENROUTER_API_KEY is not set"), { status: 401 });

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Content Repurposing Agent",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw Object.assign(new Error(body), { status: res.status });
  }

  const data = await res.json();
  const text: string = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) throw Object.assign(new Error(`Model ${model} returned empty content`), { status: 500 });
  return text;
}

export async function generateContent(prompt: string): Promise<string> {
  let lastError: unknown;
  for (const { id, maxTokens } of FREE_MODELS) {
    try {
      console.log("[ai] trying:", id);
      const result = await callOpenRouter(id, maxTokens, prompt);
      console.log("[ai] success:", id);
      return result;
    } catch (e) {
      const err = e as { status?: number; message?: string };
      if (err.status === 429) {
        console.warn("[ai] rate-limited:", id, "— trying next");
        lastError = e;
        continue;
      }
      throw e;
    }
  }
  throw lastError ?? new Error("All models rate-limited. Try again in a minute.");
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
