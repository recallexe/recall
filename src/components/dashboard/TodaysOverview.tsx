import { TodayOverview } from "@/app/lib/data";
import { Calendar, CheckSquare } from "lucide-react";
import Link from "next/link";

type TOLProps = {
  message: string;
  area: string;
  type: string;
  deadline: string;
  priorty: string;
  url: string;
};

export default function TodayOverviewList({
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
          {type === "Task" ? <CheckSquare size={17} /> : <Calendar size={17}/>}
          {message}
        </div>
      </Link>
      <div className="flex items-center gap-5 text-sm text-muted-foreground pl-7">
        {area} • {type} • {`Due ${deadline}`} •
        <div>
          {priorty === "high" && (
            <div className="bg-red-300 px-2 rounded-full text-red-800 text-xs">
              High
            </div>
          )}
          {priorty === "medium" && (
            <div className="bg-yellow-200 px-2 rounded-full text-yellow-800 text-xs">
              Medium
            </div>
          )}
          {priorty === "low" && (
            <div className="bg-green-200 px-2 rounded-full text-green-800 text-xs">
              Low
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
