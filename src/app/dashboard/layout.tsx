// ============================================================================
// IMPORTS
// ============================================================================
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import AppSideBar from "@/components/layout/AppSidebar";
import Navbar from "@/components/layout/AppNavbar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";

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
// DASHBOARD LAYOUT
// ============================================================================
/**
 * Dashboard layout component that wraps all dashboard pages.
 * Provides sidebar, navbar, and main content area with proper scrolling.
 * Sidebar state is persisted via cookies.
 */
export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ========================================================================
  // SIDEBAR STATE
  // ========================================================================
  // Retrieve sidebar open state from cookies
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} antialiased flex`}
    >
      {/* Theme Provider */}
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {/* Sidebar Provider with persisted state */}
        <SidebarProvider defaultOpen={defaultOpen}>
          {/* Left Sidebar */}
          <AppSideBar />
          
          {/* Main Content Area */}
          <SidebarInset className="h-dvh overflow-y-auto overflow-x-hidden md:peer-data-[variant=inset]:m-0 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-none md:peer-data-[variant=inset]:shadow-none">
            {/* Sticky Navbar */}
            <Navbar />
            
            {/* Page Content */}
            <div>{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </ThemeProvider>
    </div>
  );
}
