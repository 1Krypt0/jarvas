import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import PlausibleProvider from "next-plausible";
import { env } from "@/env";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jarvas - O assistente pessoal da sua empresa",
  description:
    "Use a informação da sua empresa como um ativo com o qual pode falar",
  referrer: "origin-when-cross-origin",
  authors: [{ name: "Tiago Rodrigues", url: "https://tiagopbrodrigues.com" }],
  creator: "Tiago Rodrigues",
  keywords: ["Jarvas", "AI", "RAG", "Chatbot", "Portugês"],
  openGraph: {
    type: "website",
    title: "Jarvas - O assistente pessoal da sua empresa",
    siteName: "Ask Jarvas",
    url: "https://app.askjarvas.com",
    description:
      "Use a informação da sua empresa como um ativo com o qual pode falar",
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
