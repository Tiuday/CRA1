"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface-1 flex items-center justify-center px-6">
      <div className="text-center space-y-4 max-w-sm">
        <p className="font-mono text-xs text-white/30 tracking-widest">ERROR</p>
        <h2 className="font-display text-xl font-semibold text-white">
          Something went wrong
        </h2>
        <p className="text-white/50 text-sm">{error.message}</p>
        <Button variant="ghost" onClick={reset}>
          TRY AGAIN
        </Button>
      </div>
    </div>
  );
}
