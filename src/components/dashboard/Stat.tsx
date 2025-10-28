import React from "react";
import { Button } from "../ui/button";
import { Folder, Plus } from "lucide-react";
import Link from "next/link";

type StatProps = {
  title: string;
  value: number | string;
  change: string;
  icon: React.ReactNode;
};

export default function Stat({ title, value, change, icon }: StatProps) {
  return (
    <div className="flex items-center justify-between">
      {/* Left: text content (allows wrapping) */}
      <div className="flex flex-col gap-8">
        <Link href="/dashboard/areas" className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            {icon}
            {title}
          </div>
        </Link>
        <h2 className="text-4xl font-semibold">{value}</h2>
      </div>

      {/* Right: icon container, vertically centered */}
      <div className="flex flex-col justify-between gap-9">
        <Plus />
        <p className="text-sm text-muted-foreground">{change}</p>
      </div>
    </div>
  );
}
