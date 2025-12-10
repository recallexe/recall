"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Box, Database } from "lucide-react";
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

interface Project {
  id: string;
  title: string;
  updated_at: number;
  end_date?: number | null;
}

interface Resource {
  id: string;
  name: string;
  updated_at: number;
}

type TabData = {
  title: string;
  icon: React.ReactNode;
  date: string;
  url: string;
};

export default function RecentUpcoming() {
  const [activeTab, setActiveTab] = useState<"Projects" | "Resources">("Projects");
  const [projects, setProjects] = useState<TabData[]>([]);
  const [resources, setResources] = useState<TabData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const responseJson = await tauriInvoke<string>("get_projects", {
        token,
        area_id: null,
      });
      const projectsData = JSON.parse(responseJson) as Project[];

      const formattedProjects: TabData[] = projectsData
        .sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0))
        .slice(0, 5)
        .map((project) => ({
          title: project.title,
          icon: <Box size={17} />,
          date: project.end_date
            ? `Due ${format(new Date(project.end_date * 1000), "MMM d, yyyy")}`
            : `Updated ${format(new Date(project.updated_at * 1000), "MMM d, yyyy")}`,
          url: "/dashboard/projects",
        }));

      setProjects(formattedProjects);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setProjects([]);
    }
  }, []);

  const fetchResources = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const responseJson = await tauriInvoke<string>("get_resources", {
        token,
        project_id: null,
      });
      let resourcesData: Resource[] = [];
      if (typeof responseJson === "string") {
        if (responseJson.trim() === "") {
          resourcesData = [];
        } else {
          const parsed = JSON.parse(responseJson);
          resourcesData = Array.isArray(parsed) ? parsed : [];
        }
      } else if (Array.isArray(responseJson)) {
        resourcesData = responseJson;
      } else {
        resourcesData = [];
      }

      const formattedResources: TabData[] = resourcesData
        .sort((a, b) => b.updated_at - a.updated_at)
        .slice(0, 5)
        .map((resource) => ({
          title: resource.name,
          icon: <Database size={17} />,
          date: `Updated ${format(new Date(resource.updated_at * 1000), "MMM d, yyyy")}`,
          url: "/dashboard/resources",
        }));

      setResources(formattedResources);
    } catch (err) {
      console.error("Error fetching resources:", err);
      setResources([]);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchProjects(), fetchResources()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchProjects, fetchResources]);

  const tabs: Array<"Projects" | "Resources"> = ["Projects", "Resources"];
  const currentData = activeTab === "Projects" ? projects : resources;

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 px-2 items-center border-2 rounded-full text-sm">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`cursor-pointer px-4 py-1.5 rounded-full transition-colors ${activeTab === tab
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted hover:text-foreground/80"
              }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="h-[248px] overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : currentData.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">No {activeTab.toLowerCase()} found</p>
          </div>
        ) : (
          currentData.map((item, index) => (
            <div
              key={`${activeTab}-${item.title}-${item.date}`}
              className="flex justify-between py-3 px-3 rounded-lg border border-transparent hover:border-blue-500/15 hover:bg-blue-500/5 dark:hover:bg-blue-500/3 bg-background/40 backdrop-blur-sm transition-all duration-200 group"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <Link href={item.url} className="flex items-center gap-3 hover:underline flex-1 min-w-0">
                <div className="p-1.5 rounded-md bg-background/80 dark:bg-background/60 group-hover:bg-blue-500/15 dark:group-hover:bg-blue-500/8 transition-colors">
                  {item.icon}
                </div>
                <span className="text-sm font-medium truncate text-foreground">{item.title}</span>
              </Link>
              <span className="text-foreground/70 dark:text-foreground/60 text-xs whitespace-nowrap ml-2 font-medium">{item.date}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
