import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Mech Interp Lab",
    template: "%s | Mech Interp Lab",
  },
  description:
    "Interactive visualization tools for mechanistic interpretability research. Explore transformer circuits, attention patterns, and layer-by-layer predictions.",
  keywords: [
    "mechanistic interpretability",
    "transformer",
    "neural network",
    "visualization",
    "attention",
    "circuits",
    "GPT-2",
  ],
  authors: [{ name: "Mech Interp Lab" }],
  openGraph: {
    title: "Mech Interp Lab",
    description:
      "Interactive visualization tools for mechanistic interpretability research",
    url: "/",
    siteName: "Mech Interp Lab",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mech Interp Lab",
    description:
      "Interactive visualization tools for mechanistic interpretability research",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
