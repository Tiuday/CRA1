import Navbar from "@/components/Navbar";
import AgentInterface from "@/components/AgentInterface";

export const metadata = {
  title: "ContentAgent — Repurpose in one click",
  description: "Paste any article. Get a LinkedIn post, Twitter thread, email, video script, and SEO copy instantly.",
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-14 min-h-screen bg-surface-1">
        <AgentInterface />
      </main>
    </>
  );
}
