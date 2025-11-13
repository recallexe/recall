"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { XIcon } from "lucide-react";
import { SmoothLink } from "@/components/ui/smooth-link";
import { useRouter } from "next/navigation";

// Helper to safely invoke Tauri commands
async function tauriInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
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
    const [showTermsDialog, setShowTermsDialog] = useState(false);
    const prevModeRef = useRef(mode);

    // Clear error when switching between sign in and sign up
    useEffect(() => {
        if (prevModeRef.current !== mode) {
            setError(null);
            prevModeRef.current = mode;
        }
    });

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
                                {/* {isSignIn && (
                                    <SmoothLink href="/#signin" className="text-xs text-primary underline-offset-4 hover:underline">Forgot password?</SmoothLink>
                                )} */}
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
                                By continuing, you agree to the{" "}
                                <button
                                    type="button"
                                    onClick={() => setShowTermsDialog(true)}
                                    className="text-primary underline-offset-4 hover:underline"
                                >
                                    Terms
                                </button>
                                .
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

            {/* Terms Dialog */}
            <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Terms of Service</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 text-sm">
                        <section>
                            <h3 className="font-semibold mb-2">1. Acceptance of Terms</h3>
                            <p className="text-muted-foreground">
                                By accessing and using Recall, you accept and agree to be bound by the terms and provision of this agreement.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-semibold mb-2">2. Use License</h3>
                            <p className="text-muted-foreground">
                                Permission is granted to use Recall for personal use. This is the grant of a license, not a transfer of title, and under this license:
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                                <li>You may modify or copy the software for personal use</li>
                                <li>You may use the software for commercial purposes if explicit credit is given</li>
                                <li>You may reverse engineer the software - feel free, but please report any issues you find</li>
                                <li>You may not remove any copyright or other proprietary notations from the materials</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="font-semibold mb-2">3. Data Storage</h3>
                            <p className="text-muted-foreground">
                                All data stored in Recall is stored locally on your device. We do not collect, transmit, or store your data on external servers. You are solely responsible for backing up your data.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-semibold mb-2">4. Disclaimer</h3>
                            <p className="text-muted-foreground">
                                The materials on Recall are provided on an &apos;as is&apos; basis. Recall makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-semibold mb-2">5. Limitations</h3>
                            <p className="text-muted-foreground">
                                In no event shall Recall or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use Recall, even if Recall or a Recall authorized representative has been notified orally or in writing of the possibility of such damage.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-semibold mb-2">6. Revisions</h3>
                            <p className="text-muted-foreground">
                                Recall may revise these terms of service at any time without notice. By using Recall you are agreeing to be bound by the then current version of these terms of service.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-semibold mb-2">7. Contact Information</h3>
                            <p className="text-muted-foreground">
                                If you have any questions about these Terms of Service, please contact us.
                            </p>
                        </section>

                        <div className="pt-4 border-t text-xs text-muted-foreground">
                            <p>Last updated: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

