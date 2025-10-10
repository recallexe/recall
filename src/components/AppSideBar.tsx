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
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const menu = [
  { title: "Dashboard", icon: LayoutDashboard, url: "#" },
  { title: "Areas", icon: Folder, url: "#" },
  { title: "Projects", icon: Box, url: "#" },
  { title: "Tasks", icon: CheckSquare, url: "#" },
  { title: "Notes", icon: Clipboard, url: "#" },
  { title: "Events", icon: Calendar, url: "#" },
  { title: "Resources", icon: Database, url: "#" },
  { title: "Calendar", icon: Calendar, url: "#" },
  { title: "Archive", icon: Archive, url: "#" },
];

export default function AppSidebar() {
  const [openAreas, setOpenAreas] = React.useState(true);
  const [openProjects, setOpenProjects] = React.useState(true);
  const [openTasks, setOpenTasks] = React.useState(false);
  const [openNotes, setOpenNotes] = React.useState(false);
  const [openEvents, setOpenEvents] = React.useState(false);
  const [openResources, setOpenResources] = React.useState(false);

  const sample = {
    areas: ["Personal", "Work", "Learning"],
    projects: ["Recall Redesign", "Thesis", "Open Source"],
    tasks: ["Inbox Zero", "Plan Sprint", "Buy Groceries"],
    notes: ["Meeting notes", "Ideas", "Reading summary"],
    events: ["Doctor", "Team sync", "Conference"],
    resources: ["Articles", "Books", "Databases"],
  };

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarMenu>
          {menu.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
