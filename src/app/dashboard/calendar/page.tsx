"use client";

import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { NewEventDialog } from "@/components/events/NewEventDialog";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, startOfWeek, endOfWeek } from "date-fns";

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
  end_date?: number | null;
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Get start and end of current month
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);

      const responseJson = await tauriInvoke<string>("get_events", {
        token,
        start_date: Math.floor(start.getTime() / 1000),
        end_date: Math.floor(end.getTime() / 1000),
        project_id: null,
      });
      const response = JSON.parse(responseJson);
      if (response.success) {
        setEvents(response.events || []);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  }, [currentMonth]);

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
    setLoading(true);
    Promise.all([fetchEvents(), fetchProjects()]).finally(() => {
      setLoading(false);
    });
  }, [fetchEvents, fetchProjects]);

  const getEventsForDate = (date: Date): Event[] => {
    return events.filter((event) => {
      const eventDate = new Date(event.start_time * 1000);
      return isSameDay(eventDate, date);
    });
  };

  const getProjectDeadlinesForDate = (date: Date): Project[] => {
    return projects.filter((project) => {
      if (!project.end_date) return false;
      const deadlineDate = new Date(project.end_date * 1000);
      return isSameDay(deadlineDate, date);
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const daysInMonth = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const selectedDateDeadlines = selectedDate ? getProjectDeadlinesForDate(selectedDate) : [];

  return (
    <div className="ml-4 space-y-4">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList className="text-2xl">
            <BreadcrumbItem>
              <BreadcrumbPage>
                <BreadcrumbLink href="/dashboard/calendar">Calendar</BreadcrumbLink>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {format(currentMonth, "MMMM yyyy")}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={goToToday}>
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {Array.from({ length: 7 }, (_, idx) => {
                const day = new Date(calendarStart.getTime() + idx * 24 * 60 * 60 * 1000);
                return (
                  <div key={idx} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {format(day, "EEE")}
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map((day, idx) => {
                const dayEvents = getEventsForDate(day);
                const dayDeadlines = getProjectDeadlinesForDate(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      min-h-[80px] p-2 text-left border rounded-md transition-colors
                      ${isCurrentMonth ? "bg-background" : "bg-muted/30"}
                      ${isToday ? "ring-2 ring-primary" : ""}
                      ${isSelected ? "bg-primary/10 border-primary" : "hover:bg-accent"}
                    `}
                  >
                    <div className={`text-sm font-medium mb-1 ${isCurrentMonth ? "" : "text-muted-foreground"}`}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="text-xs bg-blue-500/20 text-blue-700 dark:text-blue-300 px-1 rounded truncate"
                          title={event.title}
                        >
                          {event.all_day ? "📅" : format(new Date(event.start_time * 1000), "h:mm a")} {event.title}
                        </div>
                      ))}
                      {dayDeadlines.slice(0, 1).map((project) => (
                        <div
                          key={project.id}
                          className="text-xs bg-orange-500/20 text-orange-700 dark:text-orange-300 px-1 rounded truncate"
                          title={`${project.title} deadline`}
                        >
                          ⏰ {project.title}
                        </div>
                      ))}
                      {(dayEvents.length > 2 || dayDeadlines.length > 1) && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length - 2 + Math.max(0, dayDeadlines.length - 1)} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, "EEEE, MMMM d") : "Select a date"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDate && (
              <>
                <div>
                  <h3 className="font-semibold mb-2">Events</h3>
                  {selectedDateEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No events scheduled</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDateEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-2 border rounded-md bg-blue-50 dark:bg-blue-950"
                        >
                          <div className="font-medium text-sm">{event.title}</div>
                          {event.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {event.description}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {event.all_day
                              ? "All day"
                              : format(new Date(event.start_time * 1000), "h:mm a")}
                            {event.end_time &&
                              !event.all_day &&
                              ` - ${format(new Date(event.end_time * 1000), "h:mm a")}`}
                          </div>
                          {event.location && (
                            <div className="text-xs text-muted-foreground">📍 {event.location}</div>
                          )}
                          {event.project_name && (
                            <div className="text-xs text-muted-foreground">📁 {event.project_name}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Project Deadlines</h3>
                  {selectedDateDeadlines.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No deadlines</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDateDeadlines.map((project) => (
                        <div
                          key={project.id}
                          className="p-2 border rounded-md bg-orange-50 dark:bg-orange-950"
                        >
                          <div className="font-medium text-sm">{project.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Deadline: {format(new Date(project.end_date! * 1000), "MMM d, yyyy")}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
