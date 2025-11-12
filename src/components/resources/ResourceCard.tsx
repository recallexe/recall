"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, MoreVertical, Trash2, Edit, ExternalLink, Download, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { NewResourceDialog } from "./NewResourceDialog";
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

interface Resource {
    id: string;
    project_id: string;
    project_name?: string | null;
    name: string;
    content?: string | null;
    file_data?: string | null;
    file_type?: string | null;
    file_size?: number | null;
    created_at: number;
    updated_at: number;
}

interface ResourceCardProps {
    resource: Resource;
    onUpdate?: () => void;
}

export function ResourceCard({ resource, onUpdate }: ResourceCardProps) {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
    const [showEditDialog, setShowEditDialog] = React.useState(false);
    const [showViewDialog, setShowViewDialog] = React.useState(false);
    const [viewData, setViewData] = React.useState<{
        fileData: string;
        fileType: string;
        fileName: string;
    } | null>(null);
    const [loadingView, setLoadingView] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);

    const handleOpenEditor = () => {
        router.push(`/dashboard/resources?resource=${resource.id}`);
    };

    const handleDownload = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                console.error("Not authenticated");
                return;
            }

            // Download file using Rust command (rfd handles the dialog)
            await tauriInvoke<string>("download_resource_file", {
                token,
                id: resource.id,
            });
        } catch (err) {
            // User might have cancelled, which is fine
            if (err instanceof Error && err.message.includes("cancelled")) {
                return;
            }
            console.error("Error downloading resource:", err);
        }
    };

    const isFileResource = resource.file_data !== null && resource.file_data !== undefined;

    const isViewableFile = isFileResource && resource.file_type && (
        resource.file_type.startsWith("image/") ||
        resource.file_type === "application/pdf" ||
        resource.file_type.startsWith("text/") ||
        resource.file_type === "application/json"
    );

    const handleView = async () => {
        setLoadingView(true);
        setShowViewDialog(true);
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                console.error("Not authenticated");
                setShowViewDialog(false);
                return;
            }

            // Fetch full resource data including file_data
            const responseJson = await tauriInvoke<string>("get_resource_by_id", {
                token,
                id: resource.id,
            });
            const resourceData = JSON.parse(responseJson);

            if (!resourceData.file_data || !resourceData.file_type) {
                console.error("No file data available");
                setShowViewDialog(false);
                return;
            }

            setViewData({
                fileData: resourceData.file_data,
                fileType: resourceData.file_type,
                fileName: resourceData.name,
            });
        } catch (err) {
            console.error("Error viewing resource:", err);
            setShowViewDialog(false);
        } finally {
            setLoadingView(false);
        }
    };

    const renderViewContent = () => {
        if (!viewData) return null;

        const { fileData, fileType } = viewData;

        if (fileType.startsWith("image/")) {
            // Display image
            const dataUrl = `data:${fileType};base64,${fileData}`;
            return (
                <div className="flex items-center justify-center max-h-[70vh] overflow-auto p-4">
                    <object
                        data={dataUrl}
                        type={fileType}
                        aria-label={viewData.fileName}
                        className="max-w-full max-h-[70vh] object-contain"
                    >
                        <div className="p-4 text-muted-foreground">
                            Image preview not available
                        </div>
                    </object>
                </div>
            );
        } else if (fileType === "application/pdf") {
            // Display PDF in iframe
            const dataUrl = `data:${fileType};base64,${fileData}`;
            return (
                <div className="w-full h-[70vh]">
                    <iframe
                        src={dataUrl}
                        className="w-full h-full border rounded"
                        title={viewData.fileName}
                    />
                </div>
            );
        } else if (fileType.startsWith("text/") || fileType === "application/json") {
            // Display text content
            try {
                const decoded = atob(fileData);
                return (
                    <div className="max-h-[70vh] overflow-auto">
                        <pre className="p-4 bg-muted rounded-md text-sm font-mono whitespace-pre-wrap wrap-break-word">
                            {decoded}
                        </pre>
                    </div>
                );
            } catch {
                return (
                    <div className="p-4 text-destructive">
                        Failed to decode text content
                    </div>
                );
            }
        }

        return (
            <div className="p-4 text-muted-foreground">
                Preview not available for this file type
            </div>
        );
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                console.error("Not authenticated");
                return;
            }

            await tauriInvoke<string>("delete_resource", {
                token,
                id: resource.id,
            });

            setShowDeleteDialog(false);
            if (onUpdate) {
                onUpdate();
            }
        } catch (err) {
            console.error("Error deleting resource:", err);
        } finally {
            setDeleting(false);
        }
    };

    const preview = resource.content
        ? (() => {
            if (!resource.content || resource.content.trim() === "") return null;
            try {
                const json = JSON.parse(resource.content);
                // Extract text from TipTap JSON
                const extractText = (node: unknown): string => {
                    if (typeof node !== "object" || node === null) return "";
                    if (Array.isArray(node)) {
                        return node.map(extractText).join(" ");
                    }
                    const obj = node as Record<string, unknown>;
                    if (obj.type === "text" && typeof obj.text === "string") {
                        return obj.text;
                    }
                    if (Array.isArray(obj.content)) {
                        return obj.content.map(extractText).join(" ");
                    }
                    return "";
                };
                const text = extractText(json);
                return text.length > 150 ? `${text.substring(0, 150)}...` : text;
            } catch {
                // If parsing fails, try to show as plain text if it's not too long
                if (typeof resource.content === "string" && resource.content.length > 0) {
                    return resource.content.length > 150
                        ? `${resource.content.substring(0, 150)}...`
                        : resource.content;
                }
                return null;
            }
        })()
        : null;

    return (
        <>
            <Card className="hover:shadow-md transition">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                            <div className="mt-1">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <CardTitle className="text-base">
                                    {resource.content ? (
                                        <button
                                            type="button"
                                            onClick={handleOpenEditor}
                                            className="hover:underline cursor-pointer text-left"
                                        >
                                            {resource.name}
                                        </button>
                                    ) : (
                                        resource.name
                                    )}
                                </CardTitle>
                                {resource.project_name && (
                                    <CardDescription className="mt-1">
                                        Project: {resource.project_name}
                                    </CardDescription>
                                )}
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button type="button" className="p-1 hover:bg-muted rounded-md">
                                    <MoreVertical className="h-4 w-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {resource.content && (
                                    <DropdownMenuItem onClick={handleOpenEditor}>
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Open in Editor
                                    </DropdownMenuItem>
                                )}
                                {isViewableFile && (
                                    <DropdownMenuItem onClick={handleView}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                    </DropdownMenuItem>
                                )}
                                {isFileResource && (
                                    <DropdownMenuItem onClick={handleDownload}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent>
                    {preview && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                            {preview}
                        </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                            {resource.file_size
                                ? `${(resource.file_size / 1024).toFixed(1)} KB`
                                : "Text document"}
                        </span>
                        <span>
                            Updated {format(new Date(resource.updated_at * 1000), "MMM d, yyyy")}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <NewResourceDialog
                resource={{
                    id: resource.id,
                    project_id: resource.project_id,
                    name: resource.name,
                    content: resource.content,
                }}
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                onSuccess={() => {
                    setShowEditDialog(false);
                    if (onUpdate) {
                        onUpdate();
                    }
                }}
            />

            <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{viewData?.fileName || resource.name}</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto">
                        {loadingView ? (
                            <div className="flex items-center justify-center py-12">
                                <p className="text-muted-foreground">Loading...</p>
                            </div>
                        ) : (
                            renderViewContent()
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{resource.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

