import type React from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Card } from "../ui/card";
import { NewAreaDialog } from "../area/NewAreaDialog";
import { NewProjectDialog } from "../projects/NewProjectDialog";
import { NewResourceDialog } from "../resources/NewResourceDialog";
import { Button } from "../ui/button";

type StatProps = {
  title: string;
  value: number | string;
  change: string;
  icon: React.ReactNode;
  url: string;
  bgcolor?: string;
  onAddSuccess?: () => void;
};

/**
 * Stat component - Displays a statistic card with title, value, change indicator,
 * and icon. Used in the dashboard to show counts for Areas, Projects, Tasks, etc.
 */
export default function Stat({
  title,
  value,
  change,
  icon,
  url,
  onAddSuccess,
}: StatProps) {
  const renderAddButton = () => {
    const button = (
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        type="button"
      >
        <Plus className="h-4 w-4" />
      </Button>
    );

    if (title.toLowerCase() === "areas") {
      return (
        <NewAreaDialog
          trigger={button}
          onSuccess={() => {
            if (onAddSuccess) {
              onAddSuccess();
            }
          }}
        />
      );
    } else if (title.toLowerCase() === "projects") {
      return (
        <NewProjectDialog
          trigger={button}
          onSuccess={() => {
            if (onAddSuccess) {
              onAddSuccess();
            }
          }}
        />
      );
    } else if (title.toLowerCase() === "resources") {
      return (
        <NewResourceDialog
          trigger={button}
          onSuccess={() => {
            if (onAddSuccess) {
              onAddSuccess();
            }
          }}
        />
      );
    }

    // For unimplemented features, return non-clickable button
    return button;
  };

  return (
    <Card className={`flex flex-col gap-4 p-4 hover:shadow-md transition`}>
      <div className="flex items-center justify-between">
        {/* Title with Icon and Link */}
        <Link href={url}>
          <div className="flex items-center gap-2">
            {icon}
            {title}
          </div>
        </Link>
        {/* Add Button */}
        {renderAddButton()}
      </div>

      <div className="flex items-end justify-between">
        {/* Main Value */}
        <h2 className="text-3xl text-primary mb-[-5px]">{value}</h2>
        {/* Change Indicator - only show if not empty */}
        {change && <p className="text-sm">{change}</p>}
      </div>
    </Card>
  );
}
