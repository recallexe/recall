import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Delete, Edit, Trash } from "lucide-react";

export default function EditProjectDropdown({
  triger,
}: {
  triger: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{triger}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Edit />
          Edit Project
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Trash />
          Delete Project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
