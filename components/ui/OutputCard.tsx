"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PLATFORM_CONFIG, type Platform } from "@/lib/types";

interface Props {
  platform: Platform;
  content: string;
  index: number;
}

const PREVIEW_LENGTH = 200;

export default function OutputCard({ platform, content, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const cfg = PLATFORM_CONFIG[platform];

  const isLong = content.length > PREVIEW_LENGTH;
  const preview = isLong ? content.slice(0, PREVIEW_LENGTH) + "…" : content;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement("textarea");
      el.value = content;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.4,
        ease: "easeOut",
      }}
      className="rounded-xl border border-surface-border bg-surface-2 overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
        <div className="flex items-center gap-3">
          {/* Platform icon */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
            style={{
              backgroundColor: cfg.color + "18",
              color: cfg.color,
              border: `1px solid ${cfg.color}28`,
            }}
          >
            {cfg.icon}
          </div>

          <div>
            <p className="font-display font-semibold text-white text-sm leading-tight">
              {cfg.label}
            </p>
            <p className="font-mono text-xs text-white/25 leading-tight mt-0.5">
              {content.split(" ").length} words
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* DONE badge */}
          <span
            className="font-mono text-xs px-2 py-0.5 rounded-full leading-none"
            style={{
              backgroundColor: cfg.color + "18",
              color: cfg.color,
              border: `1px solid ${cfg.color}28`,
            }}
          >
            DONE
          </span>

          {/* Copy button */}
          <motion.button
            onClick={handleCopy}
            whileTap={{ scale: 0.94 }}
            className={[
              "font-mono text-xs px-3 py-1.5 rounded-lg border transition-all duration-250 cursor-pointer select-none",
              copied
                ? "bg-emerald-950/30 border-emerald-900/40 text-emerald-400"
                : "border-surface-border text-white/35 hover:text-white/70 hover:border-white/15",
            ].join(" ")}
          >
            {copied ? "✓ COPIED" : "COPY"}
          </motion.button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-5 py-4 space-y-3">
        <motion.pre
          className="font-mono text-sm text-white/65 whitespace-pre-wrap leading-relaxed"
          initial={false}
          animate={{ height: "auto" }}
        >
          {expanded ? content : preview}
        </motion.pre>

        {isLong && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="font-mono text-xs text-white/25 hover:text-brand-light transition-colors cursor-pointer"
          >
            {expanded ? "▲ COLLAPSE" : "▼ EXPAND FULL OUTPUT"}
          </button>
        )}
      </div>
    </motion.div>
  );
}
