"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import LoadingPipeline from "@/components/ui/LoadingPipeline";
import OutputCard from "@/components/ui/OutputCard";
import {
  PLATFORMS,
  PLATFORM_CONFIG,
  type Platform,
  type PlatformResult,
} from "@/lib/types";

// ─── Sample content ───────────────────────────────────────────────────────────

const SAMPLE = `The Rise of Agentic AI: Why Autonomous Systems Are Changing Everything

Artificial intelligence has shifted from answering questions to taking actions. The new frontier isn't chatbots — it's agents: AI systems that can plan, execute, and iterate on complex tasks without hand-holding at every step.

What makes an agent different from a regular AI model? An agent has goals, tools, and the ability to decide what to do next. Instead of responding to a single prompt, it breaks a problem into steps, runs those steps using tools (search, code execution, API calls), evaluates the result, and decides whether to continue or course-correct.

This changes how we think about automation. Traditional software automation requires someone to program every branch and edge case. Agents handle the ambiguity. Tell an agent to "research competitors and summarize the findings" and it will search, read, compare, and synthesize — decisions that would take hours of manual work.

The implications for business are enormous. Knowledge work that previously required specialized skills — writing, analysis, data processing, research — can now be delegated to AI agents. Not because AI is smarter than humans, but because it is tireless, consistent, and infinitely scalable.

The teams and companies that thrive in the next five years will be those that learn to orchestrate AI agents the way today's companies orchestrate software systems. The bottleneck won't be AI capability. It will be human judgment about what to automate, what to keep manual, and how to verify AI output.

The question is no longer whether AI can help your business. It's whether you're building the systems to make that help reliable.`;

// ─── Types ────────────────────────────────────────────────────────────────────

type AppState = "idle" | "running" | "done";

// Errors that indicate the whole run is broken (not just one platform)
const FATAL_PHRASES = [
  "configuration error",
  "api key",
  "authentication",
  "overloaded",
  "rate limit",
];

