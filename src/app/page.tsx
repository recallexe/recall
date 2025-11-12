"use client";

import { useEffect, useState } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { HeroSection } from "@/components/home/HeroSection";
import { PageHeader } from "@/components/layout/PageHeader";

/**
 * Home page component that displays either the hero section or auth form
 * based on URL hash (signin/signup). Static for Tauri compatibility.
 */
export default function Home() {
  const [authMode, setAuthMode] = useState<"signin" | "signup" | null>(null);

  useEffect(() => {
    // Function to update auth mode based on current hash
    const updateAuthMode = () => {
      const hash = window.location.hash;
      if (hash === "#signin" || hash === "#signup") {
        setAuthMode(hash === "#signin" ? "signin" : "signup");
      } else {
        setAuthMode(null);
      }
    };

    // Check URL hash on mount
    updateAuthMode();

    // Listen for hash changes
    const handleHashChange = () => {
      updateAuthMode();
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Configure authentication form props based on mode (signin/signup)
  const authProps =
    authMode
      ? {
        mode: authMode,
        title: authMode === "signin" ? "Sign In" : "Sign Up",
        description:
          authMode === "signin"
            ? "Access your Recall dashboard"
            : "Create your Recall account",
        switchText:
          authMode === "signin"
            ? "Don't have an account?"
            : "Already have an account?",
        switchHref: authMode === "signin" ? "/#signup" : "/#signin",
        switchCta: authMode === "signin" ? "Sign up" : "Sign in",
        }
      : null;

  return (
    <main className="h-dvh w-full bg-background overflow-hidden flex flex-col">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(40%_25%_at_10%_10%,--theme(--color-accent/0.35),transparent_60%),radial-gradient(35%_20%_at_90%_20%,--theme(--color-primary/0.06),transparent_60%)] [view-transition-name:page-bg]" />

      {/* Page Header */}
      <PageHeader />

      {/* Conditional Content: Auth Form or Hero Section */}
      {authProps ? <AuthForm {...authProps} /> : <HeroSection />}
    </main>
  );
}
