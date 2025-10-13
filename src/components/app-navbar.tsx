"use client";
import {
  Bell,
  MessageSquare,
  Moon,
  Network,
  Plus,
  Search,
  Sun,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { SidebarTrigger } from "./ui/sidebar";
import NavItem from "./nav-item";

export default function Navbar() {
  const { setTheme } = useTheme();

  return (
    <nav className="p-4 flex items-center justify-between">
      {/* LEFT */}
      <NavItem icon={<SidebarTrigger />} />
      {/* RIGHT */}
      <div className="flex items-center gap-2">
        <NavItem icon={<Search />} />
        <NavItem icon={<Plus />} />
        <NavItem icon={<Network />} />
        <NavItem icon={<MessageSquare />} />
        <NavItem icon={<Bell />} />
        {/* THEME MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <NavItem
              icon={
                <>
                  <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                </>
              }
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={10}>
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
