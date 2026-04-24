export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-1 noise-overlay flex items-center justify-center px-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
