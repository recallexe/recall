"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppSideBar from "@/components/layout/AppSidebar";
import Navbar from "@/components/layout/AppNavbar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Helper to safely invoke Tauri commands
async function tauriInvoke<T = any>(cmd: string, args?: any): Promise<T> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<T>(cmd, args);
  } catch (err) {
    console.error(`Tauri invoke error for ${cmd}:`, err);
    throw err;
  }
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Dashboard layout component that wraps all dashboard pages.
 * Provides sidebar, navbar, and main content area with proper scrolling.
 * Sidebar state is persisted via localStorage for Tauri static compatibility.
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [defaultOpen, setDefaultOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/");
        return;
      }

      try {
        const responseJson = await tauriInvoke<string>("validate_token", {
          token: token,
        });
        const userInfo = responseJson && responseJson !== "null" ? JSON.parse(responseJson) : null;

        if (userInfo && userInfo.id) {
          // Token is valid
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear and redirect
          localStorage.removeItem("auth_token");
          router.push("/");
        }
      } catch (err) {
        console.error("Auth validation error:", err);
        localStorage.removeItem("auth_token");
        router.push("/");
      }
    };

    checkAuth();

    // Retrieve sidebar open state from localStorage on client side
    const savedState = localStorage.getItem("sidebar_state");
    if (savedState !== null) {
      setDefaultOpen(savedState === "true");
    }
  }, [router]);

  // Don't render until auth check is complete
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // If not authenticated, don't render (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

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
