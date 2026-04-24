"use client";

import { motion } from "framer-motion";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand text-white border border-brand hover:bg-brand-dark shadow-[0_0_20px_#7c3aed35] hover:shadow-[0_0_28px_#7c3aed50]",
  ghost:
    "bg-transparent text-white/60 border border-surface-border hover:text-white hover:border-white/20",
  danger:
    "bg-transparent text-red-400 border border-red-900/40 hover:text-red-300 hover:border-red-500/40",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: isDisabled ? 1 : 1.02 }}
        whileTap={{ scale: isDisabled ? 1 : 0.97 }}
        transition={{ duration: 0.15 }}
        disabled={isDisabled}
        className={[
          "inline-flex items-center justify-center gap-2 rounded-lg font-mono tracking-wider",
          "transition-colors duration-200 cursor-pointer select-none",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {loading && (
          <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export default Button;
