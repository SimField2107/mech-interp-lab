import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
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
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
