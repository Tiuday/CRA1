"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function DashboardError({
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
    <div className="max-w-3xl mx-auto px-6 py-16 text-center space-y-4">
      <p className="font-mono text-xs text-white/30 tracking-widest">
        DASHBOARD ERROR
      </p>
      <h2 className="font-display text-xl font-semibold text-white">
        Failed to load dashboard
      </h2>
      <p className="text-white/50 text-sm">{error.message}</p>
      <div className="flex gap-3 justify-center">
        <Button variant="ghost" onClick={reset}>
          TRY AGAIN
        </Button>
        <Link href="/">
          <Button variant="ghost">GO HOME</Button>
        </Link>
      </div>
    </div>
  );
}
