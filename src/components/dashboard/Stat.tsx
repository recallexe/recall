import React from "react";
import { Plus } from "lucide-react";
import Link from "next/link";

type StatProps = {
  title: string;
  value: number | string;
  change: string;
  icon: React.ReactNode;
  url: string;
  bgcolor?: string;
};

export default function Stat({
  title,
  value,
  change,
  icon,
  url,
  bgcolor,
}: StatProps) {
  return (
    <div
      className={`flex flex-col gap-4 p-4 rounded-lg border-2 hover:shadow-md transition`}
    >
      {/* FIRST ROW */}
      <div className="flex items-center justify-between">
        <Link href={url}>
          <div className="flex items-center gap-2">
            {icon}
            {title}
          </div>
        </Link>
        <Plus />
      </div>

      {/* SECOND ROW */}
      <div className="flex items-end justify-between">
        <h2 className="text-3xl text-primary mb-[-5px]">{value}</h2>
        <p className="text-sm">{change}</p>
      </div>
    </div>
  );
}
