"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { PLATFORM_CONFIG, type Platform, type RepurposeJobWithOutputs } from "@/lib/types";

const PAGE_SIZE = 10;

export default function HistoryList() {
  const [jobs, setJobs] = useState<RepurposeJobWithOutputs[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const supabase = useRef(createClient()).current;
  const offset = useRef(0);

  const fetchJobs = useCallback(
    async (from: number, append: boolean) => {
      if (from === 0) setLoading(true);
      else setLoadingMore(true);

      try {
        const { data, error } = await supabase
          .from("repurpose_jobs")
          .select("*, repurpose_outputs(*)")
          .order("created_at", { ascending: false })
          .range(from, from + PAGE_SIZE - 1);

        if (error) throw error;

        const fetched = (data ?? []) as RepurposeJobWithOutputs[];
        setHasMore(fetched.length === PAGE_SIZE);
        offset.current = from + fetched.length;

        setJobs((prev) => (append ? [...prev, ...fetched] : fetched));
      } catch (err) {
        setFetchError(
          err instanceof Error ? err.message : "Failed to load history."
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    fetchJobs(0, false);
  }, [fetchJobs]);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-24 bg-surface-2 border border-surface-border rounded-xl"
          />
        ))}
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="font-mono text-xs text-red-400">{fetchError}</p>
        <Button variant="ghost" onClick={() => fetchJobs(0, false)}>
          RETRY
        </Button>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (jobs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="py-20 text-center space-y-4"
      >
        <div className="w-14 h-14 rounded-2xl border border-surface-border bg-surface-2 flex items-center justify-center mx-auto font-mono text-2xl text-white/15">
          ◎
        </div>
        <div className="space-y-1">
          <p className="font-mono text-xs text-white/20 tracking-widest">
            EMPTY
          </p>
          <h2 className="font-display font-semibold text-white text-lg">
            No history yet
          </h2>
          <p className="text-white/35 text-sm">
            Run the agent and save a job to see it here.
          </p>
        </div>
        <Link href="/dashboard">
          <Button className="mt-2">GO TO AGENT</Button>
        </Link>
      </motion.div>
    );
  }

  // ── Job list ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {jobs.map((job, i) => {
        const isExpanded = expandedId === job.id;
        const outputs = job.repurpose_outputs ?? [];
        const preview =
          job.original_content.slice(0, 80) +
          (job.original_content.length > 80 ? "…" : "");
        const date = new Date(job.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const time = new Date(job.created_at).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="rounded-xl border border-surface-border bg-surface-2 overflow-hidden"
          >
            {/* ── Row button ── */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : job.id)}
              className="w-full flex items-start justify-between px-5 py-4 hover:bg-surface-3 transition-colors text-left cursor-pointer"
            >
              <div className="flex-1 min-w-0 space-y-2">
                <p className="font-mono text-xs text-white/25">
                  {date} · {time}
                </p>
                <p className="font-mono text-sm text-white/65 truncate pr-6">
                  {preview}
                </p>
                {/* Platform badges */}
                <div className="flex gap-1.5 flex-wrap">
                  {outputs.map((o) => {
                    const cfg = PLATFORM_CONFIG[o.platform as Platform];
                    return cfg ? (
                      <span
                        key={o.id}
                        className="font-mono text-xs px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: cfg.color + "18",
                          color: cfg.color,
                        }}
                      >
                        {cfg.label.split(" ")[0]}
                      </span>
                    ) : null;
                  })}
                  {outputs.length === 0 && (
                    <span className="font-mono text-xs text-white/20">
                      No outputs saved
                    </span>
                  )}
                </div>
              </div>
              <span className="font-mono text-xs text-white/20 flex-shrink-0 mt-1 ml-4">
                {isExpanded ? "▲" : "▼"}
              </span>
            </button>

            {/* ── Expanded outputs ── */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden border-t border-surface-border"
                >
                  <div className="px-5 py-4 space-y-5">
                    {outputs.length === 0 ? (
                      <p className="font-mono text-xs text-white/25">
                        No outputs were saved for this job.
                      </p>
                    ) : (
                      outputs.map((o) => {
                        const cfg = PLATFORM_CONFIG[o.platform as Platform];
                        return cfg ? (
                          <div key={o.id} className="space-y-2">
                            <p
                              className="font-mono text-xs font-semibold tracking-wider"
                              style={{ color: cfg.color }}
                            >
                              {cfg.label.toUpperCase()}
                            </p>
                            <pre className="font-mono text-xs text-white/45 whitespace-pre-wrap leading-relaxed bg-surface-3 rounded-lg px-4 py-3 max-h-36 overflow-y-auto">
                              {o.content}
                            </pre>
                          </div>
                        ) : null;
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* ── Load more ── */}
      {hasMore && (
        <div className="text-center pt-2">
          <Button
            variant="ghost"
            onClick={() => fetchJobs(offset.current, true)}
            loading={loadingMore}
          >
            LOAD MORE
          </Button>
        </div>
      )}
    </div>
  );
}
