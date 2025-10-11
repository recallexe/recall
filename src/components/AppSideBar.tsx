"use client";
import React from "react";
import {
  Archive,
  Box,
  Calendar,
  CheckSquare,
  ChevronDown,
  Clipboard,
  Database,
  LogOut,
  Folder,
  LayoutDashboard,
  Brain,
  User2,
  ChevronUp,
  Settings,
  CalendarDays,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const menu = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Areas", icon: Folder, url: "/dashboard/areas", key: "areas" },
  { title: "Projects", icon: Box, url: "/dashboard/projects", key: "projects" },
  { title: "Tasks", icon: CheckSquare, url: "/dashboard/tasks", key: "tasks" },
  { title: "Notes", icon: Clipboard, url: "/dashboard/notes", key: "notes" },
  { title: "Events", icon: Calendar, url: "/dashboard/events", key: "events" },
  {
    title: "Resources",
    icon: Database,
    url: "/dashboard/resources",
    key: "resources",
  },
  { title: "Calendar", icon: CalendarDays, url: "/dashboard/calendar" },
  { title: "Archive", icon: Archive, url: "/dashboard/archive" },
];

const sample = {
  areas: ["Personal", "Work", "Learning"],
  projects: ["Recall Redesign", "Thesis", "Open Source"],
  tasks: ["Inbox Zero", "Plan Sprint", "Buy Groceries"],
  notes: ["Meeting notes", "Ideas", "Reading summary"],
  events: ["Doctor", "Team sync", "Conference"],
  resources: ["Articles", "Books", "Databases"],
};

export default function AppSidebar() {
  return (
    <Sidebar>
      {/* SIDEBAR HEADER */}
      <SidebarHeader>
        <Link href="/dashboard">
          <div className="flex items-center gap-2 px-4 pt-4">
            <Brain size={30} />
            <span className="text-[27px] font-serif">Recall</span>
          </div>
        </Link>
      </SidebarHeader>

      {/* SIDEBAR CONTENT */}
      <SidebarContent className="p-4">
        <SidebarMenu>
          {menu.map((item) => {
            const Icon = item.icon;
            const hasSubmenu = item.key;

            if (hasSubmenu) {
              const subs = (sample as Record<string, string[]>)[item.key] || [];
              return (
                <Collapsible key={item.title} className="group/collapsible">
                  <SidebarMenuItem>
                    {/* label navigates to the page */}
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <Icon />
                        {item.title}
                      </Link>
                    </SidebarMenuButton>

                    {/* chevron only toggles the collapsible */}
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction>
                        <ChevronRight className="transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {subs.map((subItem) => (
                          <SidebarMenuSubItem key={subItem}>
                            <SidebarMenuSubButton>
                              {subItem}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <Icon />
                    {item.title}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* SIDEBAR FOOTER */}
      <SidebarFooter className="p-4">
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton>
                <User2 />
                Ehsanulla Dehzad
                <ChevronUp className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User2 />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive">
                <LogOut />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
