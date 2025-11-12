"use client";
import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, Box, Folder, MoreHorizontal, Plus, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { NewProjectDialog } from "./NewProjectDialog";
import EditProjectDropdown from "./EditProjectDropdown";

async function tauriInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke<T>(cmd, args);
  } catch (err) {
    console.error(`Error invoking ${cmd}:`, err);
    throw err;
  }
}

interface Project {
  id: string;
  area_id: string;
  area_name?: string | null;
  title: string;
  description?: string | null;
  status: string;
  priority?: string | null;
  start_date?: number | null;
  end_date?: number | null;
  created_at: number;
  updated_at: number;
}

const STATUSES = ["Inbox", "Planned", "Progress", "Done"] as const;

/**
 * Project component renders a horizontal scrollable kanban board with project cards
 * organized by status (Inbox, Planned, Progress, Done).
 */
export default function Project() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const responseJson = await tauriInvoke<string>("get_projects", {
        token,
        area_id: null,
      });
      const projectsData = JSON.parse(responseJson);
      setProjects(projectsData);
    } catch (err: unknown) {
      console.error("Error fetching projects:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch projects";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Group projects by status
  const projectsByStatus = STATUSES.reduce((acc, status) => {
    acc[status] = projects.filter((p) => p.status === status);
    return acc;
  }, {} as Record<string, Project[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      {/* Creates a horizontal scrolling grid with fixed-width columns (340px) */}
      <div className="grid grid-flow-col auto-cols-[340px] h-[calc(100vh-100px)] gap-4 overflow-x-auto mt-4">
        {/* Iterates over each project status to create a column */}
        {STATUSES.map((status) => {
          const list = projectsByStatus[status] || [];
          return (
            <div key={status}>
              {/* Sticky header with status badge, project count, and add button */}
              <div className="flex flex-row items-center font-semibold gap-4 sticky top-0 z-50">
                {/* Status Badge */}
                <div
                  className={cn(
                    "rounded-xs py-0 px-3 w-fit",
                    status === "Inbox" && "bg-red-200 text-red-900",
                    status === "Planned" && "bg-blue-200 text-blue-900",
                    status === "Progress" && "bg-yellow-200 text-yellow-900",
                    status === "Done" && "bg-green-200 text-green-900"
                  )}
                >
                  <h2>{status === "Progress" ? "In progress" : status}</h2>
                </div>
                {/* Project Count */}
                <div>{list.length}</div>
                {/* Add Project Button (Quick) */}
                <NewProjectDialog
                  trigger={
                    <Button variant="ghost" size="icon">
                      <Plus size={22} />
                    </Button>
                  }
                  defaultStatus={status}
                  onSuccess={fetchProjects}
                />
              </div>

              <div className="flex flex-col gap-4 mt-2">
                {/* Renders individual project cards */}
                {list.map((project) => (
                  <Card
                    key={project.id}
                    className="p-4 space-y-1 hover:shadow-md transition"
                  >
                    {/* Project Header: Folder Icon + Title */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold">
                        <Box color="var(--primary)" size={20} strokeWidth={2.5} />
                        <Link href="/dashboard/projects">
                          <h3>{project.title}</h3>
                        </Link>
                      </div>
                      <EditProjectDropdown
                        project={project}
                        trigger={
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal />
                          </Button>
                        }
                        onUpdate={fetchProjects}
                      />
                    </div>

                    {/* Project Description */}
                    {project.description && (
                      <p className="text-muted-foreground">{project.description}</p>
                    )}
                    {/* Project Areas */}
                    <div className="flex items-center gap-2">
                      <Folder size={17} />
                      <span className="text-sm">{project.area_name || "Unknown Area"}</span>
                    </div>

                    {/* Project Footer: Date Range + Priority Badge */}
                    <div className="flex items-center flex-row justify-between">
                      {/* Date Range (Start → End) */}
                      {(project.start_date || project.end_date) && (
                        <div className="flex text-muted-foreground items-center gap-2 text-sm">
                          {project.start_date && (
                            <>
                              <p>{new Date(project.start_date * 1000).toLocaleDateString()}</p>
                              {project.end_date && (
                                <>
                                  <ArrowRight size={15} />
                                  <p>{new Date(project.end_date * 1000).toLocaleDateString()}</p>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {/* Priority Badge */}
                      <div>
                        {project.priority === "High" && (
                          <div className="bg-red-300 px-3 rounded-full text-red-800 text-sm">
                            {project.priority}
                          </div>
                        )}
                        {project.priority === "Medium" && (
                          <div className="bg-yellow-200 px-3 rounded-full text-yellow-800 text-sm">
                            {project.priority}
                          </div>
                        )}
                        {project.priority === "Low" && (
                          <div className="bg-green-200 px-3 rounded-full text-green-800 text-sm">
                            {project.priority}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}

                <NewProjectDialog
                  trigger={
                    <Button
                      variant="outline"
                      className="flex w-full flex-row items-center p-4"
                    >
                      <Plus className="mr-2" />
                      New Project
                    </Button>
                  }
                  defaultStatus={status}
                  onSuccess={fetchProjects}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
