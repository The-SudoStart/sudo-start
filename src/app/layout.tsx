import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { ToastProvider } from "@/lib/toast-context";
import { Toaster } from "@/components/toaster";
import { CardSpotlight } from "@/components/card-spotlight";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  weight: "600",
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteDescription = "Discover the best developer tools and generate a one-command setup script for macOS and Linux. AI-assisted, cross-platform, open source.";

export const metadata: Metadata = {
  // Resolves the generated share images (app/opengraph-image.png) to absolute URLs.
  metadataBase: new URL("https://sudo-start.vercel.app"),
  title: "SudoStart — The Developer Tool Marketplace",
  description: siteDescription,
  openGraph: {
    title: "SudoStart",
    description: siteDescription,
    siteName: "SudoStart",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SudoStart",
    description: siteDescription,
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0d1a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="skip-link"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <ToastProvider>
            <main id="main-content" className="min-h-screen">
              {children}
            </main>
            <Toaster position="bottom-right" />
            <CardSpotlight />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
