import AgentInterface from "@/components/AgentInterface";

export const metadata = {
  title: "Agent — ContentAgent",
  description: "Run the content repurposing agent",
};

export default function DashboardPage() {
  return <AgentInterface />;
}
