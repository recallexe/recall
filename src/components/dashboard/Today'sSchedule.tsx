import { schedule } from "@/app/lib/data";

export default function TodaysSchedule() {
  return (
    <div className="flex flex-col gap-2">
      {schedule.map((item, index) => (
        <div key={index} className="flex flex-row gap-3 border-2 p-3 rounded-lg">
          <div className="bg-blue-500 rounded-full w-1.5 h-13" />
          <div className="flex flex-col gap-2">
            <h3>{item.title}</h3>
            <p className="text-sm text-muted-foreground">
              {item.time} • {item.duration} • {item.location}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
