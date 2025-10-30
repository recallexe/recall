"use client";
import React from "react";

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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { NavUser } from "../ui/nav-user";
import { menu, sample, user } from "@/app/lib/data";
import { Brain, ChevronRight } from "lucide-react";

export default function AppSidebar() {
  return (
    <Sidebar>
      {/* SIDEBAR HEADER */}
      <SidebarHeader>
        <Link href="/dashboard">
          <div className="flex items-center gap-2 px-4 pt-4">
            <Brain size={30} color="#4299e1" />
            <span className="text-[27px] font-serif text-[#4299e1]">
              Recall
            </span>
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
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
