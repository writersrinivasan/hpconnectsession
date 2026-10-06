import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "AgentOps Studio · One Yoto",
  description: "A live agentic AI factory for MSMEs: orchestration, A2A, MCP, RAG, guardrails, audit, evals and monitoring in one place.",
  icons: { icon: "/brand/yoto-logo-transparent.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${mono.variable} ${fraunces.variable} antialiased`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
