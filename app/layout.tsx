import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Content Repurposing Agent",
  description:
    "Turn one article into five platform-ready assets instantly. LinkedIn, Twitter, Email, Video Script, and SEO — powered by Claude AI.",
  openGraph: {
    title: "AI Content Repurposing Agent",
    description: "One article. Five platforms. Instant.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full antialiased bg-surface-1 text-white">
        {children}
      </body>
    </html>
  );
}
