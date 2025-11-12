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
// Commented out unused imports for unimplemented features
// import { TodayOverview } from "@/app/lib/data";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import TodayOverviewList from "@/components/dashboard/TodaysOverview";
// import RecentUpcoming from "@/components/dashboard/RecentUpcoming";
// import { Chart } from "@/components/dashboard/AppChart";
// import TodaysSchedule from "@/components/dashboard/Today'sSchedule";

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
export default function Dashboard() {
  const [areasCount, setAreasCount] = useState<number>(0);
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [resourcesCount, setResourcesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Fetch areas count
      try {
        const areasJson = await tauriInvoke<string>("get_areas", { token });
        const areasData = JSON.parse(areasJson);
        setAreasCount(Array.isArray(areasData) ? areasData.length : 0);
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
      change: "", // Remove "this week" text
    },
    projects: {
      ...stats.projects,
      value: loading ? stats.projects.value : projectsCount,
      change: "", // Remove "this week" text
    },
    // tasks: stats.tasks, // Not implemented
    // events: stats.events, // Not implemented
    // notes: stats.notes, // Not implemented
    resources: {
      ...stats.resources,
      value: loading ? stats.resources.value : resourcesCount,
      change: "", // Remove "this week" text
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
            {/* Grid of stat cards showing counts for Areas, Projects, Tasks, etc. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
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

            {/* Commented out unimplemented features */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Today's Overview Card */}
            {/* <Card>
                <CardHeader>
                  <CardTitle>Today's Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 h-75 overflow-y-auto scrollbar-thin">
                  {/* Today's Overview Items List */}
            {/* {TodayOverview.map((item) => (
                    <TodayOverviewList
                      key={`${item.area}-${item.type}-${item.deadline}`}
                      message={item.message}
                      area={item.area}
                      type={item.type}
                      deadline={item.deadline}
                      priorty={item.priorty}
                      url={item.url}
                    />
                  ))}
                </CardContent>
              </Card> */}

            {/* Recent/Upcoming Card */}
            {/* <Card>
                <CardHeader>
                  <CardTitle>Recent/Upcomming</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentUpcoming />
                </CardContent>
              </Card> */}

            {/* Weekly Performance Chart Card */}
            {/* <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Weekly Performance</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-end min-h-[200px] pb-0">
                  <Chart />
                </CardContent>
              </Card> */}

            {/* Today's Schedule Card */}
            {/* <Card>
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>Thursday, Septermber 18</CardDescription>
                </CardHeader>
                <CardContent className="h-75 overflow-y-auto scrollbar-thin">
                  <TodaysSchedule />
                </CardContent>
              </Card>
            </div> */}
          </div>
        </section>
      </main>
    </>
  );
}
