"use client";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NewResourceDialog } from "@/components/resources/NewResourceDialog";
import { ResourceCard } from "@/components/resources/ResourceCard";
import ResourceEditor from "./editor/page";

async function tauriInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke<T>(cmd, args);
  } catch (err) {
    console.error(`Error invoking ${cmd}:`, err);
    throw err;
  }
}

interface Resource {
  id: string;
  project_id: string;
  project_name?: string | null;
  name: string;
  content?: string | null;
  file_type?: string | null;
  file_size?: number | null;
  created_at: number;
  updated_at: number;
}

export default function Resources() {
  const searchParams = useSearchParams();
  const resourceId = searchParams.get("resource");
  const [resources, setResources] = React.useState<Resource[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchResources = React.useCallback(async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const responseJson = await tauriInvoke<string>("get_resources", {
        token,
        project_id: null,
      });
      try {
        // Handle empty or null responses
        if (!responseJson) {
          setResources([]);
          setError(null);
          return;
        }
        // Check if it's already an array (parsed by Tauri)
        if (Array.isArray(responseJson)) {
          setResources(responseJson);
          setError(null);
          return;
        }
        // If it's a string, parse it
        if (typeof responseJson === "string") {
          if (responseJson.trim() === "") {
            setResources([]);
            setError(null);
            return;
          }
          const resourcesData = JSON.parse(responseJson);
          setResources(resourcesData);
          setError(null);
        } else {
          // If it's already an object/array, use it directly
          setResources(responseJson as Resource[]);
          setError(null);
        }
      } catch (err) {
        console.error("Error parsing resources:", err);
        setError("Failed to parse resources data");
        setResources([]);
      }
    } catch (err) {
      console.error("Error fetching resources:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch resources");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // If resource ID is provided, show editor
  if (resourceId) {
    return <ResourceEditor />;
  }

  if (loading) {
    return (
      <main className="mx-4 mb-4">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Resources</h1>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-4 mb-4">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Resources</h1>
          <NewResourceDialog
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Resource
              </Button>
            }
            onSuccess={fetchResources}
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        {resources.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No resources yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first resource to get started.
              </p>
              <NewResourceDialog
                trigger={
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Resource
                  </Button>
                }
                onSuccess={fetchResources}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onUpdate={fetchResources}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
