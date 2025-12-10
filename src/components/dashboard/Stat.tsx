import type React from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Card } from "../ui/card";
import { NewAreaDialog } from "../area/NewAreaDialog";
import { NewProjectDialog } from "../projects/NewProjectDialog";
import { NewResourceDialog } from "../resources/NewResourceDialog";
import { NewEventDialog } from "../events/NewEventDialog";
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
  // Get color scheme based on title - muted and accessible colors
  const getColorScheme = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle === "areas") {
      return {
        gradient: "from-purple-500/8 via-purple-400/4 to-blue-500/8",
        border: "border-purple-500/15",
        iconColor: "text-purple-600 dark:text-purple-400",
        valueColor: "text-purple-700 dark:text-purple-300",
      };
    } else if (lowerTitle === "projects") {
      return {
        gradient: "from-blue-500/8 via-blue-400/4 to-cyan-500/8",
        border: "border-blue-500/15",
        iconColor: "text-blue-600 dark:text-blue-400",
        valueColor: "text-blue-700 dark:text-blue-300",
      };
    } else if (lowerTitle === "events") {
      return {
        gradient: "from-orange-500/8 via-orange-400/4 to-red-500/8",
        border: "border-orange-500/15",
        iconColor: "text-orange-600 dark:text-orange-400",
        valueColor: "text-orange-700 dark:text-orange-300",
      };
    } else if (lowerTitle === "resources") {
      return {
        gradient: "from-green-500/8 via-green-400/4 to-emerald-500/8",
        border: "border-green-500/15",
        iconColor: "text-green-600 dark:text-green-400",
        valueColor: "text-green-700 dark:text-green-300",
      };
    }
    return {
      gradient: "from-gray-500/8 via-gray-400/4 to-gray-500/8",
      border: "border-gray-500/15",
      iconColor: "text-gray-600 dark:text-gray-400",
      valueColor: "text-gray-700 dark:text-gray-300",
    };
  };

  const colors = getColorScheme(title);

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
    } else if (title.toLowerCase() === "events") {
      return (
        <NewEventDialog
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
    <Card className={`flex flex-col gap-4 p-5 hover:shadow-lg transition-all duration-300 border-2 ${colors.border} bg-gradient-to-br ${colors.gradient} relative overflow-hidden group`}>
      {/* Decorative background pattern - very subtle */}
      <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
        <div className="absolute top-0 right-0 w-32 h-32 bg-current rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-current rounded-full -ml-12 -mb-12" />
      </div>

      <div className="flex items-center justify-between relative z-10">
        {/* Title with Icon and Link */}
        <Link href={url} className="group/link">
          <div className={`flex items-center gap-2 font-semibold text-foreground group-hover/link:scale-105 transition-transform`}>
            <div className={`p-1.5 rounded-lg bg-background/80 backdrop-blur-sm ${colors.iconColor}`}>
              {icon}
            </div>
            <span className="text-foreground">{title}</span>
          </div>
        </Link>
        {/* Add Button */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          {renderAddButton()}
        </div>
      </div>

      <div className="flex items-end justify-between relative z-10">
        {/* Main Value */}
        <h2 className={`text-4xl font-bold ${colors.valueColor} mb-[-5px] group-hover:scale-105 transition-transform drop-shadow-sm`}>
          {value}
        </h2>
        {/* Change Indicator - only show if not empty */}
        {change && <p className="text-sm text-muted-foreground font-medium">{change}</p>}
      </div>
    </Card>
  );
}
