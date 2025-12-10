"use client";
import * as React from "react";
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
import { Loader2 } from "lucide-react";

async function tauriInvoke<T = any>(cmd: string, args?: any): Promise<T> {
    try {
        const { invoke } = await import("@tauri-apps/api/core");
        return await invoke(cmd, args);
    } catch (err) {
        console.error(`Error invoking ${cmd}:`, err);
        throw err;
    }
}

interface NewAreaDialogProps {
    trigger?: React.ReactNode;
    onSuccess?: () => void;
    area?: {
        id: string;
        name: string;
        image_url?: string | null;
    } | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function NewAreaDialog({ trigger, onSuccess, area, open: controlledOpen, onOpenChange: controlledOnOpenChange }: NewAreaDialogProps) {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = controlledOnOpenChange || setInternalOpen;
    const [name, setName] = React.useState(area?.name || "");
    const [imageUrl, setImageUrl] = React.useState(area?.image_url || "");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [fetchingImage, setFetchingImage] = React.useState(false);

    // Function to fetch image from free API based on area name
    const fetchImageForArea = React.useCallback(async (areaName: string): Promise<string | null> => {
        try {
            setFetchingImage(true);
            // Use Picsum Photos with a seed based on area name hash
            // This provides consistent images for the same area name without API keys
            const keywords = areaName.toLowerCase().trim();

            // Create a simple hash from the area name for consistent seeding
            let hash = 0;
            for (let i = 0; i < keywords.length; i++) {
                const char = keywords.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            const seed = Math.abs(hash);

            // Use Picsum Photos with seed for consistent images
            // Format: https://picsum.photos/seed/{seed}/400/400
            const imageUrl = `https://picsum.photos/seed/${seed}/400/400`;

            return imageUrl;
        } catch (err) {
            console.error("Error fetching image:", err);
            return null;
        } finally {
            setFetchingImage(false);
        }
    }, []);

    React.useEffect(() => {
        if (open) {
            setName(area?.name || "");
            setImageUrl(area?.image_url || "");
            setError(null);
        }
    }, [open, area]);

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

            // Auto-fetch image if none provided (for both new and existing areas)
            let finalImageUrl = imageUrl.trim() || null;
            if (!finalImageUrl && name.trim()) {
                const fetchedImage = await fetchImageForArea(name.trim());
                if (fetchedImage) {
                    finalImageUrl = fetchedImage;
                    setImageUrl(fetchedImage);
                }
            }

            const request = {
                name: name.trim(),
                image_url: finalImageUrl,
            };

            if (area) {
                // Update existing area
                const responseJson = await tauriInvoke<string>("update_area", {
                    token,
                    id: area.id,
                    json: JSON.stringify(request),
                });
                const response = JSON.parse(responseJson);
                if (!response.success) {
                    setError(response.message || "Failed to update area");
                    return;
                }
            } else {
                // Create new area
                const responseJson = await tauriInvoke<string>("create_area", {
                    token,
                    json: JSON.stringify(request),
                });
                const response = JSON.parse(responseJson);
                if (!response.success) {
                    setError(response.message || "Failed to create area");
                    return;
                }
            }

            setOpen(false);
            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            console.error("Error saving area:", err);
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{area ? "Edit Area" : "Add New Area"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter area name"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="image_url">
                                Image URL (optional)
                                {name.trim() && !imageUrl && (
                                    <span className="text-xs text-muted-foreground ml-2 font-normal">
                                        Will auto-fetch if left empty
                                    </span>
                                )}
                            </Label>
                            <Input
                                id="image_url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="/personal.png or leave empty to auto-fetch"
                                disabled={loading || fetchingImage}
                            />
                            {fetchingImage && (
                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Generating image...
                                </p>
                            )}
                        </div>

                        {error && (
                            <div className="text-sm text-destructive">{error}</div>
                        )}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={loading}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {area ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

