import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { SmoothLink } from "../ui/smooth-link";
import Image from "next/image";

/**
 * HeroSection component - Main landing page hero section with heading,
 * description, call-to-action buttons, and hero image.
 */
export function HeroSection() {
  return (
    <section className="flex flex-col items-center space-y-8 text-center overflow-y-auto px-4">
      <div className="pt-35 space-y-8">
        {/* Main Heading */}
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          Remember everything.
        </h1>
        {/* Description */}
        <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
          A focused workspace for areas, projects, tasks, and notes—so you can
          stop juggling and start moving forward.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {/* Get Started Button */}
        <Button asChild size="lg" className="group text-white">
          <SmoothLink href="/#signup">
            Get started
            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
          </SmoothLink>
        </Button>

        {/* Sign In Button */}
        <Button asChild size="lg" variant="outline">
          <SmoothLink href="/#signin">Sign in</SmoothLink>
        </Button>
      </div>

      {/* Light Theme Image */}
      <Image className="dark:hidden" alt="Hero image" width={1300} height={400} src="/hero-light.png" />
      {/* Dark Theme Image */}
      <Image className="hidden dark:block" alt="Hero image" width={1300} height={400} src="/hero-dark.png" />
    </section>
  );
}
