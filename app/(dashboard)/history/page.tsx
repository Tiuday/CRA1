import HistoryList from "@/components/HistoryList";

export const metadata = {
  title: "History — ContentAgent",
  description: "Your past content repurposing jobs",
};

export default function HistoryPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <div className="space-y-1">
        <p className="font-mono text-xs text-white/25 tracking-widest">
          HISTORY
        </p>
        <h1 className="font-display font-bold text-2xl text-white">
          Past jobs
        </h1>
        <p className="text-white/35 text-sm">
          All your saved repurposing runs, newest first.
        </p>
      </div>
      <HistoryList />
    </div>
  );
}
