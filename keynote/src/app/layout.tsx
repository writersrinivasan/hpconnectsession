import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz", "SOFT"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Growth Engines with AI · One Yoto Keynote",
  description: "Transform MSME Workflows into Growth Engines with AI. A keynote by Srinivasan Ramanujam for the HP Connect AI Workshop.",
  icons: { icon: "/brand/yoto-logo-transparent.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable} ${mono.variable} antialiased`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