function isFatal(msg: string) {
  const lower = msg.toLowerCase();
  return FATAL_PHRASES.some((p) => lower.includes(p));
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_CHARS = 10_000;

// ─── Component ────────────────────────────────────────────────────────────────

export default function AgentInterface() {
  const [content, setContent] = useState("");
  const [appState, setAppState] = useState<AppState>("idle");
  const [results, setResults] = useState<PlatformResult[]>([]);
  const [runError, setRunError] = useState<string | null>(null);

  // ── Run agent ───────────────────────────────────────────────────────────────
  async function runAgent() {
    const trimmed = content.trim();
    if (!trimmed || appState === "running") return;

    setAppState("running");
    setRunError(null);

    const initial: PlatformResult[] = PLATFORMS.map((p) => ({
      platform: p,
      status: "waiting",
      content: "",
    }));
    setResults(initial);
    let current = [...initial];

    let aborted = false;

    for (const platform of PLATFORMS) {
      // If a fatal error occurred, mark remaining platforms as error instantly
      if (aborted) {
        current = current.map((r) =>
          r.platform === platform ? { ...r, status: "error" } : r
        );
        setResults((prev) =>
          prev.map((r) =>
            r.platform === platform ? { ...r, status: "error" } : r
          )
        );
        continue;
      }

      current = current.map((r) =>
        r.platform === platform ? { ...r, status: "running" } : r
      );
      setResults((prev) =>
        prev.map((r) =>
          r.platform === platform ? { ...r, status: "running" } : r
        )
      );

      try {
        const res = await fetch("/api/repurpose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: trimmed, platform }),
        });

        const data: { result?: string; error?: string } = await res.json();

        if (!res.ok || !data.result) {
          throw new Error(data.error ?? `HTTP ${res.status}`);
        }

        const text = data.result;
        current = current.map((r) =>
          r.platform === platform ? { ...r, status: "done", content: text } : r
        );
        setResults((prev) =>
          prev.map((r) =>
            r.platform === platform
              ? { ...r, status: "done", content: text }
              : r
          )
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Generation failed";
        current = current.map((r) =>
          r.platform === platform ? { ...r, status: "error" } : r
        );
        setResults((prev) =>
          prev.map((r) =>
            r.platform === platform ? { ...r, status: "error" } : r
          )
        );
        // Only store first error; abort remaining if it's a systemic failure
        setRunError((prev) => prev ?? msg);
        if (isFatal(msg)) aborted = true;
      }
    }

    setAppState("done");
  }

  // ── Reset ───────────────────────────────────────────────────────────────────
  function reset() {
    setContent("");
    setResults([]);
    setAppState("idle");
    setRunError(null);
  }

  const doneResults = results.filter((r) => r.status === "done" && r.content);
  const charOver = content.length > MAX_CHARS;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      {/* Page header */}
      <div className="space-y-1">
        <p className="font-mono text-xs text-white/25 tracking-widest">
          AGENT
        </p>
        <h1 className="font-display font-bold text-2xl text-white">
          Content Repurposing Agent
        </h1>
        <p className="text-white/35 text-sm">
          Paste any article or transcript. The agent generates five
          platform-ready outputs.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* ── INPUT STATE ── */}
        {appState === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs text-white/35 tracking-widest">
                  SOURCE CONTENT
                </label>
                <span
                  className={`font-mono text-xs transition-colors ${
                    charOver ? "text-red-400" : "text-white/20"
                  }`}
                >
                  {content.length.toLocaleString()} /{" "}
                  {MAX_CHARS.toLocaleString()}
                </span>
              </div>
              <textarea
                value={content}
                onChange={(e) =>
                  setContent(e.target.value.slice(0, MAX_CHARS + 200))
                }
                placeholder="Paste your article, blog post, or transcript here..."
                rows={12}
                className={[
                  "w-full bg-surface-2 border rounded-xl px-5 py-4 text-white text-sm",
                  "placeholder:text-white/18 font-mono leading-relaxed resize-none",
                  "outline-none transition-all duration-200",
                  charOver
                    ? "border-red-500/50 focus:border-red-500/70"
                    : "border-surface-border focus:border-brand focus:shadow-[0_0_0_2px_#7c3aed1a]",
                ].join(" ")}
              />
            </div>

            {/* Platform badges */}
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => {
                const cfg = PLATFORM_CONFIG[p];
                return (
                  <span
                    key={p}
                    className="font-mono text-xs px-2.5 py-1 rounded-full border"
                    style={{
                      borderColor: cfg.color + "28",
                      color: cfg.color + "99",
                      backgroundColor: cfg.color + "0a",
                    }}
                  >
                    {cfg.label}
                  </span>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={runAgent}
                disabled={!content.trim() || charOver}
                size="lg"
              >
                RUN AGENT
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setContent(SAMPLE)}
              >
                LOAD SAMPLE
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── RUNNING STATE ── */}
        {appState === "running" && (
          <motion.div
            key="running"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Faded preview of source */}
            <div className="space-y-2">
              <label className="font-mono text-xs text-white/20 tracking-widest">
                SOURCE CONTENT
              </label>
              <div className="relative bg-surface-2 border border-surface-border rounded-xl px-5 py-4 max-h-28 overflow-hidden">
                <p className="font-mono text-sm text-white/30 leading-relaxed line-clamp-3">
                  {content}
                </p>
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface-2 to-transparent" />
              </div>
            </div>

            {/* Running button */}
            <Button loading size="lg" disabled>
              RUNNING AGENT
            </Button>

            {/* Animated pipeline */}
            <div className="p-6 rounded-xl border border-surface-border bg-surface-2">
              <LoadingPipeline results={results} />
            </div>
          </motion.div>
        )}

        {/* ── RESULTS STATE ── */}
        {appState === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Pipeline in done state */}
            <div className="p-6 rounded-xl border border-surface-border bg-surface-2">
              <LoadingPipeline results={results} />
            </div>

            {/* Error banner */}
            {runError && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="px-5 py-4 rounded-xl border border-red-900/40 bg-red-950/15 space-y-1"
              >
                <p className="font-mono text-xs text-red-500 tracking-widest">
                  ERROR
                </p>
                <p className="font-mono text-sm text-red-300/80">{runError}</p>
              </motion.div>
            )}

            {/* Output cards — staggered */}
            {doneResults.length > 0 && (
              <div className="space-y-4">
                {doneResults.map((r, i) => (
                  <OutputCard
                    key={r.platform}
                    platform={r.platform}
                    content={r.content}
                    index={i}
                  />
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 flex-wrap items-center">
              <Button variant="ghost" size="lg" onClick={reset}>
                RUN AGAIN
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
