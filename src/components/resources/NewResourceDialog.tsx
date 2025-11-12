"use client";
import * as React from "react";
import { Loader2, FileText, Upload } from "lucide-react";
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
import {
    NativeSelect,
    NativeSelectOption,
} from "@/components/ui/native-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dropzone,
    DropzoneContent,
    DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { useRouter } from "next/navigation";

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

interface NewResourceDialogProps {
    trigger?: React.ReactNode;
    defaultProjectId?: string;
    onSuccess?: () => void;
    resource?: {
        id: string;
        project_id: string;
        name: string;
        content?: string | null;
    } | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function NewResourceDialog({
    trigger,
    defaultProjectId,
    onSuccess,
    resource,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: NewResourceDialogProps) {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = controlledOnOpenChange || setInternalOpen;
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [name, setName] = React.useState(resource?.name || "");
    const [projectId, setProjectId] = React.useState(
        resource?.project_id || defaultProjectId || ""
    );
    const [resourceType, setResourceType] = React.useState<"file" | "text">("text");
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const router = useRouter();
    const hasInitializedProjectId = React.useRef(false);

    React.useEffect(() => {
        const fetchProjects = async () => {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) return;

                const responseJson = await tauriInvoke<string>("get_projects", {
                    token,
                    area_id: null,
                });
                let projectsData: Project[] = [];
                try {
                    projectsData = JSON.parse(responseJson);
                    setProjects(projectsData);
                } catch (err) {
                    console.error("Error parsing projects:", err);
                    setProjects([]);
                }
                if (projectsData.length > 0 && !resource && !hasInitializedProjectId.current) {
                    const initialProjectId = defaultProjectId || projectsData[0].id;
                    setProjectId(initialProjectId);
                    hasInitializedProjectId.current = true;
                }
            } catch (err) {
                console.error("Error fetching projects:", err);
            }
        };

        if (open) {
            fetchProjects();
            if (resource) {
                setName(resource.name);
                setProjectId(resource.project_id);
                hasInitializedProjectId.current = true;
            } else {
                setName("");
                setProjectId(defaultProjectId || "");
                setResourceType("text");
                setSelectedFile(null);
                hasInitializedProjectId.current = false;
            }
            setError(null);
        } else {
            hasInitializedProjectId.current = false;
        }
    }, [open, resource, defaultProjectId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                setError("Not authenticated");
                return;
            }

            if (!projectId) {
                setError("Please select a project");
                return;
            }

            if (!name.trim()) {
                setError("Please enter a name");
                return;
            }

            let contentJson: string | null = null;
            let fileDataBase64: string | null = null;
            let fileType: string | null = null;
            let fileSize: number | null = null;

            if (resourceType === "text") {
                // For text resources, create with empty content - user will edit in the editor page
                contentJson = null;
            } else if (selectedFile) {
                // Validate file size (5MB max)
                if (selectedFile.size > 5 * 1024 * 1024) {
                    setError("File size exceeds maximum of 5MB");
                    setLoading(false);
                    return;
                }
                // Convert file to base64
                const reader = new FileReader();
                fileDataBase64 = await new Promise<string>((resolve, reject) => {
                    reader.onload = () => {
                        const result = reader.result as string;
                        // Remove data URL prefix (e.g., "data:image/png;base64,")
                        const base64 = result.split(",")[1] || result;
                        resolve(base64);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(selectedFile);
                });
                fileType = selectedFile.type || selectedFile.name.split(".").pop() || null;
                fileSize = selectedFile.size;
            } else if (resourceType === "file") {
                setError("Please select a file to upload");
                setLoading(false);
                return;
            }

            const request = {
                project_id: projectId,
                name: name.trim(),
                content: contentJson,
                file_data: fileDataBase64,
                file_type: fileType,
                file_size: fileSize,
            };

            if (resource) {
                // Update existing resource
                const responseJson = await tauriInvoke<string>("update_resource", {
                    token,
                    id: resource.id,
                    json: JSON.stringify(request),
                });
                try {
                    const response = JSON.parse(responseJson);
                    if (!response.success) {
                        setError(response.message || "Failed to update resource");
                        return;
                    }
                } catch (err) {
                    console.error("Error parsing response:", err);
                    setError("Failed to update resource");
                    return;
                }
            } else {
                // Create new resource
                const responseJson = await tauriInvoke<string>("create_resource", {
                    token,
                    json: JSON.stringify(request),
                });
                try {
                    const response = JSON.parse(responseJson);
                    if (!response.success) {
                        setError(response.message || "Failed to create resource");
                        return;
                    }
                    // If text editor, redirect to editor page
                    if (resourceType === "text" && response.resource?.id) {
                        setOpen(false);
                        router.push(`/dashboard/resources?resource=${response.resource.id}`);
                        if (onSuccess) {
                            onSuccess();
                        }
                        return;
                    }
                } catch (err) {
                    console.error("Error parsing response:", err);
                    setError("Failed to create resource");
                    return;
                }
            }

            setOpen(false);
            if (onSuccess) {
                onSuccess();
            }
        } catch (err: unknown) {
            console.error("Error saving resource:", err);
            const errorMessage = err instanceof Error ? err.message : "An error occurred";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{resource ? "Edit Resource" : "Create New Resource"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Resource name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="project">Project</Label>
                        <NativeSelect
                            id="project"
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            required
                        >
                            <NativeSelectOption value="">Select a project</NativeSelectOption>
                            {projects.map((project) => (
                                <NativeSelectOption key={project.id} value={project.id}>
                                    {project.title}
                                </NativeSelectOption>
                            ))}
                        </NativeSelect>
                    </div>

                    {!resource && (
                        <div className="space-y-2">
                            <Label>Resource Type</Label>
                            <Tabs value={resourceType} onValueChange={(v) => setResourceType(v as "file" | "text")}>
                                <TabsList>
                                    <TabsTrigger value="text">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Text Editor
                                    </TabsTrigger>
                                    <TabsTrigger value="file">
                                        <Upload className="mr-2 h-4 w-4" />
                                        File Upload
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="text" className="mt-4">
                                    <div className="border rounded-md p-4 bg-muted/30">
                                        <p className="text-sm text-muted-foreground">
                                            Create a text document. You'll be redirected to the full editor page to start writing.
                                        </p>
                                    </div>
                                </TabsContent>
                                <TabsContent value="file" className="mt-4">
                                    <Dropzone
                                        maxSize={5 * 1024 * 1024} // 5MB
                                        maxFiles={1}
                                        onDrop={(acceptedFiles) => {
                                            if (acceptedFiles.length > 0) {
                                                setSelectedFile(acceptedFiles[0]);
                                                if (!name.trim()) {
                                                    setName(acceptedFiles[0].name);
                                                }
                                            }
                                        }}
                                        src={selectedFile ? [selectedFile] : undefined}
                                    >
                                        <DropzoneEmptyState />
                                        <DropzoneContent>
                                            <div className="flex flex-col items-center gap-2">
                                                <p className="font-medium text-sm">{selectedFile?.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(selectedFile?.size || 0) / 1024} KB
                                                </p>
                                            </div>
                                        </DropzoneContent>
                                    </Dropzone>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Upload a file (max 5MB). Files are stored as base64.
                                    </p>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                    {resource?.content && (
                        <div className="space-y-2">
                            <Label>Content</Label>
                            <p className="text-sm text-muted-foreground">
                                This resource has content. Edit it in the full editor page.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={loading}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {resource ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

