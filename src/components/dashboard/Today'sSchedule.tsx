import { schedule } from "@/app/lib/data";
import { Card } from "../ui/card";

export default function TodaysSchedule() {
  return (
    <div className="flex flex-col gap-2">
      {schedule.map((item, index) => (
        <Card key={index} className="flex items-center flex-row gap-3 p-3">
          <div className=" bg-primary rounded-full w-1.5 h-13" />
          <div className="flex flex-col gap-2 justify-between">
            <h3>{item.title}</h3>
            <p className="text-sm text-muted-foreground">
              {item.time} • {item.duration} • {item.location}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
