"use client";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, Box, Folder, MoreHorizontal, Plus, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { NewProjectDialog } from "./NewProjectDialog";
import EditProjectDropdown from "./EditProjectDropdown";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
  type DragEndEvent,
} from "@/components/ui/shadcn-io/kanban";

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

// Map status to display name
const getStatusDisplayName = (status: string) => {
  return status === "Progress" ? "In progress" : status;
};

// Map status to color
const getStatusColor = (status: string) => {
  switch (status) {
    case "Inbox":
      return "#EF4444"; // red-500
    case "Planned":
      return "#3B82F6"; // blue-500
    case "Progress":
      return "#EAB308"; // yellow-500
    case "Done":
      return "#22C55E"; // green-500
    default:
      return "#6B7280"; // gray-500
  }
};

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

  // Transform projects to kanban format
  const kanbanData = projects.map((project) => ({
    id: project.id,
    name: project.title,
    column: project.status,
    project, // Include full project data for access in render
  }));

  // Create columns from statuses
  const columns = STATUSES.map((status) => ({
    id: status,
    name: getStatusDisplayName(status),
    color: getStatusColor(status),
  }));

  // Handle drag end - update project status
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }

      const project = projects.find((p) => p.id === active.id);
      if (!project) {
        return;
      }

      // Find the target column - check if over.id is a column first, then check if it's a project
      let targetColumn: string | undefined;

      // Check if dragging to a column
      const targetColumnObj = columns.find((col) => col.id === over.id);
      if (targetColumnObj) {
        targetColumn = targetColumnObj.id;
      } else {
        // Check if dragging to another project (use that project's column)
        const targetProject = projects.find((p) => p.id === over.id);
        if (targetProject) {
          targetColumn = targetProject.status;
        }
      }

      if (!targetColumn || targetColumn === project.status) {
        return;
      }

      // Update project status via backend
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          return;
        }

        const responseJson = await tauriInvoke<string>("move_project", {
          token,
          id: project.id,
          new_status: targetColumn,
        });
        const response = JSON.parse(responseJson);
        if (response.success) {
          // Refresh projects list
          await fetchProjects();
        } else {
          console.error("Failed to move project:", response.message);
          // Revert optimistic update on error
          await fetchProjects();
        }
      } catch (err) {
        console.error("Error moving project:", err);
        // Revert optimistic update on error
        await fetchProjects();
      }
    },
    [projects, columns, fetchProjects]
  );

  // Handle data change from kanban (for optimistic updates)
  const handleDataChange = useCallback((newData: typeof kanbanData) => {
    // Update local state optimistically
    const updatedProjects = newData
      .map((item) => {
        const originalProject = projects.find((p) => p.id === item.id);
        if (!originalProject) {
          return null;
        }
        if (item.column !== originalProject.status) {
          return { ...originalProject, status: item.column };
        }
        return originalProject;
      })
      .filter((p): p is Project => p !== null);
    setProjects(updatedProjects);
  }, [projects]);

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
    <div className="h-[calc(100vh-100px)] mt-4">
      <KanbanProvider
        columns={columns}
        data={kanbanData}
        onDataChange={handleDataChange}
        onDragEnd={handleDragEnd}
        className="h-full"
      >
        {(column) => {
          const columnProjects = projects.filter((p) => p.status === column.id);
          return (
            <KanbanBoard id={column.id} key={column.id} className="min-h-40">
              <KanbanHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <span className="font-semibold">{column.name}</span>
                    <span className="text-muted-foreground">({columnProjects.length})</span>
                  </div>
                  <NewProjectDialog
                    trigger={
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Plus size={16} />
                      </Button>
                    }
                    defaultStatus={column.id}
                    onSuccess={fetchProjects}
                  />
                </div>
              </KanbanHeader>
              <KanbanCards id={column.id}>
                {(item: typeof kanbanData[number]) => {
                  const project = (item as { project: Project }).project;
                  return (
                    <KanbanCard
                      key={project.id}
                      id={project.id}
                      name={project.title}
                      column={project.status}
                      className="p-4 space-y-2"
                    >
                      {/* Project Header: Folder Icon + Title */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-semibold">
                          <Box className="h-4 w-4 text-primary shrink-0" />
                          <Link href="/dashboard/projects" className="hover:underline">
                            <h3 className="text-sm font-semibold">{project.title}</h3>
                          </Link>
                        </div>
                        <EditProjectDropdown
                          project={project}
                          trigger={
                            <Button size="icon" variant="ghost" className="h-6 w-6">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                          onUpdate={fetchProjects}
                        />
                      </div>

                      {/* Project Description */}
                      {project.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      {/* Project Areas */}
                      <div className="flex items-center gap-2">
                        <Folder className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {project.area_name || "Unknown Area"}
                        </span>
                      </div>

                      {/* Project Footer: Date Range + Priority Badge */}
                      <div className="flex items-center justify-between gap-2">
                        {/* Date Range (Start → End) */}
                        {(project.start_date || project.end_date) && (
                          <div className="flex text-muted-foreground items-center gap-1 text-xs">
                            {project.start_date && (
                              <>
                                <span>{new Date(project.start_date * 1000).toLocaleDateString()}</span>
                                {project.end_date && (
                                  <>
                                    <ArrowRight className="h-3 w-3" />
                                    <span>{new Date(project.end_date * 1000).toLocaleDateString()}</span>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        )}

                        {/* Priority Badge */}
                        {project.priority && (
                          <div
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium",
                              project.priority === "High" && "bg-red-300 text-red-800",
                              project.priority === "Medium" && "bg-yellow-200 text-yellow-800",
                              project.priority === "Low" && "bg-green-200 text-green-800"
                            )}
                          >
                            {project.priority}
                          </div>
                        )}
                      </div>
                    </KanbanCard>
                  );
                }}
              </KanbanCards>
              <div className="p-2">
                <NewProjectDialog
                  trigger={
                    <Button
                      variant="outline"
                      className="flex w-full flex-row items-center justify-center p-3 text-sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      New Project
                    </Button>
                  }
                  defaultStatus={column.id}
                  onSuccess={fetchProjects}
                />
              </div>
            </KanbanBoard>
          );
        }}
      </KanbanProvider>
    </div>
  );
}
