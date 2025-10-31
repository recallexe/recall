"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Github, Globe, XIcon } from "lucide-react";
import { SmoothLink } from "@/components/ui/smooth-link";
import Link from "next/link";

type AuthFormProps = {
    mode: "signin" | "signup";
    title: string;
    description: string;
    switchText: string;
    switchHref: string;
    switchCta: string;
};

export function AuthForm({ mode, title, description, switchText, switchHref, switchCta }: AuthFormProps) {
    const isSignUp = mode === "signup";
    const isSignIn = mode === "signin";

    return (
        <div className="mx-auto flex flex-1 w-full max-w-screen-sm items-center justify-center px-4 py-10 overflow-y-auto">
            <Card key={mode} className="w-full border shadow-sm backdrop-blur-[1px] transition-[height] animate-in fade-in-50 zoom-in-95 duration-200 [view-transition-name:auth-card]">
                <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <CardTitle key={`${mode}-title`} className="text-2xl animate-in fade-in-50 duration-200">{title}</CardTitle>
                        <Button asChild size="sm" variant="ghost" aria-label="Close">
                            <Link href="/">
                                <XIcon className="size-4" aria-hidden="true" />
                            </Link>
                        </Button>
                    </div>
                    <CardDescription key={`${mode}-desc`} className="animate-in fade-in-50 duration-200">{description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <Button variant="outline" type="button" disabled aria-disabled="true" className="justify-start gap-2">
                            <Globe className="size-4" aria-hidden="true" /> Continue with Google
                        </Button>
                        <Button variant="outline" type="button" disabled aria-disabled="true" className="justify-start gap-2">
                            <Github className="size-4" aria-hidden="true" /> Continue with GitHub
                        </Button>
                    </div>
                    <div className="relative" aria-hidden="true">
                        <Separator />
                        <div className="absolute left-1/2 top-1 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">or</div>
                    </div>
                    <form key={`${mode}-form`} className="space-y-4 animate-in fade-in-50 slide-in-from-top-1 duration-200" action="/">
                        {isSignUp && (
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">Name</label>
                                <Input id="name" name="name" type="text" placeholder="Jane Doe" autoComplete="name" />
                            </div>
                        )}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <Input id="email" name="email" type="email" placeholder="you@example.com" required aria-required="true" aria-describedby="email-hint" autoComplete="email" />
                            <p id="email-hint" className="text-xs text-muted-foreground">We'll never share your email.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium">Password</label>
                                {isSignIn && (
                                    <SmoothLink href="/?=signin" className="text-xs text-primary underline-offset-4 hover:underline">Forgot password?</SmoothLink>
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
                            />
                            {isSignUp && (
                                <p id="password-hint" className="text-xs text-muted-foreground">Use at least 8 characters, including a number.</p>
                            )}
                        </div>
                        {isSignUp && (
                            <div className="space-y-2">
                                <label htmlFor="confirm" className="text-sm font-medium">Confirm password</label>
                                <Input id="confirm" name="confirm" type="password" placeholder="••••••••" required aria-required="true" autoComplete="new-password" />
                            </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div>
                                By continuing, you agree to the <Link href="#" className="text-primary underline-offset-4 hover:underline">Terms</Link> and <Link href="#" className="text-primary underline-offset-4 hover:underline">Privacy</Link>.
                            </div>
                        </div>
                        <Button type="submit" className="w-full">{title}</Button>
                    </form>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {switchText} <SmoothLink href={switchHref} className="text-primary underline-offset-4 hover:underline">{switchCta}</SmoothLink>
                    </div>
                    <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} Recall</div>
                </CardFooter>
            </Card>
        </div>
    );
}

