"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "../ui/card";
import { format, isToday, isSameDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";

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
  title: string;
  description?: string | null;
  start_time: number;
  end_time?: number | null;
  location?: string | null;
  all_day: boolean;
  project_name?: string | null;
}

export default function TodaysSchedule() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodaysEvents = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const responseJson = await tauriInvoke<string>("get_events", {
        token,
        start_date: Math.floor(startOfDay.getTime() / 1000),
        end_date: Math.floor(endOfDay.getTime() / 1000),
        project_id: null,
      });
      const response = JSON.parse(responseJson);
      if (response.success) {
        // Filter to only today's events and sort by start time
        const todaysEvents = (response.events || [])
          .filter((event: Event) => {
            const eventDate = new Date(event.start_time * 1000);
            return isToday(eventDate);
          })
          .sort((a: Event, b: Event) => a.start_time - b.start_time);
        setEvents(todaysEvents);
      }
    } catch (err) {
      console.error("Error fetching today's events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodaysEvents();
  }, [fetchTodaysEvents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Loading schedule...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CalendarIcon className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No events scheduled for today</p>
        <Link
          href="/dashboard/events"
          className="text-sm text-primary hover:underline mt-2"
        >
          Create an event
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {events.map((event, index) => (
        <Card
          key={event.id}
          className="flex items-center flex-row gap-3 p-3 bg-background/60 hover:bg-orange-500/5 hover:border-orange-500/15 transition-all duration-200 border border-transparent group backdrop-blur-sm"
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        >
          <div className="bg-gradient-to-b from-orange-500/70 to-red-500/70 rounded-full w-1.5 h-full min-h-[40px] flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow" />
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <Link href="/dashboard/events" className="hover:underline group/link">
              <h3 className="font-semibold text-sm text-foreground group-hover/link:text-orange-700 dark:group-hover/link:text-orange-300 transition-colors">
                {event.title}
              </h3>
            </Link>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-medium text-orange-800 dark:text-orange-200 bg-orange-500/20 dark:bg-orange-500/25 px-2 py-0.5 rounded-full border border-orange-500/15">
                {event.all_day
                  ? "All day"
                  : format(new Date(event.start_time * 1000), "h:mm a")}
                {event.end_time &&
                  !event.all_day &&
                  ` - ${format(new Date(event.end_time * 1000), "h:mm a")}`}
              </span>
              {event.location && (
                <span className="text-xs text-foreground/70 flex items-center gap-1">
                  📍 {event.location}
                </span>
              )}
              {event.project_name && (
                <span className="text-xs text-foreground/70 flex items-center gap-1">
                  📁 {event.project_name}
                </span>
              )}
            </div>
            {event.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{event.description}</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
