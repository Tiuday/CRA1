"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Button from "@/components/ui/Button";
import { PLATFORM_CONFIG, PLATFORMS, type Platform } from "@/lib/types";

// ─── Types ───────────────────────────────────────────────────────────────────

type NodeStatus = "waiting" | "running" | "done";

interface PipelineNode {
  platform: Platform;
  status: NodeStatus;
}

// ─── Cycling text hook ────────────────────────────────────────────────────────

const CYCLE_ITEMS = [
  { label: "LinkedIn Post", color: "#0A66C2" },
  { label: "Twitter Thread", color: "#1DA1F2" },
  { label: "Email Newsletter", color: "#F59E0B" },
  { label: "Video Script", color: "#EF4444" },
  { label: "SEO Meta Copy", color: "#10B981" },
];

function useCyclingText(interval = 1800) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % CYCLE_ITEMS.length), interval);
    return () => clearInterval(t);
  }, [interval]);
  return CYCLE_ITEMS[index];
}

// ─── Mock Pipeline Demo ───────────────────────────────────────────────────────

function MockPipeline() {
  const [nodes, setNodes] = useState<PipelineNode[]>(
    PLATFORMS.map((p) => ({ platform: p, status: "waiting" }))
  );
  const [isRunning, setIsRunning] = useState(false);
  const runningRef = useRef(false);

  const runDemo = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    setIsRunning(true);
    setNodes(PLATFORMS.map((p) => ({ platform: p, status: "waiting" })));

    PLATFORMS.forEach((platform, i) => {
      setTimeout(() => {
        setNodes((prev) =>
          prev.map((n) => (n.platform === platform ? { ...n, status: "running" } : n))
        );
        setTimeout(() => {
          setNodes((prev) =>
            prev.map((n) => (n.platform === platform ? { ...n, status: "done" } : n))
          );
          if (i === PLATFORMS.length - 1) {
            setTimeout(() => {
              runningRef.current = false;
              setIsRunning(false);
            }, 800);
          }
        }, 1100);
      }, i * 1600);
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(runDemo, 1000);
    return () => clearTimeout(t);
  }, [runDemo]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
        {nodes.map((node, i) => {
          const cfg = PLATFORM_CONFIG[node.platform];
          return (
            <div key={node.platform} className="flex items-center gap-2 sm:gap-4">
              <motion.div
                className="flex flex-col items-center gap-2"
                animate={{ scale: node.status === "running" ? [1, 1.06, 1] : 1 }}
                transition={{
                  repeat: node.status === "running" ? Infinity : 0,
                  duration: 0.9,
                }}
              >
                <div
                  className="w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-500"
                  style={{
                    borderColor:
                      node.status === "waiting" ? "#1e1e1e" : cfg.color,
                    backgroundColor:
                      node.status === "done"
                        ? cfg.color + "20"
                        : node.status === "running"
                        ? cfg.color + "12"
                        : "transparent",
                    boxShadow:
                      node.status === "running"
                        ? `0 0 18px ${cfg.color}55`
                        : node.status === "done"
                        ? `0 0 8px ${cfg.color}25`
                        : "none",
                  }}
                >
                  {node.status === "done" && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      style={{ color: cfg.color }}
                      className="text-sm font-bold"
                    >
                      ✓
                    </motion.span>
                  )}
                  {node.status === "running" && (
                    <span
                      className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: cfg.color, borderTopColor: "transparent" }}
                    />
                  )}
                  {node.status === "waiting" && (
                    <span className="font-mono text-xs text-white/20">
                      {cfg.icon}
                    </span>
                  )}
                </div>
                <span
                  className="font-mono text-xs tracking-wider transition-colors duration-300"
                  style={{
                    color:
                      node.status === "waiting"
                        ? "rgba(255,255,255,0.2)"
                        : cfg.color,
                  }}
                >
                  {cfg.label.split(" ")[0].toUpperCase()}
                </span>
              </motion.div>

              {i < nodes.length - 1 && (
                <div className="hidden sm:block w-6 h-px bg-surface-border" />
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <button
          onClick={isRunning ? undefined : runDemo}
          disabled={isRunning}
          className="font-mono text-xs text-white/25 hover:text-white/50 transition-colors disabled:cursor-default"
        >
          {isRunning ? "RUNNING..." : "▶ REPLAY DEMO"}
        </button>
      </div>
    </div>
  );
}

// ─── Static data ──────────────────────────────────────────────────────────────

const PLATFORM_DESCRIPTIONS: Record<Platform, string> = {
  linkedin: "~200 words, professional tone, 3–5 hashtags. Post-ready.",
  twitter: "5-tweet thread, hook-first, each under 280 chars. Numbered.",
  email:
    "Subject line, preview text, 150-word body, and a clear CTA. Plug-and-play.",
  video:
    "60-second script with [HOOK], [MAIN], [CTA]. Conversational and direct.",
  seo: "Title tag (60 chars), meta description (155 chars), 5 keywords.",
};

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Paste your content",
    body: "Drop in any blog post, article, or transcript. Any length works.",
  },
  {
    step: "02",
    title: "Run the agent",
    body: "Claude AI processes your content through five specialist prompts — one per platform, in sequence.",
  },
  {
    step: "03",
    title: "Copy and publish",
    body: "Each output is platform-ready. Copy, paste, and you're live. No editing required.",
  },
];

const TECH_STACK = [
  { name: "Next.js 16", sub: "App Router" },
  { name: "Claude AI", sub: "claude-sonnet-4-6" },
  { name: "Supabase", sub: "Auth + PostgreSQL" },
  { name: "Vercel", sub: "Edge deploy" },
  { name: "Framer Motion", sub: "Animations" },
  { name: "TypeScript", sub: "Strict mode" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const current = useCyclingText();
  const demoRef = useRef<HTMLDivElement>(null);

  function scrollToDemo() {
    demoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="min-h-screen bg-surface-1">
      <Navbar />

      {/* ── Hero ── */}
      <section className="gradient-mesh noise-overlay relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="max-w-4xl mx-auto space-y-8 relative z-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand/30 bg-brand/10 text-brand-light font-mono text-xs tracking-widest"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            AGENTIC AI PIPELINE
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55 }}
            className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.04] tracking-tight"
          >
            One article.
            <br />
            <span className="text-white/35">Five platforms.</span>
            <br />
            Instantly.
          </motion.h1>

          {/* Cycling label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-3 h-7"
          >
            <span className="font-mono text-xs text-white/25 tracking-widest">
              NOW GENERATING
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={current.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="font-mono text-xs font-semibold tracking-widest"
                style={{ color: current.color }}
              >
                {current.label.toUpperCase()}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="max-w-lg mx-auto text-white/45 text-lg leading-relaxed"
          >
            Paste any long-form content. The agent runs five specialist prompts
            and returns a LinkedIn post, Twitter thread, email, video script,
            and SEO copy — all in one click.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
          >
            <Link href="/signup">
              <Button size="lg">TRY IT FREE</Button>
            </Link>
            <Button variant="ghost" size="lg" onClick={scrollToDemo}>
              SEE IT LIVE
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Mock Pipeline Demo ── */}
      <section
        ref={demoRef}
        className="py-24 px-6 bg-surface-2 border-y border-surface-border"
      >
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="font-mono text-xs text-white/25 tracking-widest">
              LIVE DEMO
            </p>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-white">
              Watch the agent work
            </h2>
            <p className="text-white/35 text-sm max-w-sm mx-auto">
              Each node lights up as the agent completes that platform.
              Sequential, transparent, and fast.
            </p>
          </div>

          <div className="p-8 md:p-12 rounded-2xl border border-surface-border bg-surface-1">
            <MockPipeline />
          </div>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="font-mono text-xs text-white/25 tracking-widest">
              5 OUTPUTS
            </p>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-white">
              Every platform, handled
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORMS.map((platform, i) => {
              const cfg = PLATFORM_CONFIG[platform];
              return (
                <motion.div
                  key={platform}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  className="group p-5 rounded-xl border border-surface-border bg-surface-2 hover:border-white/10 transition-colors duration-300"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm mb-4 group-hover:scale-110 transition-transform duration-200"
                    style={{
                      backgroundColor: cfg.color + "18",
                      color: cfg.color,
                      border: `1px solid ${cfg.color}28`,
                    }}
                  >
                    {cfg.icon}
                  </div>
                  <h3 className="font-display font-semibold text-white mb-1.5">
                    {cfg.label}
                  </h3>
                  <p className="text-white/35 text-sm leading-relaxed">
                    {PLATFORM_DESCRIPTIONS[platform]}
                  </p>
                </motion.div>
              );
            })}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.38, duration: 0.4 }}
              className="p-5 rounded-xl border border-dashed border-surface-border bg-surface-1 flex items-center justify-center"
            >
              <div className="text-center">
                <p className="font-mono text-xs text-white/15 tracking-wider mb-1">
                  ALL 5
                </p>
                <p className="font-display text-white/40 text-sm">
                  One click. Done.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 px-6 bg-surface-2 border-y border-surface-border">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <p className="font-mono text-xs text-white/25 tracking-widest">
              HOW IT WORKS
            </p>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-white">
              Three steps to five assets
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="space-y-4"
              >
                <div className="font-mono font-bold text-5xl text-brand/15">
                  {item.step}
                </div>
                <h3 className="font-display font-semibold text-white text-lg">
                  {item.title}
                </h3>
                <p className="text-white/35 text-sm leading-relaxed">
                  {item.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center space-y-6"
        >
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white leading-tight">
            Stop rewriting.
            <br />
            <span className="text-white/35">Start repurposing.</span>
          </h2>
          <p className="text-white/35 text-base">
            One article becomes five platform-ready pieces in under 30 seconds.
          </p>
          <Link href="/signup">
            <Button size="lg" className="mt-2">
              GET STARTED FREE
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="py-12 px-6 border-t border-surface-border">
        <div className="max-w-4xl mx-auto space-y-6">
          <p className="text-center font-mono text-xs text-white/15 tracking-widest">
            BUILT WITH
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                className="px-4 py-2 rounded-lg border border-surface-border bg-surface-2 text-center"
              >
                <p className="font-mono text-xs text-white/60 font-medium">
                  {tech.name}
                </p>
                <p className="font-mono text-xs text-white/20">{tech.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-surface-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="font-display font-bold text-white/30 text-sm">
            Content<span className="text-brand/50">Agent</span>
          </p>
          <p className="font-mono text-xs text-white/15">
            Portfolio project — Claude AI + Next.js + Supabase
          </p>
        </div>
      </footer>
    </div>
  );
}
