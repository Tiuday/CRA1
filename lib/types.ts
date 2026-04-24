export type Platform = "linkedin" | "twitter" | "email" | "video" | "seo";

export type JobStatus = "pending" | "running" | "done" | "error";

export type PlatformStatus = "waiting" | "running" | "done" | "error";

export interface RepurposeJob {
  id: string;
  user_id: string;
  original_content: string;
  created_at: string;
  status: JobStatus;
}

export interface RepurposeOutput {
  id: string;
  job_id: string;
  platform: Platform;
  content: string;
  created_at: string;
}

export interface RepurposeJobWithOutputs extends RepurposeJob {
  repurpose_outputs: RepurposeOutput[];
}

export interface PlatformResult {
  platform: Platform;
  content: string;
  status: PlatformStatus;
}

export interface AgentState {
  status: "idle" | "running" | "done" | "error";
  currentPlatform: Platform | null;
  results: PlatformResult[];
  error: string | null;
}

export const PLATFORMS: Platform[] = [
  "linkedin",
  "twitter",
  "email",
  "video",
  "seo",
];

export const PLATFORM_CONFIG = {
  linkedin: {
    label: "LinkedIn Post",
    color: "#0A66C2",
    cssClass: "platform-linkedin",
    icon: "in",
  },
  twitter: {
    label: "Twitter/X Thread",
    color: "#1DA1F2",
    cssClass: "platform-twitter",
    icon: "𝕏",
  },
  email: {
    label: "Email Newsletter",
    color: "#F59E0B",
    cssClass: "platform-email",
    icon: "✉",
  },
  video: {
    label: "Video Script",
    color: "#EF4444",
    cssClass: "platform-video",
    icon: "▶",
  },
  seo: {
    label: "SEO Meta Copy",
    color: "#10B981",
    cssClass: "platform-seo",
    icon: "◎",
  },
} satisfies Record<
  Platform,
  { label: string; color: string; cssClass: string; icon: string }
>;
