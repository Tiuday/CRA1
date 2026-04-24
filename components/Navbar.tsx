import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-40 border-b border-surface-border bg-surface-1/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center">
        <Link
          href="/"
          className="font-display font-bold text-white text-lg tracking-tight"
        >
          Content<span className="text-brand">Agent</span>
        </Link>
      </div>
    </nav>
  );
}
