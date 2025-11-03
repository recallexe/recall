import { projects } from "@/app/lib/data";

import { Card } from "@/components/ui/card";
import { Folder, Plus } from "lucide-react";

export default function Project() {
  return (
    <>
      {/* Scrollable grid container */}
      <div className="grid grid-flow-col auto-cols-[350px] h-[calc(100vh-100px)] gap-4 overflow-x-auto mt-4">
        {Object.entries(projects).map(([status, list]) => (
          <div key={status}>
            <div className="flex flex-row items-center gap-2">
              <Card className="bg-popover rounded-full py-0.5 px-4 w-fit">
                <h2>{status}</h2>
              </Card>
              <div>{list.length}</div>
              <Plus size={22} />
            </div>
            <div className="flex flex-col gap-4 mt-2">
              {list.map((project) => (
                <Card key={project.id} className="p-4">
                  <div className="flex items-center gap-2">
                    <Folder size={20} />
                    <h3 className="text-lg">{project.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{project.description}</p>
                  <p>{project.due}</p>
                  <p>{project.priority}</p>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
