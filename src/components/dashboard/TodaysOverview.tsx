import { TodayOverview } from "@/app/lib/data";
import Link from "next/link";

type TOLProps = {
  icon: any;
  message: string;
  area: string;
  type: string;
  deadline: string;
  priorty: string;
  url: string;
};

export default function TodayOverviewList({
  icon,
  message,
  area,
  type,
  deadline,
  priorty,
  url,
}: TOLProps) {
  return (
    <div className="pb-2 border-b last:border-none">
      <Link href={`${url}`}>
        <div className="flex items-center gap-2">
          {type === "Task" ? icon[0] : icon[1]}
          {message}
        </div>
      </Link>
      <div className="flex items-center gap-5 text-sm text-muted-foreground pl-7">
        {area} • {type} • {`Due ${deadline}`} •
        <div>
          {priorty === "high" && (
            <div className="bg-red-400 px-2 rounded-full text-black text-xs">
              High
            </div>
          )}
          {priorty === "medium" && (
            <div className="bg-yellow-300 px-2 rounded-full text-black text-xs">
              Medium
            </div>
          )}
          {priorty === "low" && (
            <div className="bg-green-400 px-2 rounded-full text-black text-xs">
              Low
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
