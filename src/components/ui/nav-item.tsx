import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface NavItemProps {
  icon: React.ReactNode;
  label?: string;
  onClick?: () => void;
  className?: string;
  asChild?: boolean;
}

export function NavItem({
  icon,
  label,
  onClick,
  className,
  asChild = false,
}: NavItemProps) {
  if (asChild) {
    // Render a real <button> for Radix UI triggers
    return (
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          className,
        )}
      >
        {icon}
        {label && <span className="sr-only">{label}</span>}
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={label}
      className={className}
    >
      {icon}
      {label && <span className="sr-only">{label}</span>}
    </Button>
  );
}
