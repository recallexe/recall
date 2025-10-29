import { TodayOverview } from "@/app/lib/data";
import Link from "next/link";

type TOLProps = {
    icon: any;
    message: string,
    area: string,
    type: string,
    deadline: string,
    priorty: string,
    url: string,

}

export default function TodayOverviewList({icon, message, area, type, deadline, priorty, url}:TOLProps) {
    return (
      <Link href={`${url}`}>
        <div className="py-2 border-b last:border-none">
          <div className="flex items-center gap-2">
            {type === "Task" ? icon[0] : icon[1]}
            {message}
          </div>
          <div className="flex items-center gap-5 text-sm text-muted-foreground pl-7">
            <div>{area}</div>
            <div>{type}</div>
            <div>{`Due ${deadline}`}</div>
            <div>
              {priorty === "high" && (
                <div className="bg-red-400 px-2 rounded-full text-black text-xs">
                  High Priority
                </div>
              )}
              {priorty === "medium" && (
                <div className="bg-yellow-300 px-2 rounded-full text-black text-xs">
                  Medium Priority
                </div>
              )}
              {priorty === "low" && (
                <div className="bg-green-400 px-2 rounded-full text-black text-xs">
                  Low Priority
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
}