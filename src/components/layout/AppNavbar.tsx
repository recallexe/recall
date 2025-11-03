"use client";
import {
  Bell,
  MessageSquare,
  Network,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import { NavItem } from "../ui/nav-item";
import { ThemeToggle } from "../ui/theme-toggle";

export default function Navbar() {

  return (
    <nav className="p-2 flex items-center justify-between sticky top-0 z-50 bg-background/60 backdrop-blur-md">
      {/* LEFT */}
      <SidebarTrigger />
      {/* RIGHT */}
      <div className="flex items-center gap-2">
        <NavItem icon={<Search />} />
        <NavItem icon={<Plus />} />
        <NavItem icon={<Network />} />
        <NavItem icon={<MessageSquare />} />
        <NavItem icon={<Bell />} />
        <ThemeToggle />
        <NavItem icon={<Settings />} />
      </div>
    </nav>
  );
}
