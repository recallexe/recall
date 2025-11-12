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

/**
 * AppNavbar component - Sticky navigation bar at the top of the dashboard.
 * Contains sidebar trigger, action icons, and theme toggle.
 */
export default function Navbar() {
  return (
    <nav className="p-4 flex items-center justify-between sticky top-0 z-50 bg-background/60 backdrop-blur-md">
      <SidebarTrigger />

      <div className="flex items-center gap-2">
        {/* Search */}
        <NavItem icon={<Search />} />
        {/* Add */}
        <NavItem icon={<Plus />} />
        {/* Network */}
        <NavItem icon={<Network />} />
        {/* Messages */}
        <NavItem icon={<MessageSquare />} />
        {/* Notifications */}
        <NavItem icon={<Bell />} />
        {/* Theme Toggle */}
        <ThemeToggle />
        {/* Settings */}
        <NavItem icon={<Settings />} />
      </div>
    </nav>
  );
}
