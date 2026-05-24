import type { Metadata } from "next";
import { JetBrains_Mono, VT323 } from "next/font/google";
import { CRTOverlay } from "@/components/effects/CRTOverlay";
import { PostHogProvider } from "@/components/PostHogProvider";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const vt323 = VT323({
  variable: "--font-vt323",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Code Crusaders",
  description: "A cyberpunk coding roguelike. Pick your stack. Battle bosses. Don't die.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${jetbrainsMono.variable} ${vt323.variable} crt-flicker bg-void text-text`}
      >
        <PostHogProvider>
          <CRTOverlay />
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
