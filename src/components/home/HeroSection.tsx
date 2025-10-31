import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { SmoothLink } from "@/components/ui/smooth-link";
import Link from "next/link";

export function HeroSection() {
    const isDev = process.env.NODE_ENV === "development";

    return (
        <section className="mx-auto flex flex-1 max-w-5xl flex-col items-center justify-center px-6 text-center overflow-y-auto py-12">
            <div className="space-y-8">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl bg-linear-to-b from-foreground to-foreground/70 bg-clip-text [view-transition-name:hero-headline]">
                            Remember everything.
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
                            A focused workspace for areas, projects, tasks, and notes—so you can stop juggling and start moving forward.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button asChild size="lg" className="group gap-2">
                        <SmoothLink href="/?=signup">
                            Get started
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </SmoothLink>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <SmoothLink href="/?=signin">Sign in</SmoothLink>
                    </Button>

                    {isDev && (
                        <Button asChild size="lg" variant="ghost">
                            <Link href="/dashboard">View dashboard</Link>
                        </Button>
                    )}
                </div>
            </div>
        </section>
    );
}

