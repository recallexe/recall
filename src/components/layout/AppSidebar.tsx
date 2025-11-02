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

  const workspaceItems = [
    "Dashboard",
    "Areas",
    "Projects",
    "Tasks",
    "Notes",
    "Events",
  ];
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
              className="group-data-[collapsible=icon]:p-0! transition-all duration-300"
            >
              <Link href="/dashboard" className="group/logo">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 transition-all duration-300 group-hover/logo:shadow-lg group-hover/logo:shadow-blue-200 dark:group-hover/logo:shadow-blue-900/50">
                  <Brain className="size-6 text-[#4299e1] transition-all duration-300 group-hover/logo:scale-110 group-hover/logo:rotate-6" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight transition-all duration-300">
                  <span className="truncate font-serif text-2xl bg-linear-to-r from-[#4299e1] to-[#3182ce] bg-clip-text text-transparent font-bold">
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
          <SidebarGroupLabel className="text-xs font-semibold tracking-wider">
            Workspace
          </SidebarGroupLabel>
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
                    const subs =
                      (sample as Record<string, string[]>)[item.key] || [];
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

        <SidebarSeparator className="my-2" />

        {/* LIBRARY */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold tracking-wider">
            Library
          </SidebarGroupLabel>
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

        <SidebarSeparator className="my-2" />

        {/* MORE */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold tracking-wider">
            More
          </SidebarGroupLabel>
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
          group/item relative overflow-hidden transition-all duration-200
          before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0
          before:w-1 before:bg-linear-to-b before:from-primary before:to-primary/60
          before:opacity-0 before:scale-y-0 before:-translate-x-1
          before:transition-all before:duration-300 before:ease-out
          ${
            isActive
              ? "before:opacity-100 before:scale-y-100 before:translate-x-0 bg-sidebar-accent/50"
              : "bg-transparent"
          }
          hover:bg-sidebar-accent/50 active:scale-[0.98]
          after:content-[''] after:absolute after:inset-0 after:bg-linear-to-r 
          after:from-transparent after:via-primary/5 after:to-transparent
          after:-translate-x-full after:transition-transform after:duration-500
          hover:after:translate-x-full
        `}
      >
        <Link href={url} className="flex items-center gap-3 w-full group/link">
          <Icon
            className={`
            h-4 w-4 transition-all duration-200 
            group-hover/link:scale-110
            ${
              isActive
                ? "text-primary"
                : "text-muted-foreground group-hover/link:text-foreground"
            }
          `}
          />
          <span
            className={`
            transition-all duration-200 font-medium
            ${isActive ? "text-primary" : "text-foreground"}
            group-hover/link:translate-x-0.5
          `}
          >
            {title}
          </span>
        </Link>
      </SidebarMenuButton>
      {badge && (
        <SidebarMenuBadge className="transition-all duration-200 bg-primary/10 text-primary font-semibold">
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
              group/item relative overflow-hidden transition-all duration-200
              before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0
              before:w-1 before:bg-linear-to-b before:from-primary before:to-primary/60
              before:opacity-0 before:scale-y-0 before:-translate-x-1
              before:transition-all before:duration-300 before:ease-out
              ${
                isActive
                  ? "before:opacity-100 before:scale-y-100 before:translate-x-0 bg-sidebar-accent/50"
                  : "bg-transparent"
              }
              hover:bg-sidebar-accent/50 active:scale-[0.98]
              after:content-[''] after:absolute after:inset-0 after:bg-linear-to-r 
              after:from-transparent after:via-primary/5 after:to-transparent
              after:-translate-x-full after:transition-transform after:duration-500
              hover:after:translate-x-full
            `}
        >
          <Link
            href={item.url}
            className="flex items-center gap-3 w-full group/link"
          >
            <Icon
              className={`
               h-4 w-4 transition-all duration-200 
               group-hover/link:scale-110
               ${
                 isActive
                   ? "text-primary"
                   : "text-muted-foreground group-hover/link:text-foreground"
               }
             `}
            />
            <span
              className={`
                transition-all duration-200 font-medium
                ${isActive ? "text-primary" : "text-foreground"}
                group-hover/link:translate-x-0.5
              `}
            >
              {item.title}
            </span>
          </Link>
        </SidebarMenuButton>

        <CollapsibleTrigger asChild>
          <SidebarMenuAction
            showOnHover
            className="transition-all duration-200 hover:bg-primary/10 hover:text-primary"
          >
            <ChevronRight className="transition-all duration-300 ease-out group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuAction>
        </CollapsibleTrigger>

        {badge && (
          <SidebarMenuBadge className="right-8 transition-all duration-200 bg-primary/10 text-primary font-semibold">
            {badge}
          </SidebarMenuBadge>
        )}

        <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <SidebarMenuSub className="ml-0 pl-0 border-l-2 border-primary/20">
            {subs.map((subItem, index) => (
              <SidebarMenuSubItem
                key={subItem}
                className="animate-in fade-in slide-in-from-left-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <SidebarMenuSubButton
                  asChild
                  className="transition-all duration-200 bg-transparent hover:bg-sidebar-accent/50 hover:translate-x-1 ml-4"
                >
                  <Link
                    href="#"
                    className="transition-all duration-200 group/sublink"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover/sublink:bg-primary transition-all duration-200" />
                    <span className="text-muted-foreground group-hover/sublink:text-foreground group-hover/sublink:translate-x-0.5 transition-all duration-200">
                      {subItem}
                    </span>
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
