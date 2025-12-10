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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/projects/DatePicker";

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
    title: string;
    area_id: string;
}

interface NewEventDialogProps {
    trigger?: React.ReactNode;
    defaultProjectId?: string;
    onSuccess?: () => void;
    event?: {
        id: string;
        project_id?: string | null;
        title: string;
        description?: string | null;
        start_time: number;
        end_time?: number | null;
        location?: string | null;
        all_day: boolean;
    } | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function NewEventDialog({
    trigger,
    defaultProjectId,
    onSuccess,
    event,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: NewEventDialogProps) {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = controlledOnOpenChange || setInternalOpen;
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [title, setTitle] = React.useState(event?.title || "");
    const [description, setDescription] = React.useState(event?.description || "");
    const [projectId, setProjectId] = React.useState(event?.project_id || defaultProjectId || "");
    const [location, setLocation] = React.useState(event?.location || "");
    const [allDay, setAllDay] = React.useState(event?.all_day || false);
    const [startDate, setStartDate] = React.useState<Date | undefined>(
        event?.start_time ? new Date(event.start_time * 1000) : new Date()
    );
    const [startTime, setStartTime] = React.useState<string>(() => {
        if (event?.start_time && !event.all_day) {
            const date = new Date(event.start_time * 1000);
            return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
        }
        return "09:00";
    });
    const [endDate, setEndDate] = React.useState<Date | undefined>(
        event?.end_time ? new Date(event.end_time * 1000) : undefined
    );
    const [endTime, setEndTime] = React.useState<string>(() => {
        if (event?.end_time && !event.all_day) {
            const date = new Date(event.end_time * 1000);
            return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
        }
        return "10:00";
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Validate end date is on or after start date
    React.useEffect(() => {
        if (endDate && startDate) {
            let isValid = true;
            if (allDay) {
                // For all-day events, compare dates only
                isValid = endDate >= startDate;
            } else {
                // For timed events, compare full date + time
                const startDateTime = new Date(startDate);
                if (startTime) {
                    const [hours, minutes] = startTime.split(":").map(Number);
                    startDateTime.setHours(hours, minutes, 0, 0);
                }
                const endDateTime = new Date(endDate);
                if (endTime) {
                    const [hours, minutes] = endTime.split(":").map(Number);
                    endDateTime.setHours(hours, minutes, 0, 0);
                } else {
                    endDateTime.setHours(23, 59, 59, 999);
                }
                isValid = endDateTime >= startDateTime;
            }

            if (!isValid) {
                setError("End date must be on or after start date");
            } else {
                // Clear error if it was the date validation error
                setError((prev) => prev === "End date must be on or after start date" ? null : prev);
            }
        }
    }, [startDate, endDate, startTime, endTime, allDay]);

    React.useEffect(() => {
        const fetchProjects = async () => {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) return;

                const responseJson = await tauriInvoke<string>("get_projects", {
                    token,
                    area_id: null,
                });
                const projectsData = JSON.parse(responseJson);
                setProjects(projectsData);
                if (projectsData.length > 0 && !event && !defaultProjectId) {
                    setProjectId(projectsData[0].id);
                }
            } catch (err) {
                console.error("Error fetching projects:", err);
            }
        };

        fetchProjects();
    }, [event, defaultProjectId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                setError("Not authenticated");
                setLoading(false);
                return;
            }

            if (!startDate) {
                setError("Start date is required");
                setLoading(false);
                return;
            }

            // Create start_time timestamp
            let startTimestamp = Math.floor(startDate.getTime() / 1000);
            let startDateTime: Date;
            if (!allDay && startTime) {
                const [hours, minutes] = startTime.split(":").map(Number);
                startDateTime = new Date(startDate);
                startDateTime.setHours(hours, minutes, 0, 0);
                startTimestamp = Math.floor(startDateTime.getTime() / 1000);
            } else {
                // For all-day events, set to start of day
                startDateTime = new Date(startDate);
                startDateTime.setHours(0, 0, 0, 0);
                startTimestamp = Math.floor(startDateTime.getTime() / 1000);
            }

            // Create end_time timestamp if provided
            let endTimestamp: number | undefined = undefined;
            if (endDate) {
                let endDateTime: Date;
                if (!allDay && endTime) {
                    const [hours, minutes] = endTime.split(":").map(Number);
                    endDateTime = new Date(endDate);
                    endDateTime.setHours(hours, minutes, 0, 0);
                    endTimestamp = Math.floor(endDateTime.getTime() / 1000);
                } else {
                    // For all-day events, set to end of day
                    endDateTime = new Date(endDate);
                    endDateTime.setHours(23, 59, 59, 999);
                    endTimestamp = Math.floor(endDateTime.getTime() / 1000);
                }

                // Validate that end date/time is on or after start date/time
                if (endDateTime < startDateTime) {
                    setError("End date must be on or after start date");
                    setLoading(false);
                    return;
                }
            }

            const requestData = {
                project_id: projectId || null,
                title: title.trim(),
                description: description.trim() || null,
                start_time: startTimestamp,
                end_time: endTimestamp || null,
                location: location.trim() || null,
                all_day: allDay,
            };

            if (event) {
                // Update existing event
                const responseJson = await tauriInvoke<string>("update_event", {
                    token,
                    id: event.id,
                    json: JSON.stringify(requestData),
                });
                const response = JSON.parse(responseJson);
                if (!response.success) {
                    setError(response.message || "Failed to update event");
                    setLoading(false);
                    return;
                }
            } else {
                // Create new event
                const responseJson = await tauriInvoke<string>("create_event", {
                    token,
                    json: JSON.stringify(requestData),
                });
                const response = JSON.parse(responseJson);
                if (!response.success) {
                    setError(response.message || "Failed to create event");
                    setLoading(false);
                    return;
                }
            }

            setOpen(false);
            if (onSuccess) {
                onSuccess();
            }
        } catch (err: unknown) {
            console.error("Error saving event:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to save event";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{event ? "Edit Event" : "New Event"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Event title"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Event description"
                                rows={3}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="project">Project (Optional)</Label>
                            <NativeSelect
                                id="project"
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value)}
                            >
                                <NativeSelectOption value="">None</NativeSelectOption>
                                {projects.map((project) => (
                                    <NativeSelectOption key={project.id} value={project.id}>
                                        {project.title}
                                    </NativeSelectOption>
                                ))}
                            </NativeSelect>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Event location"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="allDay"
                                checked={allDay}
                                onChange={(e) => setAllDay(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="allDay" className="cursor-pointer">
                                All-day event
                            </Label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <DatePicker
                                    title="Start Date *"
                                    value={startDate}
                                    onChange={setStartDate}
                                />
                                {!allDay && (
                                    <div className="mt-2">
                                        <Label htmlFor="startTime">Start Time</Label>
                                        <Input
                                            id="startTime"
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <DatePicker
                                    title="End Date (Optional)"
                                    value={endDate}
                                    onChange={setEndDate}
                                />
                                {!allDay && endDate && (
                                    <div className="mt-2">
                                        <Label htmlFor="endTime">End Time</Label>
                                        <Input
                                            id="endTime"
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                                {error}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {event ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

