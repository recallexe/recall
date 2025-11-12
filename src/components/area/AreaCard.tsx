"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Folder, Loader2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { NewAreaDialog } from "./NewAreaDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { cn } from "@/lib/utils";

async function tauriInvoke<T = any>(cmd: string, args?: any): Promise<T> {
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke(cmd, args);
  } catch (err) {
    console.error(`Error invoking ${cmd}:`, err);
    throw err;
  }
}

interface AreaCardProps {
  id: string;
  title: string;
  image?: string | null;
  href: string;
  onUpdate?: () => void;
}

const AreaCard = ({ id, title, image, href, onUpdate }: AreaCardProps) => {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // For static export, use router.replace to update URL without full reload
    router.replace(href);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.error("Not authenticated");
        return;
      }

      const responseJson = await tauriInvoke<string>("delete_area", {
        token,
        id,
      });
      const response = JSON.parse(responseJson);
      if (response.success) {
        setShowDeleteDialog(false);
        if (onUpdate) {
          onUpdate();
        }
      } else {
        console.error("Failed to delete area:", response.message);
      }
    } catch (err) {
      console.error("Error deleting area:", err);
    } finally {
      setDeleting(false);
    }
  };

  // Use gradient fallback if no image provided
  const hasImage = image && image.trim() !== "";

  return (
    <>
      <Card className="group relative overflow-hidden hover:shadow-md transition h-full flex flex-col">
        <a href={href} onClick={handleClick} className="flex-1 flex flex-col cursor-pointer">
          <CardContent
            className={cn(
              "relative p-0 m-0 w-full flex-1 min-h-[120px] overflow-hidden",
              hasImage
                ? "bg-cover bg-center"
                : "bg-muted"
            )}
            style={
              hasImage
                ? {
                  backgroundImage: `url(${image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
                : undefined
            }
          >
            {/* Menu button - only visible on hover */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-background/95 backdrop-blur-sm text-foreground hover:bg-background shadow-sm border border-border"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48"
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowEditDialog(true);
                    }}
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>

          <CardFooter className="p-4 bg-background border-t">
            <div className="flex items-center gap-3 w-full">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary">
                <Folder className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base truncate">
                  {title}
                </p>
              </div>
            </div>
          </CardFooter>
        </a>
      </Card>

      <NewAreaDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        area={showEditDialog ? { id, name: title, image_url: image } : null}
        onSuccess={() => {
          setShowEditDialog(false);
          if (onUpdate) {
            onUpdate();
          }
        }}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Area</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AreaCard;
