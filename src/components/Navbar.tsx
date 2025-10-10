import {
  Bell,
  LogOut,
  MessageSquare,
  Network,
  PanelRight,
  Plus,
  Search,
  Settings,
  User2,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  return (
    <nav className="p-4 flex items-center justify-between">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <Button variant="outline">
          <PanelRight />
        </Button>
        <Button variant="outline">
          <Search />
          Search Anything
        </Button>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <Button variant="outline">
          <Plus />
          New
        </Button>
        <Button variant="outline">
          <Network />
          Knowledge Graph
        </Button>
        <Button variant="outline">
          <MessageSquare />
        </Button>
        <Button variant="outline">
          <Bell />
        </Button>

        {/* DROPDOWN MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src="profile-pic.jpg" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={10}>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
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
      </div>
    </nav>
  );
}
