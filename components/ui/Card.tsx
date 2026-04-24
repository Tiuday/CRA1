import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "ghost";
}

export default function Card({
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  const variants = {
    default: "bg-surface-2 border border-surface-border",
    elevated:
      "bg-surface-2 border border-surface-border shadow-[0_0_40px_#7c3aed12]",
    ghost: "bg-transparent border border-surface-border/50",
  };

  return (
    <div
      className={["rounded-xl p-5", variants[variant], className].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
