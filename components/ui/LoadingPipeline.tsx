"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PLATFORM_CONFIG, PLATFORMS, type Platform, type PlatformResult } from "@/lib/types";

interface Props {
  results: PlatformResult[];
}

const STATUS_LABEL: Record<string, string> = {
  waiting: "WAITING",
  running: "RUNNING",
  done:    "DONE",
  error:   "ERROR",
};

export default function LoadingPipeline({ results }: Props) {
  const statusMap = new Map(results.map((r) => [r.platform, r.status]));
  const allDone = results.length === 5 && results.every((r) => r.status === "done");

  return (
    <div className="space-y-6">
      {/* ── Compact success bar (shown when all done) ── */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-950/25 border border-emerald-900/35">
              <span className="text-emerald-400 font-bold">✓</span>
              <span className="font-mono text-xs text-emerald-400 tracking-wider">
                ALL 5 OUTPUTS GENERATED
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pipeline nodes ── */}
      <div className="relative">
        {/* Connector line — sits behind nodes at circle-center height */}
        <div className="absolute inset-x-[10%] top-[1.375rem] h-px bg-surface-border pointer-events-none" />

        <div className="relative grid grid-cols-5 gap-1">
          {PLATFORMS.map((platform) => {
            const cfg = PLATFORM_CONFIG[platform];
            const status = statusMap.get(platform) ?? "waiting";
            const isRunning = status === "running";
            const isDone = status === "done";
            const isError = status === "error";
            const isActive = isDone || isRunning;

            return (
              <motion.div
                key={platform}
                className="flex flex-col items-center gap-2 pb-1"
                animate={
                  isRunning
                    ? { scale: [1, 1.06, 1] }
                    : { scale: 1 }
                }
                transition={{
                  repeat: isRunning ? Infinity : 0,
                  duration: 0.85,
                  ease: "easeInOut",
                }}
              >
                {/* Circle node */}
                <div
                  className="w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-10 bg-surface-1"
                  style={{
                    borderColor: isError
                      ? "#EF4444"
                      : isActive
                      ? cfg.color
                      : "#1e1e1e",
                    backgroundColor: isDone
                      ? cfg.color + "1a"
                      : isRunning
                      ? cfg.color + "12"
                      : "#080808",
                    boxShadow: isRunning
                      ? `0 0 20px ${cfg.color}55, 0 0 8px ${cfg.color}30`
                      : isDone
                      ? `0 0 10px ${cfg.color}28`
                      : "none",
                  }}
                >
                  {/* Done — checkmark */}
                  {isDone && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 420, damping: 18 }}
                      className="text-base font-bold"
                      style={{ color: cfg.color }}
                    >
                      ✓
                    </motion.span>
                  )}

                  {/* Running — spinner */}
                  {isRunning && (
                    <span
                      className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                      style={{
                        borderColor: cfg.color,
                        borderTopColor: "transparent",
                      }}
                    />
                  )}

                  {/* Error */}
                  {isError && (
                    <span className="text-red-400 text-sm font-bold">✕</span>
                  )}

                  {/* Waiting — platform icon */}
                  {status === "waiting" && (
                    <span className="font-mono text-xs text-white/18">
                      {cfg.icon}
                    </span>
                  )}
                </div>

                {/* Platform label */}
                <span
                  className="font-mono text-xs tracking-wider text-center leading-tight transition-colors duration-400"
                  style={{
                    color: isError
                      ? "#EF4444"
                      : isActive
                      ? cfg.color
                      : "rgba(255,255,255,0.18)",
                    fontSize: "0.6rem",
                  }}
                >
                  {cfg.label.toUpperCase().replace(" ", "\n")}
                </span>

                {/* Status dot + text */}
                <div className="flex items-center gap-1">
                  <div
                    className="w-1 h-1 rounded-full flex-shrink-0 transition-colors duration-300"
                    style={{
                      backgroundColor: isError
                        ? "#EF4444"
                        : isRunning
                        ? cfg.color
                        : isDone
                        ? cfg.color
                        : "#1e1e1e",
                    }}
                  />
                  <span
                    className="font-mono leading-none"
                    style={{
                      fontSize: "0.55rem",
                      color: isError
                        ? "#EF4444"
                        : isActive
                        ? cfg.color + "aa"
                        : "rgba(255,255,255,0.15)",
                    }}
                  >
                    {STATUS_LABEL[status]}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
