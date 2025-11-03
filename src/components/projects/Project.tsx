import { projects } from "@/app/lib/data";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, Folder, Plus } from "lucide-react";
import { Button } from "../ui/button";

export default function Project() {
  return (
    <>
      {/* Scrollable grid container */}
      <div className="grid grid-flow-col auto-cols-[340px] h-[calc(100vh-100px)] gap-4 overflow-x-auto mt-4">
        {Object.entries(projects).map(([status, list]) => (
          <div key={status}>
            <div className="flex flex-row items-center font-semibold gap-4 mb-4 sticky top-0 z-50">
              <Card
                className={cn(
                  "rounded-full py-0 px-4 w-fit",
                  status === "Inbox" && "bg-red-200 text-red-900",
                  status === "Planned" && "bg-blue-200 text-blue-900",
                  status === "Progress" && "bg-yellow-200 text-yellow-900",
                  status === "Done" && "bg-green-200 text-green-900"
                )}
              >
                <h2>{status === "Progress" ? "In Progress" : status}</h2>
              </Card>
              <div>{list.length}</div>
              <Plus size={22} />
            </div>
            <div className="flex flex-col gap-4 mt-2">
              {list.map((project) => (
                <Card
                  key={project.id}
                  className="p-4 space-y-3 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-2">
                    <Folder color="var(--primary)" size={20} />
                    <h3 className="text-lg">{project.title}</h3>
                  </div>
                  <p>{project.description}</p>
                  <div className="flex items-center flex-row justify-between">
                    <div className="flex text-muted-foreground items-center gap-2 text-md">
                      <p>{project.startDate}</p>
                      <ArrowRight size={15} />
                      <p>{project.endDate}</p>
                    </div>
                    <div>
                      {project.priority === "High" && (
                        <div className="bg-red-300 px-2 rounded-full text-red-800 text-xs">
                          {project.priority}
                        </div>
                      )}
                      {project.priority === "Medium" && (
                        <div className="bg-yellow-200 px-2 rounded-full text-yellow-800 text-xs">
                          {project.priority}
                        </div>
                      )}
                      {project.priority === "Low" && (
                        <div className="bg-green-200 px-2 rounded-full text-green-800 text-xs">
                          {project.priority}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              <Button
                variant="outline"
                className="flex flex-row items-center p-4"
              >
                <Plus />
                New Project
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
