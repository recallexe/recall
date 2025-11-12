"use client";

import { useRouter } from "next/navigation";
import React from "react";

type SmoothLinkProps = React.ComponentProps<"a"> & {
    href: string;
};

export function SmoothLink({ href, onClick, children, ...props }: SmoothLinkProps) {
    const router = useRouter();

    const handleClick = React.useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>) => {
            onClick?.(e);
            if (e.defaultPrevented) return;
            e.preventDefault();

            // Handle hash-only navigation (e.g., /#signup, /#signin)
            if (href.startsWith("/#")) {
                const hash = href.substring(1); // Remove leading /
                window.location.hash = hash;
                return;
            }

            // Handle regular navigation
            const to = href;
            const anyDoc = document as any;
            if (anyDoc && typeof anyDoc.startViewTransition === "function") {
                anyDoc.startViewTransition(() => {
                    router.push(to);
                });
            } else {
                router.push(to);
            }
        },
        [href, onClick, router]
    );

    return (
        <a href={href} onClick={handleClick} {...props}>
            {children}
        </a>
    );
}


