"use client";

import { useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";

type Mode = "login" | "signup";
type Method = "password" | "magic-link";

export default function AuthForm({ mode }: { mode: Mode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [method, setMethod] = useState<Method>("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = useRef(createClient()).current;

  function clearMessages() {
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      if (method === "magic-link") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        setSuccess("Magic link sent — check your inbox.");
        return;
      }

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        setSuccess("Account created — check your email to confirm.");
        return;
      }

      // login with password
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = [
    "w-full bg-surface-3 border border-surface-border rounded-lg px-4 py-3",
    "text-white text-sm placeholder:text-white/20 font-mono",
    "outline-none transition-all duration-200",
    "focus:border-brand focus:shadow-[0_0_0_2px_#7c3aed22]",
  ].join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="space-y-2">
        <p className="font-mono text-xs text-white/25 tracking-widest">
          {mode === "login" ? "WELCOME BACK" : "GET STARTED"}
        </p>
        <h1 className="font-display font-bold text-2xl text-white">
          {mode === "login"
            ? "Sign in to ContentAgent"
            : "Create your account"}
        </h1>
      </div>

      {/* Method toggle */}
      <div className="flex gap-1 p-1 rounded-lg bg-surface-3 border border-surface-border">
        {(["password", "magic-link"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMethod(m);
              clearMessages();
            }}
            className={[
              "flex-1 py-2 rounded-md font-mono text-xs tracking-widest transition-all duration-200 cursor-pointer",
              method === m
                ? "bg-brand text-white shadow-[0_0_12px_#7c3aed35]"
                : "text-white/30 hover:text-white/60",
            ].join(" ")}
          >
            {m === "password" ? "PASSWORD" : "MAGIC LINK"}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email field */}
        <div className="space-y-1.5">
          <label className="font-mono text-xs text-white/35 tracking-widest">
            EMAIL
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>

        {/* Password field — animated in/out */}
        <AnimatePresence initial={false}>
          {method === "password" && (
            <motion.div
              key="password-field"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden space-y-1.5"
            >
              <label className="font-mono text-xs text-white/35 tracking-widest block">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={method === "password"}
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                placeholder="••••••••"
                minLength={6}
                className={inputClass}
              />
              {mode === "signup" && (
                <p className="font-mono text-xs text-white/20">
                  Minimum 6 characters
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="font-mono text-xs text-red-400 bg-red-950/25 border border-red-900/35 rounded-lg px-3 py-2.5"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Success */}
        <AnimatePresence>
          {success && (
            <motion.p
              key="success"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="font-mono text-xs text-emerald-400 bg-emerald-950/25 border border-emerald-900/35 rounded-lg px-3 py-2.5"
            >
              {success}
            </motion.p>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          loading={loading}
          disabled={!!success}
          size="lg"
          className="w-full"
        >
          {method === "magic-link"
            ? "SEND MAGIC LINK"
            : mode === "login"
            ? "SIGN IN"
            : "CREATE ACCOUNT"}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-surface-border" />
        <span className="font-mono text-xs text-white/15">OR</span>
        <div className="flex-1 h-px bg-surface-border" />
      </div>

      {/* Switch mode link */}
      <p className="font-mono text-xs text-white/25 text-center">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link
              href="/signup"
              className="text-brand-light hover:text-brand transition-colors"
            >
              Sign up free
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-brand-light hover:text-brand transition-colors"
            >
              Sign in
            </Link>
          </>
        )}
      </p>
    </motion.div>
  );
}
