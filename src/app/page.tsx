import { AuthForm } from "@/components/auth/AuthForm";
import { HeroSection } from "@/components/home/HeroSection";
import { PageHeader } from "@/components/layout/PageHeader";

type HomeProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const sp = await searchParams;
  const rawValue = sp?.[""];
  const emptyKeyValue = Array.isArray(rawValue) ? rawValue[0] ?? "" : rawValue ?? "";
  const isSignIn = emptyKeyValue === "signin";
  const isSignUp = emptyKeyValue === "signup";

  const authProps = isSignIn || isSignUp ? {
    mode: (isSignIn ? "signin" : "signup") as "signin" | "signup",
    title: isSignIn ? "Sign In" : "Sign Up",
    description: isSignIn ? "Access your Recall dashboard" : "Create your Recall account",
    switchText: isSignIn ? "Don't have an account?" : "Already have an account?",
    switchHref: isSignIn ? "/?=signup" : "/?=signin",
    switchCta: isSignIn ? "Sign up" : "Sign in",
  } : null;

  return (
    <main className="h-dvh w-full bg-background overflow-hidden flex flex-col">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(40%_25%_at_10%_10%,--theme(--color-accent/0.35),transparent_60%),radial-gradient(35%_20%_at_90%_20%,--theme(--color-primary/0.06),transparent_60%)] [view-transition-name:page-bg]" />
      <PageHeader />
      {authProps ? <AuthForm {...authProps} /> : <HeroSection />}
    </main>
  );
}