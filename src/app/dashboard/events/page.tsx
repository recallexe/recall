"use client";

import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import { Plus, Calendar as CalendarIcon, MapPin, Trash2, Edit2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NewEventDialog } from "@/components/events/NewEventDialog";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { format } from "date-fns";

async function tauriInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke<T>(cmd, args);
  } catch (err) {
    console.error(`Error invoking ${cmd}:`, err);
    throw err;
  }
}

interface Event {
  id: string;
  project_id?: string | null;
  project_name?: string | null;
  title: string;
  description?: string | null;
  start_time: number;
  end_time?: number | null;
  location?: string | null;
  all_day: boolean;
  created_at: number;
  updated_at: number;
}

interface Project {
  id: string;
  title: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProjectId, setFilterProjectId] = useState<string>("");
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [editEvent, setEditEvent] = useState<Event | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setLoading(false);
        return;
      }

      const responseJson = await tauriInvoke<string>("get_events", {
        token,
        start_date: null,
        end_date: null,
        project_id: filterProjectId || null,
      });
      const response = JSON.parse(responseJson);
      if (response.success) {
        // Sort events by start_time
        const sortedEvents = (response.events || []).sort(
          (a: Event, b: Event) => a.start_time - b.start_time
        );
        setEvents(sortedEvents);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }, [filterProjectId]);

  const fetchProjects = useCallback(async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const responseJson = await tauriInvoke<string>("get_projects", {
        token,
        area_id: null,
      });
      const projectsData = JSON.parse(responseJson);
      setProjects(projectsData);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    setLoading(true);
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async () => {
    if (!deleteEventId) return;

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const responseJson = await tauriInvoke<string>("delete_event", {
        token,
        id: deleteEventId,
      });
      const response = JSON.parse(responseJson);
      if (response.success) {
        setDeleteEventId(null);
        fetchEvents();
      } else {
        alert(response.message || "Failed to delete event");
      }
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event");
    }
  };

  const groupedEvents = events.reduce((acc, event) => {
    const date = new Date(event.start_time * 1000);
    const dateKey = format(date, "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  const sortedDates = Object.keys(groupedEvents).sort();

  if (loading) {
    return (
      <div className="ml-4 flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="ml-4 space-y-4">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList className="text-2xl">
            <BreadcrumbItem>
              <BreadcrumbPage>
                <BreadcrumbLink href="/dashboard/events">Events</BreadcrumbLink>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-2">
          <NativeSelect
            value={filterProjectId}
            onChange={(e) => setFilterProjectId(e.target.value)}
            className="w-48"
          >
            <NativeSelectOption value="">All Projects</NativeSelectOption>
            {projects.map((project) => (
              <NativeSelectOption key={project.id} value={project.id}>
                {project.title}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <NewEventDialog
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Event
              </Button>
            }
            onSuccess={() => {
              fetchEvents();
            }}
          />
        </div>
      </div>

      {sortedDates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">
              {filterProjectId
                ? "No events found for the selected project."
                : "Get started by creating your first event."}
            </p>
            <NewEventDialog
              trigger={<Button>Create Event</Button>}
              onSuccess={() => {
                fetchEvents();
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => {
            const dateEvents = groupedEvents[dateKey];
            const date = new Date(dateKey);
            const isToday = format(new Date(), "yyyy-MM-dd") === dateKey;

            return (
              <Card key={dateKey}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    {format(date, "EEEE, MMMM d, yyyy")}
                    {isToday && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        Today
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dateEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {event.all_day ? (
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{event.title}</h4>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {event.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                {event.all_day ? (
                                  <span>All day</span>
                                ) : (
                                  <span>
                                    {format(new Date(event.start_time * 1000), "h:mm a")}
                                    {event.end_time &&
                                      ` - ${format(new Date(event.end_time * 1000), "h:mm a")}`}
                                  </span>
                                )}
                                {event.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {event.location}
                                  </span>
                                )}
                                {event.project_name && (
                                  <span className="flex items-center gap-1">
                                    📁 {event.project_name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditEvent(event)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteEventId(event.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Event Dialog */}
      {editEvent && (
        <NewEventDialog
          event={editEvent}
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditEvent(null);
          }}
          onSuccess={() => {
            setEditEvent(null);
            fetchEvents();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEventId} onOpenChange={(open) => !open && setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
