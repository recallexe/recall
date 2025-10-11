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
  { title: "Areas", icon: Folder, url: "#", key: "areas" },
  { title: "Projects", icon: Box, url: "#", key: "projects" },
  { title: "Tasks", icon: CheckSquare, url: "#", key: "tasks" },
  { title: "Notes", icon: Clipboard, url: "#", key: "notes" },
  { title: "Events", icon: Calendar, url: "#", key: "events" },
  { title: "Resources", icon: Database, url: "#", key: "resources" },
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
            const Icon = item.icon;
            const hasSubmenu = item.key;

            if (hasSubmenu) {
              return (
                <Collapsible
                  key={item.title}
        
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <Icon />
                        {item.title}
                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {(sample[(item.key)]).map((subItem) => (
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
