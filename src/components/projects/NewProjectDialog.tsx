"use client";
import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "./DatePicker";

async function tauriInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke<T>(cmd, args);
  } catch (err) {
    console.error(`Error invoking ${cmd}:`, err);
    throw err;
  }
}

interface Area {
  id: string;
  name: string;
  image_url?: string | null;
  created_at: number;
  updated_at: number;
}

interface NewProjectDialogProps {
  trigger?: React.ReactNode;
  defaultStatus?: string;
  defaultAreaId?: string;
  onSuccess?: () => void;
  project?: {
    id: string;
    area_id: string;
    title: string;
    description?: string | null;
    status: string;
    priority?: string | null;
    start_date?: number | null;
    end_date?: number | null;
  } | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const STATUSES = ["Inbox", "Planned", "Progress", "Done"] as const;
const PRIORITIES = ["High", "Medium", "Low"] as const;

export function NewProjectDialog({ trigger, defaultStatus = "Inbox", defaultAreaId, onSuccess, project, open: controlledOpen, onOpenChange: controlledOnOpenChange }: NewProjectDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const [areas, setAreas] = React.useState<Area[]>([]);
  const [title, setTitle] = React.useState(project?.title || "");
  const [description, setDescription] = React.useState(project?.description || "");
  const [areaId, setAreaId] = React.useState(project?.area_id || defaultAreaId || "");
  const [status, setStatus] = React.useState(project?.status || defaultStatus);
  const [priority, setPriority] = React.useState(project?.priority || "");
  const [startDate, setStartDate] = React.useState<Date | undefined>(
    project?.start_date ? new Date(project.start_date * 1000) : undefined
  );
  const [endDate, setEndDate] = React.useState<Date | undefined>(
    project?.end_date ? new Date(project.end_date * 1000) : undefined
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const hasInitializedAreaId = React.useRef(false);

  React.useEffect(() => {
    const fetchAreas = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) return;

        const responseJson = await tauriInvoke<string>("get_areas", {
          token,
        });
        const areasData = JSON.parse(responseJson);
        setAreas(areasData);
        if (areasData.length > 0 && !project && !hasInitializedAreaId.current) {
          // Use defaultAreaId if provided, otherwise use first area
          const initialAreaId = defaultAreaId || areasData[0].id;
          setAreaId(initialAreaId);
          hasInitializedAreaId.current = true;
        }
      } catch (err) {
        console.error("Error fetching areas:", err);
      }
    };

    if (open) {
      fetchAreas();
      if (project) {
        setTitle(project.title);
        setDescription(project.description || "");
        setAreaId(project.area_id);
        setStatus(project.status);
        setPriority(project.priority || "");
        setStartDate(project.start_date ? new Date(project.start_date * 1000) : undefined);
        setEndDate(project.end_date ? new Date(project.end_date * 1000) : undefined);
        hasInitializedAreaId.current = true;
      } else {
        setTitle("");
        setDescription("");
        setAreaId(defaultAreaId || "");
        setStatus(defaultStatus);
        setPriority("");
        setStartDate(undefined);
        setEndDate(undefined);
        hasInitializedAreaId.current = false;
      }
      setError(null);
    } else {
      hasInitializedAreaId.current = false;
    }
  }, [open, project, defaultStatus, defaultAreaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      if (!areaId) {
        setError("Please select an area");
        return;
      }

      const request = {
        area_id: areaId,
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority: priority || null,
        start_date: startDate ? Math.floor(startDate.getTime() / 1000) : null,
        end_date: endDate ? Math.floor(endDate.getTime() / 1000) : null,
      };

      if (project) {
        // Update existing project
        const responseJson = await tauriInvoke<string>("update_project", {
          token,
          id: project.id,
          json: JSON.stringify(request),
        });
        const response = JSON.parse(responseJson);
        if (!response.success) {
          setError(response.message || "Failed to update project");
          return;
        }
      } else {
        // Create new project
        const responseJson = await tauriInvoke<string>("create_project", {
          token,
          json: JSON.stringify(request),
        });
        const response = JSON.parse(responseJson);
        if (!response.success) {
          setError(response.message || "Failed to create project");
          return;
        }
      }

      setOpen(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      console.error("Error saving project:", err);
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Add New Project"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Project title"
                required
                disabled={loading}
              />
            </div>

            <div className="grid w-full gap-3">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Project description (optional)"
                disabled={loading}
              />
            </div>

            <div className="flex gap-2">
              {/* Area Select */}
              <div className="flex-1 grid gap-3">
                <Label htmlFor="area">Area</Label>
                <NativeSelect
                  id="area"
                  value={areaId}
                  onChange={(e) => setAreaId(e.target.value)}
                  className="w-full"
                  required
                  disabled={loading}
                >
                  <NativeSelectOption value="">Select Area</NativeSelectOption>
                  {areas.map((area) => (
                    <NativeSelectOption key={area.id} value={area.id}>
                      {area.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>

              {/* Status Select */}
              <div className="flex-1 grid gap-3">
                <Label htmlFor="status">Status</Label>
                <NativeSelect
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full"
                  required
                  disabled={loading}
                >
                  {STATUSES.map((s) => (
                    <NativeSelectOption key={s} value={s}>
                      {s === "Progress" ? "In progress" : s}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="priority">Priority</Label>
                <NativeSelect
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full mt-2"
                  disabled={loading}
                >
                  <NativeSelectOption value="">None</NativeSelectOption>
                  {PRIORITIES.map((p) => (
                    <NativeSelectOption key={p} value={p}>
                      {p}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Label>Start Date (optional)</Label>
                <DatePicker
                  title=""
                  value={startDate}
                  onChange={setStartDate}
                />
              </div>
              <div className="flex-1">
                <Label>End Date (optional)</Label>
                <DatePicker
                  title=""
                  value={endDate}
                  onChange={setEndDate}
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {project ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
