import { Brain } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function PageHeader() {
    return (
        <header className="z-10 w-full px-4 py-4 shrink-0 flex items-center justify-between">
            <div className="group/logo flex items-center gap-3 [view-transition-name:recall-logo]">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 transition-all duration-300 group-hover/logo:shadow-lg group-hover/logo:shadow-blue-200 dark:group-hover/logo:shadow-blue-900/50">
                    <Brain className="size-6 text-[#4299e1] transition-all duration-300 group-hover/logo:scale-110 group-hover/logo:rotate-6" aria-hidden="true" />
                </div>
                <span className="truncate font-serif text-2xl bg-linear-to-r from-[#4299e1] to-[#3182ce] bg-clip-text text-transparent font-bold">
                    Recall
                </span>
            </div>
            <ThemeToggle />
        </header>
    );
}

