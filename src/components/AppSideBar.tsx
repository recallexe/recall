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
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

const menu = [
  { title: "Dashboard", icon: LayoutDashboard, url: "#" },
  { title: "Areas", icon: Folder, url: "#" },
  { title: "Projects", icon: Box, url: "#" },
  { title: "Tasks", icon: CheckSquare, url: "#" },
  { title: "Notes", icon: Clipboard, url: "#" },
  { title: "Events", icon: Calendar, url: "#" },
  { title: "Resources", icon: Database, url: "#" },
  { title: "Calendar", icon: CalendarDays, url: "#" },
  { title: "Archive", icon: Archive, url: "#" },
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
  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    return initial;
  });

  return (
    <Sidebar>
      {/* SIDEBAR HEADER */}
      <SidebarHeader>
        <Link href="/">
          <div className="flex items-center gap-2 px-4 pt-4">
            <Brain size={25} />
            <span className="text-2xl font-serif">Recall</span>
          </div>
        </Link>
      </SidebarHeader>

      {/* SIDEBAR CONTENT */}
      <SidebarContent className="p-4">
        <SidebarMenu>
          {menu.map((item) => {
            const key = item.title.toLowerCase();
            const isCollapsible = [
              "areas",
              "projects",
              "tasks",
              "notes",
              "events",
              "resources",
            ].includes(key);

            if (!isCollapsible) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            const subs: string[] = (sample as any)[key] || [];
            const open = !!openMap[item.title];

            return (
              <Collapsible
                key={item.title}
                open={open}
                onOpenChange={(v) =>
                  setOpenMap((prev) => ({ ...prev, [item.title]: v }))
                }
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <item.icon />
                      <span>{item.title}</span>
                      <ChevronRight
                        className={`ml-auto transform transition-transform ${
                          open ? "rotate-90" : "rotate-0"
                        }`}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {subs.map((s) => (
                        <SidebarMenuSubItem key={s}>
                          <SidebarMenuSubButton asChild>
                            <Link href="#">{s}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* SIDEBAR FOOTER */}
      <SidebarFooter>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="px-4">
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
