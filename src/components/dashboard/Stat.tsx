import React from "react";
import { Button } from "../ui/button";
import { Folder, Plus } from "lucide-react";
import Link from "next/link";

type StatProps = {
  title: string;
  value: number | string;
  change: string;
  icon: React.ReactNode;
  url: string;
};

export default function Stat({ title, value, change, icon, url }: StatProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* FIRST ROW */}
      <div className="flex items-start justify-between">
        <Link href={url} className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2 w-30">
            {icon}
            {title}
          </div>
        </Link>
        <Plus />
      </div>

      {/* SECOND ROW */}
      <div className="flex items-end justify-between">
        <h2 className="text-3xl mb-[-5px]">{value}</h2>
        <p className="text-sm text-muted-foreground">{change}</p>
      </div>
    </div>
  );
}
