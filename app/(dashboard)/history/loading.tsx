export default function HistoryLoading() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-4 animate-pulse">
      <div className="h-4 w-24 bg-surface-3 rounded" />
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-20 bg-surface-2 border border-surface-border rounded-xl"
        />
      ))}
    </div>
  );
}
