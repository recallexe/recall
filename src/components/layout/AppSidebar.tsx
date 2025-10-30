"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, ChevronRight } from "lucide-react";

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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
  SidebarSeparator,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { NavUser } from "../ui/nav-user";
import { menu, sample, user, stats } from "@/app/lib/data";

export default function AppSidebar() {
  const pathname = usePathname();

  const getBadgeFor = (title: string): string | undefined => {
    const k = title.toLowerCase() as keyof typeof stats;
    const s = (stats as any)[k];
    return s && typeof s.value === "number" ? String(s.value) : undefined;
  };

  const isActiveUrl = (url: string) => pathname === url;

  const workspaceItems = ["Dashboard", "Areas", "Projects", "Tasks", "Notes", "Events"];
  const libraryItems = ["Resources"];
  const moreItems = ["Calendar", "Archive"];

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarRail />

      {/* HEADER */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="group-data-[collapsible=icon]:p-0! transition-all duration-300 hover:bg-sidebar-accent/50"
            >
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-transparent transition-transform duration-300 group-hover:scale-110">
                  <Brain className="size-7 text-[#4299e1] transition-all duration-300 group-hover:rotate-12" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight transition-all duration-300">
                  <span className="truncate font-serif text-2xl text-[#4299e1] transition-all duration-300">
                    Recall
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent>
        {/* WORKSPACE */}
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu
                .filter((m) => workspaceItems.includes(m.title))
                .map((item) => {
                  const Icon = item.icon;
                  const hasSubmenu = item.key;
                  const isActive = isActiveUrl(item.url);
                  const badge = getBadgeFor(item.title);

                  if (hasSubmenu) {
                    const subs = (sample as Record<string, string[]>)[item.key] || [];
                    const defaultOpen = pathname.startsWith(item.url);
                    return (
                      <CollapsibleMenuItem
                        key={item.title}
                        item={{ title: item.title, url: item.url, Icon }}
                        subs={subs}
                        isActive={isActive}
                        badge={badge}
                        defaultOpen={defaultOpen}
                      />
                    );
                  }

                  return (
                    <MenuItem
                      key={item.title}
                      title={item.title}
                      url={item.url}
                      icon={Icon}
                      isActive={isActive}
                      badge={badge}
                    />
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* LIBRARY */}
        <SidebarGroup>
          <SidebarGroupLabel>Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu
                .filter((m) => libraryItems.includes(m.title))
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveUrl(item.url);
                  const badge = getBadgeFor(item.title);
                  return (
                    <MenuItem
                      key={item.title}
                      title={item.title}
                      url={item.url}
                      icon={Icon}
                      isActive={isActive}
                      badge={badge}
                    />
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* MORE */}
        <SidebarGroup>
          <SidebarGroupLabel>More</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu
                .filter((m) => moreItems.includes(m.title))
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveUrl(item.url);
                  return (
                    <MenuItem
                      key={item.title}
                      title={item.title}
                      url={item.url}
                      icon={Icon}
                      isActive={isActive}
                    />
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}

// Helper component for regular menu items
function MenuItem({
  title,
  url,
  icon: Icon,
  isActive,
  badge,
}: {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  isActive: boolean;
  badge?: string;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={title}
        className={`
          relative transition-all duration-200 
          before:content-[''] before:absolute before:left-0 before:top-1 before:bottom-1 
          before:w-0.5 before:rounded-full before:bg-primary 
          before:opacity-0 before:scale-y-0 before:transition-all before:duration-300
          ${isActive ? 'before:opacity-100 before:scale-y-100' : ''}
          hover:bg-sidebar-accent/50 active:scale-[0.98]
        `}
      >
        <Link href={url} className="flex items-center gap-2 w-full">
          <Icon className="transition-transform duration-200 group-hover:scale-110" />
          <span className="transition-all duration-200">{title}</span>
        </Link>
      </SidebarMenuButton>
      {badge && (
        <SidebarMenuBadge className="transition-all duration-200">
          {badge}
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}

// Helper component for collapsible menu items
function CollapsibleMenuItem({
  item,
  subs,
  isActive,
  badge,
  defaultOpen,
}: {
  item: { title: string; url: string; Icon: React.ComponentType<any> };
  subs: string[];
  isActive: boolean;
  badge?: string;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const { Icon } = item;

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={item.title}
          className={`
            relative transition-all duration-200 
            before:content-[''] before:absolute before:left-0 before:top-1 before:bottom-1 
            before:w-0.5 before:rounded-full before:bg-primary 
            before:opacity-0 before:scale-y-0 before:transition-all before:duration-300
            ${isActive ? 'before:opacity-100 before:scale-y-100' : ''}
            hover:bg-sidebar-accent/50 active:scale-[0.98]
          `}
        >
          <Link href={item.url} className="flex items-center gap-2 w-full">
            <Icon className="transition-transform duration-200 group-hover:scale-110" />
            <span className="transition-all duration-200">{item.title}</span>
          </Link>
        </SidebarMenuButton>

        <CollapsibleTrigger asChild>
          <SidebarMenuAction showOnHover className="transition-all duration-200">
            <ChevronRight className="transition-transform duration-300 ease-out group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuAction>
        </CollapsibleTrigger>

        {badge && (
          <SidebarMenuBadge className="right-7 transition-all duration-200">
            {badge}
          </SidebarMenuBadge>
        )}

        <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <SidebarMenuSub>
            {subs.map((subItem, index) => (
              <SidebarMenuSubItem
                key={subItem}
                className="animate-in fade-in slide-in-from-left-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <SidebarMenuSubButton
                  asChild
                  className="transition-all duration-200 hover:bg-sidebar-accent/70"
                >
                  <Link href="#" className="transition-all duration-200">
                    <span>{subItem}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
