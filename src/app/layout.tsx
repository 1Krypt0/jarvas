import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import PlausibleProvider from "next-plausible";
import { env } from "@/env";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jarvas - The Search Engine for your Company",
  description:
    "Jarvas is a RAG based search engine application built with AI and following an Agentic workflow to solve all your business needs",
  referrer: "origin-when-cross-origin",
  authors: [{ name: "Tiago Rodrigues", url: "https://tiagopbrodrigues.com" }],
  creator: "Tiago Rodrigues",
  keywords: ["Jarvas", "AI", "RAG", "Chatbot", "Agents", "Agentic"],
  openGraph: {
    type: "website",
    title: "Jarvas - The Search Engine for your Company",
    siteName: "Ask Jarvas",
    url: "https://app.askjarvas.com",
    locale: "pt_PT",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "https://app.askjarvas.com/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <PlausibleProvider
        domain="app.askjarvas.com"
        customDomain={env.PLAUSIBLE_DOMAIN}
        selfHosted={true}
      >
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </PlausibleProvider>
    </html>
  );
}
