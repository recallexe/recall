// ============================================================================
// IMPORTS
// ============================================================================
import React from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Card } from "../ui/card";

// ============================================================================
// TYPES
// ============================================================================
type StatProps = {
  title: string;
  value: number | string;
  change: string;
  icon: React.ReactNode;
  url: string;
  bgcolor?: string;
};

// ============================================================================
// STAT COMPONENT
// ============================================================================
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
  bgcolor,
}: StatProps) {
  return (
    <Card className={`flex flex-col gap-4 p-4 hover:shadow-md transition`}>
      {/* ==================================================================== */}
      {/* FIRST ROW: TITLE & ADD BUTTON */}
      {/* ==================================================================== */}
      <div className="flex items-center justify-between">
        {/* Title with Icon and Link */}
        <Link href={url}>
          <div className="flex items-center gap-2">
            {icon}
            {title}
          </div>
        </Link>
        {/* Add Button */}
        <Plus />
      </div>

      {/* ==================================================================== */}
      {/* SECOND ROW: VALUE & CHANGE */}
      {/* ==================================================================== */}
      <div className="flex items-end justify-between">
        {/* Main Value */}
        <h2 className="text-3xl text-primary mb-[-5px]">{value}</h2>
        {/* Change Indicator */}
        <p className="text-sm">{change}</p>
      </div>
    </Card>
  );
}
