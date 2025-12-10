"use client";
import { useEffect, useState, useCallback } from "react";
import Stat from "@/components/dashboard/Stat";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { stats } from "@/app/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RecentUpcoming from "@/components/dashboard/RecentUpcoming";
import TodaysSchedule from "@/components/dashboard/Today'sSchedule";
import { format } from "date-fns";
import { Folder } from "lucide-react";
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

/**
 * Main dashboard page component that displays:
 * - Statistics cards (Areas, Projects, Tasks, Events, Notes, Resources)
 * - Today's Overview list
 * - Recent/Upcoming items
 * - Weekly Performance chart
 * - Today's Schedule
 */
interface Area {
  id: string;
  name: string;
  image_url?: string | null;
}

export default function Dashboard() {
  const [areasCount, setAreasCount] = useState<number>(0);
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [resourcesCount, setResourcesCount] = useState<number>(0);
  const [eventsCount, setEventsCount] = useState<number>(0);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Fetch areas count and data
      try {
        const areasJson = await tauriInvoke<string>("get_areas", { token });
        const areasData = JSON.parse(areasJson);
        const areasArray = Array.isArray(areasData) ? areasData : [];
        setAreasCount(areasArray.length);
        setAreas(areasArray.slice(0, 6)); // Get first 6 areas for preview
      } catch (err) {
        console.error("Error fetching areas:", err);
      }

      // Fetch projects count
      try {
        const projectsJson = await tauriInvoke<string>("get_projects", {
          token,
          area_id: null,
        });
        const projectsData = JSON.parse(projectsJson);
        setProjectsCount(Array.isArray(projectsData) ? projectsData.length : 0);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }

      // Fetch resources count
      try {
        const resourcesJson = await tauriInvoke<string>("get_resources", {
          token,
          project_id: null,
        });
        let resourcesData: unknown[] = [];
        if (typeof resourcesJson === "string") {
          if (resourcesJson.trim() === "") {
            resourcesData = [];
          } else {
            const parsed = JSON.parse(resourcesJson);
            resourcesData = Array.isArray(parsed) ? parsed : [];
          }
        } else if (Array.isArray(resourcesJson)) {
          resourcesData = resourcesJson;
        } else {
          resourcesData = [];
        }
        setResourcesCount(resourcesData.length);
      } catch (err) {
        console.error("Error fetching resources:", err);
      }

      // Fetch events count
      try {
        const eventsJson = await tauriInvoke<string>("get_events", {
          token,
          start_date: null,
          end_date: null,
          project_id: null,
        });
        const eventsResponse = JSON.parse(eventsJson);
        if (eventsResponse.success) {
          setEventsCount((eventsResponse.events || []).length);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Update stats with live data - only show implemented features
  const liveStats = {
    areas: {
      ...stats.areas,
      value: loading ? stats.areas.value : areasCount,
      change: "",
    },
    projects: {
      ...stats.projects,
      value: loading ? stats.projects.value : projectsCount,
      change: "",
    },
    events: {
      ...stats.events,
      value: loading ? stats.events.value : eventsCount,
      change: "",
    },
    resources: {
      ...stats.resources,
      value: loading ? stats.resources.value : resourcesCount,
      change: "",
    },
  };

  return (
    <>
      <main className="mx-4 mb-4">
        <Breadcrumb>
          <BreadcrumbList className="text-2xl">
            <BreadcrumbItem>
              <BreadcrumbPage>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <section>
          <div className="mt-4 flex flex-col gap-4">
            {/* Overview Section */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {Object.values(liveStats).map((item) => (
                  <Stat
                    key={item.title}
                    title={item.title}
                    value={item.value}
                    change={item.change}
                    icon={item.icon}
                    url={item.url}
                    onAddSuccess={fetchCounts}
                  />
                ))}
              </div>
            </div>

            {/* Areas Preview Section */}
            {areas.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Folder className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Your Areas
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {areas.map((area) => (
                    <Link
                      key={area.id}
                      href={`/dashboard/areas?area=${area.id}`}
                      className="group relative overflow-hidden rounded-lg border border-purple-500/15 hover:border-purple-500/30 transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                    >
                      <div
                        className="aspect-square bg-cover bg-center relative"
                        style={
                          area.image_url
                            ? {
                              backgroundImage: `url(${area.image_url})`,
                            }
                            : {
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            }
                        }
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="text-white font-semibold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            {area.name}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Today's Schedule and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Today's Schedule Card */}
              <Card className="border border-orange-500/10 bg-gradient-to-br from-orange-500/4 via-orange-400/2 to-red-500/4 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/3 rounded-full -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/3 rounded-full -ml-16 -mb-16" />
                <CardHeader className="relative z-10 bg-background/40 backdrop-blur-sm rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <div className="p-2 rounded-lg bg-orange-500/15 dark:bg-orange-500/10">
                      <svg className="w-5 h-5 text-orange-700 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-foreground font-semibold">Today's Schedule</span>
                  </CardTitle>
                  <CardDescription className="text-foreground/70 dark:text-foreground/60">
                    {format(new Date(), "EEEE, MMMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] overflow-y-auto scrollbar-thin relative z-10 bg-background/30">
                  <TodaysSchedule />
                </CardContent>
              </Card>

              {/* Recent/Upcoming Card */}
              <Card className="border border-blue-500/10 bg-gradient-to-br from-blue-500/4 via-blue-400/2 to-cyan-500/4 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/3 rounded-full -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/3 rounded-full -ml-16 -mb-16" />
                <CardHeader className="relative z-10 bg-background/40 backdrop-blur-sm rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <div className="p-2 rounded-lg bg-blue-500/15 dark:bg-blue-500/10">
                      <svg className="w-5 h-5 text-blue-700 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-foreground font-semibold">Recent Activity</span>
                  </CardTitle>
                  <CardDescription className="text-foreground/70 dark:text-foreground/60">
                    Latest projects and resources
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 bg-background/30">
                  <RecentUpcoming />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
