"use client";
import { Card, CardContent } from "../ui/card";
import { Plus } from "lucide-react";
import { NewAreaDialog } from "./NewAreaDialog";

interface AddNewCardProps {
  onSuccess?: () => void;
}

const AddNewCard = ({ onSuccess }: AddNewCardProps) => {
  return (
    <NewAreaDialog
      trigger={
        <Card className="group relative overflow-hidden border-2 border-dashed hover:border-solid hover:shadow-md transition h-full flex flex-col cursor-pointer">
          <CardContent className="flex items-center justify-center flex-1 min-h-[120px] gap-3 flex-col p-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <Plus className="h-6 w-6" />
            </div>
            <p className="font-semibold text-base text-muted-foreground group-hover:text-foreground transition-colors">
              Add New Area
            </p>
          </CardContent>
        </Card>
      }
      onSuccess={onSuccess}
    />
  );
};

export default AddNewCard;
