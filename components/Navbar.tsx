"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useRef(createClient()).current;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
    setSigningOut(false);
  }

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={[
        "font-mono text-xs tracking-widest transition-colors duration-200",
        pathname === href ? "text-white" : "text-white/40 hover:text-white/80",
      ].join(" ")}
    >
      {label}
    </Link>
  );

  return (
    <nav className="fixed top-0 inset-x-0 z-40 border-b border-surface-border bg-surface-1/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-display font-bold text-white text-lg tracking-tight"
        >
          Content<span className="text-brand">Agent</span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              {navLink("/dashboard", "AGENT")}
              {navLink("/history", "HISTORY")}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                loading={signingOut}
              >
                SIGN OUT
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">{navLink("/login", "LOG IN")}</Link>
              <Link href="/signup">
                <Button size="sm">GET STARTED</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
