"use client";

import {
  ChevronsUpDown,
  LogOut,
  Settings,
  User,
  User2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/");
  };

  const handleAccount = () => {
    router.push("/dashboard/account");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="group/user bg-transparent data-[state=open]:bg-sidebar-accent/50 data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-all duration-200"
            >
              <Avatar className="h-8 w-8 rounded-lg ring-2 ring-transparent group-hover/user:ring-primary/20 transition-all duration-200">
                <AvatarFallback className="rounded-lg bg-linear-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight transition-all duration-200 group-hover/user:translate-x-0.5">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground group-hover/user:text-foreground transition-all duration-200" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg shadow-lg border-2 animate-in fade-in slide-in-from-top-2 duration-200"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg ring-2 ring-primary/20">
                  <AvatarFallback className="rounded-lg bg-linear-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="group/item cursor-pointer transition-all duration-200"
                onClick={handleAccount}
              >
                <User2 className="group-hover/item:text-primary transition-all duration-200 group-hover/item:scale-110" />
                <span className="group-hover/item:translate-x-0.5 transition-all duration-200">
                  Account
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem className="group/item cursor-pointer transition-all duration-200">
                <Settings className="group-hover/item:text-primary transition-all duration-200 group-hover/item:rotate-90" />
                <span className="group-hover/item:translate-x-0.5 transition-all duration-200">
                  Settings
                </span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={handleLogout}
              className="group/item cursor-pointer transition-all duration-200 font-medium"
            >
              <LogOut className="group-hover/item:scale-110 transition-all duration-200" />
              <span className="group-hover/item:translate-x-0.5 transition-all duration-200">
                Log out
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
