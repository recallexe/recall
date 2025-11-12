"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, ArrowLeft, Box, Loader2, Plus } from "lucide-react";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";

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

interface Project {
    id: string;
    area_id: string;
    area_name?: string | null;
    title: string;
    description?: string | null;
    status: string;
    priority?: string | null;
    start_date?: number | null;
    end_date?: number | null;
    created_at: number;
    updated_at: number;
}


interface AreaDetailViewProps {
    area: Area;
}

function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(" ");
}

export default function AreaDetailView({ area }: AreaDetailViewProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [projectResourceCounts, setProjectResourceCounts] = useState<Record<string, number>>({});

    const fetchProjects = useCallback(async () => {
        setLoadingProjects(true);
        setError(null);
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                setError("Not authenticated");
                return;
            }

            const responseJson = await tauriInvoke<string>("get_projects", {
                token,
                area_id: area.id,
            });
            const projectsData = JSON.parse(responseJson);
            setProjects(projectsData);
        } catch (err: unknown) {
            console.error("Error fetching projects:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch projects";
            setError(errorMessage);
        } finally {
            setLoadingProjects(false);
        }
    }, [area.id]);

    const fetchResourceCounts = useCallback(async (projectIds: string[]) => {
        if (projectIds.length === 0) {
            setProjectResourceCounts({});
            return;
        }

        const token = localStorage.getItem("auth_token");
        if (!token) return;

        const counts: Record<string, number> = {};

        try {
            // Fetch all resources for all projects in this area
            for (const projectId of projectIds) {
                try {
                    const responseJson = await tauriInvoke<string>("get_resources", {
                        token,
                        project_id: projectId,
                    });
                    let resourcesData: unknown[] = [];
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
                    counts[projectId] = resourcesData.length;
                } catch (err) {
                    console.error(`Error fetching resources for project ${projectId}:`, err);
                    counts[projectId] = 0;
                }
            }
            setProjectResourceCounts(counts);
        } catch (err) {
            console.error("Error fetching resource counts:", err);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    useEffect(() => {
        if (projects.length > 0) {
            const projectIds = projects.map((p) => p.id);
            fetchResourceCounts(projectIds);
        }
    }, [projects, fetchResourceCounts]);

    const hasImage = area.image_url && area.image_url.trim() !== "";
    const createdDate = new Date(area.created_at * 1000);
    const updatedDate = new Date(area.updated_at * 1000);

    const formatDateTime = (date: Date) => {
        const dateStr = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        const timeStr = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
        return { date: dateStr, time: timeStr };
    };

    const created = formatDateTime(createdDate);
    const updated = formatDateTime(updatedDate);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Inbox":
                return "bg-red-200 text-red-900";
            case "Planned":
                return "bg-blue-200 text-blue-900";
            case "Progress":
                return "bg-yellow-200 text-yellow-900";
            case "Done":
                return "bg-green-200 text-green-900";
            default:
                return "bg-gray-200 text-gray-900";
        }
    };

    const getPriorityColor = (priority: string | null) => {
        switch (priority) {
            case "High":
                return "bg-red-300 text-red-800";
            case "Medium":
                return "bg-yellow-200 text-yellow-800";
            case "Low":
                return "bg-green-200 text-green-800";
            default:
                return "bg-gray-200 text-gray-800";
        }
    };

    return (
        <main className="mx-4 mb-4">
            <Breadcrumb>
                <BreadcrumbList className="text-2xl">
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard/areas">Areas</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{area.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <section>
                <div className="mt-4 flex flex-col gap-4">
                    {/* Header Section */}
                    <Card className="hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-top-2">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-primary/10 transition-colors duration-200">
                                        <Folder className="h-7 w-7 text-primary" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold">{area.name}</h1>
                                        <p className="text-sm text-muted-foreground">Area Overview</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {hasImage && (
                                        <div className="hidden sm:block">
                                            <div
                                                className="h-16 w-16 rounded-lg bg-cover bg-center border border-border shadow-sm transition-transform duration-200 hover:scale-105"
                                                style={{
                                                    backgroundImage: `url(${area.image_url})`,
                                                }}
                                            />
                                        </div>
                                    )}
                                    <Button asChild variant="outline" size="sm" className="transition-all duration-200">
                                        <Link href="/dashboard/areas">
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="flex flex-col gap-4 p-4 hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-2">
                                <Box className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Projects</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <h2 className="text-3xl text-primary mb-[-5px]">{projects.length}</h2>
                                <p className="text-sm text-muted-foreground">Active</p>
                            </div>
                        </Card>
                        <Card className="flex flex-col gap-4 p-4 hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: "50ms" }}>
                            <div className="flex items-center gap-2">
                                <Folder className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Tasks</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <h2 className="text-3xl text-primary mb-[-5px]">0</h2>
                                <p className="text-sm text-muted-foreground">Pending</p>
                            </div>
                        </Card>
                        <Card className="flex flex-col gap-4 p-4 hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: "100ms" }}>
                            <div className="flex items-center gap-2">
                                <Folder className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Notes</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <h2 className="text-3xl text-primary mb-[-5px]">0</h2>
                                <p className="text-sm text-muted-foreground">Total</p>
                            </div>
                        </Card>
                        <Card className="flex flex-col gap-4 p-4 hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: "150ms" }}>
                            <div className="flex items-center gap-2">
                                <Folder className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Created</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-sm font-semibold">{created.date.split(",")[0]}</p>
                                    <p className="text-xs text-muted-foreground">{created.time}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Details Card */}
                    <Card className="hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-left-2">
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Created
                                    </p>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold">{created.date}</p>
                                        <p className="text-xs text-muted-foreground">{created.time}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Last Updated
                                    </p>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold">{updated.date}</p>
                                        <p className="text-xs text-muted-foreground">{updated.time}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Projects Section */}
                    <Card className="hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Projects</CardTitle>
                                <NewProjectDialog
                                    trigger={
                                        <Button size="sm" variant="outline">
                                            <Plus className="mr-2 h-4 w-4" />
                                            New Project
                                        </Button>
                                    }
                                    defaultAreaId={area.id}
                                    onSuccess={fetchProjects}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loadingProjects ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <p className="text-destructive mb-2">Error loading projects</p>
                                    <p className="text-sm text-muted-foreground">{error}</p>
                                </div>
                            ) : projects.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="rounded-full bg-muted p-4 mb-4">
                                        <Box className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground text-lg font-medium mb-1">
                                        No projects yet
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Projects for this area will appear here
                                    </p>
                                    <NewProjectDialog
                                        trigger={
                                            <Button size="sm">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create First Project
                                            </Button>
                                        }
                                        defaultAreaId={area.id}
                                        onSuccess={fetchProjects}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {projects.map((project, index) => (
                                        <Card
                                            key={project.id}
                                            className="hover:shadow-md transition-all duration-200 cursor-pointer animate-in fade-in slide-in-from-right-2"
                                            style={{ animationDelay: `${index * 30}ms` }}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <Box className="h-4 w-4 text-primary shrink-0" />
                                                            <h3 className="font-semibold text-base">{project.title}</h3>
                                                        </div>
                                                        {project.description && (
                                                            <p className="text-sm text-muted-foreground ml-6 line-clamp-2">
                                                                {project.description}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-2 ml-6 flex-wrap">
                                                            <div className={cn("px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors duration-200", getStatusColor(project.status))}>
                                                                {project.status === "Progress" ? "In progress" : project.status}
                                                            </div>
                                                            {project.priority && (
                                                                <div className={cn("px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors duration-200", getPriorityColor(project.priority))}>
                                                                    {project.priority}
                                                                </div>
                                                            )}
                                                            {projectResourceCounts[project.id] !== undefined && projectResourceCounts[project.id] > 0 && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    {projectResourceCounts[project.id]} resource{projectResourceCounts[project.id] !== 1 ? "s" : ""}
                                                                </div>
                                                            )}
                                                            {(project.start_date || project.end_date) && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    {project.start_date && (
                                                                        <span>{new Date(project.start_date * 1000).toLocaleDateString()}</span>
                                                                    )}
                                                                    {project.start_date && project.end_date && " → "}
                                                                    {project.end_date && (
                                                                        <span>{new Date(project.end_date * 1000).toLocaleDateString()}</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button asChild variant="ghost" size="sm" className="shrink-0 transition-all duration-200">
                                                        <Link href="/dashboard/projects">View</Link>
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </section>
        </main>
    );
}

