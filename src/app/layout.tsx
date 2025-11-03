// ============================================================================
// IMPORTS
// ============================================================================
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

// ============================================================================
// FONT CONFIGURATION
// ============================================================================
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ============================================================================
// METADATA
// ============================================================================
export const metadata: Metadata = {
  title: "Recall",
  description: "Recall is a platform for managing your life",
};

// ============================================================================
// ROOT LAYOUT
// ============================================================================
/**
 * Root layout component that wraps all pages in the application.
 * Provides font variables, theme provider, and HTML structure.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Body with font variables and theme provider */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
