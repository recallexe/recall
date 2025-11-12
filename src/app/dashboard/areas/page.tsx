"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import AddNewCard from "@/components/area/AddNewCard";
import AreaCard from "@/components/area/AreaCard";
import AreaDetailView from "@/components/area/AreaDetailView";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Loader2 } from "lucide-react";

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

export default function Areas() {
  const searchParams = useSearchParams();
  const areaId = searchParams.get("area");
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAreas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const responseJson = await tauriInvoke<string>("get_areas", {
        token,
      });
      const areasData = JSON.parse(responseJson);
      setAreas(areasData);
    } catch (err: unknown) {
      console.error("Error fetching areas:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch areas";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAreaById = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const responseJson = await tauriInvoke<string>("get_area_by_id", {
        token,
        id,
      });
      const areaData = JSON.parse(responseJson);
      setSelectedArea(areaData);
    } catch (err: unknown) {
      console.error("Error fetching area:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch area";
      setError(errorMessage);
    }
  }, []);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  useEffect(() => {
    if (areaId) {
      fetchAreaById(areaId);
    } else {
      setSelectedArea(null);
    }
  }, [areaId, fetchAreaById]);

  // Listen for URL changes (for static export compatibility)
  useEffect(() => {
    const handleLocationChange = () => {
      const params = new URLSearchParams(window.location.search);
      const newAreaId = params.get("area");
      if (newAreaId !== areaId) {
        if (newAreaId) {
          fetchAreaById(newAreaId);
        } else {
          setSelectedArea(null);
        }
      }
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, [areaId, fetchAreaById]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error && !selectedArea) {
    return (
      <div className="p-4">
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  // Show area detail view if areaId is in query params
  if (selectedArea && areaId) {
    return <AreaDetailView area={selectedArea} />;
  }

  // Show areas list view
  return (
    <main className="mx-4 mb-4">
      <Breadcrumb>
        <BreadcrumbList className="text-2xl">
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <BreadcrumbLink href="/dashboard/areas">Areas</BreadcrumbLink>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <section>
        <div className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {areas.map((area) => (
              <AreaCard
                key={area.id}
                id={area.id}
                title={area.name}
                image={area.image_url}
                href={`/dashboard/areas?area=${area.id}`}
                onUpdate={fetchAreas}
              />
            ))}
            <AddNewCard onSuccess={fetchAreas} />
          </div>
        </div>
      </section>
    </main>
  );
}
