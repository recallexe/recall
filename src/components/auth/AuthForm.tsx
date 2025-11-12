"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { XIcon } from "lucide-react";
import { SmoothLink } from "@/components/ui/smooth-link";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

type AuthFormProps = {
    mode: "signin" | "signup";
    title: string;
    description: string;
    switchText: string;
    switchHref: string;
    switchCta: string;
};

/**
 * AuthForm component - Authentication form for sign in and sign up.
 * Handles username/password authentication with token management.
 */
export function AuthForm({ mode, title, description, switchText, switchHref, switchCta }: AuthFormProps) {
    const router = useRouter();
    const isSignUp = mode === "signup";
    const isSignIn = mode === "signin";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Clear error when switching between sign in and sign up
    useEffect(() => {
        setError(null);
    }, [mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        console.log("Form submitted", { mode, email, name: isSignUp ? name : "N/A" });

        try {
            if (isSignUp) {
                if (password !== confirmPassword) {
                    setError("Passwords do not match");
                    setLoading(false);
                    return;
                }
                if (password.length < 8) {
                    setError("Password must be at least 8 characters");
                    setLoading(false);
                    return;
                }

                console.log("Calling signup command");
                const responseJson = await tauriInvoke<string>("signup", {
                    json: JSON.stringify({
                        email,
                        name,
                        password,
                    }),
                });
                console.log("Signup response:", responseJson);

                const response = JSON.parse(responseJson) as {
                    success: boolean;
                    token: string | null;
                    message: string | null;
                    user: { id: string; email: string; name: string } | null;
                };

                if (response.success && response.token) {
                    localStorage.setItem("auth_token", response.token);
                    console.log("Signup successful, redirecting to dashboard");
                    router.push("/dashboard");
                } else {
                    setError(response.message || "Sign up failed");
                }
            } else {
                console.log("Calling signin command");
                const responseJson = await tauriInvoke<string>("signin", {
                    json: JSON.stringify({
                        email,
                        password,
                    }),
                });
                console.log("Signin response:", responseJson);

                const response = JSON.parse(responseJson) as {
                    success: boolean;
                    token: string | null;
                    message: string | null;
                    user: { id: string; email: string; name: string } | null;
                };

                if (response.success && response.token) {
                    localStorage.setItem("auth_token", response.token);
                    console.log("Signin successful, redirecting to dashboard");
                    router.push("/dashboard");
                } else {
                    setError(response.message || "Sign in failed");
                }
            }
        } catch (err) {
            console.error("Auth error:", err);
            const errorMessage = err instanceof Error ? err.message : "An error occurred";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto flex flex-1 w-full max-w-screen-sm items-center justify-center px-4 py-10 overflow-y-auto">
            <Card key={mode} className="w-full border shadow-sm backdrop-blur-[1px] transition-[height] animate-in fade-in-50 zoom-in-95 duration-200 [view-transition-name:auth-card]">
                <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        {/* Title */}
                        <CardTitle key={`${mode}-title`} className="text-2xl animate-in fade-in-50 duration-200">{title}</CardTitle>
                        {/* Close Button */}
                        <Button
                            size="sm"
                            variant="ghost"
                            aria-label="Close"
                            onClick={() => {
                                window.location.hash = "";
                            }}
                        >
                                <XIcon className="size-4" aria-hidden="true" />
                        </Button>
                    </div>
                    {/* Description */}
                    <CardDescription key={`${mode}-desc`} className="animate-in fade-in-50 duration-200">{description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                            {error}
                    </div>
                    )}

                    <form key={`${mode}-form`} className="space-y-4 animate-in fade-in-50 slide-in-from-top-1 duration-200" onSubmit={handleSubmit}>
                        {/* Name Field (Sign Up Only) */}
                        {isSignUp && (
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">Name</label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Jane Doe"
                                    autoComplete="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                required
                                aria-required="true"
                                aria-describedby="email-hint"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <p id="email-hint" className="text-xs text-muted-foreground">We'll never share your email. Unless you do, the data is right next to the executable.</p>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium">Password</label>
                                {/* Forgot Password Link (Sign In Only) */}
                                {isSignIn && (
                                    <SmoothLink href="/#signin" className="text-xs text-primary underline-offset-4 hover:underline">Forgot password?</SmoothLink>
                                )}
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                aria-required="true"
                                aria-describedby={isSignUp ? "password-hint" : undefined}
                                autoComplete={isSignIn ? "current-password" : "new-password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {/* Password Hint (Sign Up Only) */}
                            {isSignUp && (
                                <p id="password-hint" className="text-xs text-muted-foreground">Use at least 8 characters, including a number.</p>
                            )}
                        </div>

                        {/* Confirm Password Field (Sign Up Only) */}
                        {isSignUp && (
                            <div className="space-y-2">
                                <label htmlFor="confirm" className="text-sm font-medium">Confirm password</label>
                                <Input
                                    id="confirm"
                                    name="confirm"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    aria-required="true"
                                    autoComplete="new-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        )}

                        {/* Terms & Privacy */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div>
                                By continuing, you agree to the <Link href="#" className="text-primary underline-offset-4 hover:underline">Terms</Link> and <Link href="#" className="text-primary underline-offset-4 hover:underline">Privacy</Link>.
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Processing..." : title}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex items-center justify-between">
                    {/* Switch Mode Link */}
                    <div className="text-sm text-muted-foreground">
                        {switchText} <SmoothLink href={switchHref} className="text-primary underline-offset-4 hover:underline">{switchCta}</SmoothLink>
                    </div>
                    {/* Copyright */}
                    <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} Recall</div>
                </CardFooter>
            </Card>
        </div>
    );
}

