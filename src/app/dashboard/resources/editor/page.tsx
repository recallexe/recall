"use client";
import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    EditorProvider,
    EditorFloatingMenu,
    EditorBubbleMenu,
    EditorFormatBold,
    EditorFormatItalic,
    EditorFormatStrike,
    EditorFormatCode,
    EditorNodeHeading1,
    EditorNodeHeading2,
    EditorNodeHeading3,
    EditorNodeBulletList,
    EditorNodeOrderedList,
    EditorNodeQuote,
    EditorNodeCode,
    EditorSelector,
    EditorNodeText,
    EditorNodeTaskList,
    EditorClearFormatting,
    EditorLinkSelector,
    type JSONContent,
} from "@/components/ui/shadcn-io/editor";
import { EditorContent, useCurrentEditor } from "@tiptap/react";

function EditorContentWrapper({ className }: { className?: string }) {
    const { editor } = useCurrentEditor();
    if (!editor) return null;
    return <EditorContent editor={editor} className={className} />;
}

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

export default function ResourceEditor() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const resourceId = searchParams.get("resource");

    const [resource, setResource] = React.useState<Resource | null>(null);
    const [content, setContent] = React.useState<JSONContent | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchResource = async () => {
            if (!resourceId) {
                setError("No resource ID provided");
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    setError("Not authenticated");
                    setLoading(false);
                    return;
                }

                const responseJson = await tauriInvoke<string>("get_resource_by_id", {
                    token,
                    id: resourceId,
                });

                let resourceData: Resource;
                try {
                    if (typeof responseJson === "string") {
                        resourceData = JSON.parse(responseJson);
                    } else {
                        resourceData = responseJson as Resource;
                    }
                } catch (err) {
                    console.error("Error parsing resource:", err);
                    setError("Failed to parse resource data");
                    setLoading(false);
                    return;
                }

                setResource(resourceData);

                if (resourceData.content) {
                    try {
                        const parsed = JSON.parse(resourceData.content);
                        setContent(parsed);
                    } catch {
                        setContent(null);
                    }
                }
            } catch (err) {
                console.error("Error fetching resource:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch resource");
            } finally {
                setLoading(false);
            }
        };

        fetchResource();
    }, [resourceId]);

    const handleSave = async () => {
        if (!resource) return;

        setSaving(true);
        setError(null);

        try {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                setError("Not authenticated");
                return;
            }

            const contentJson = content ? JSON.stringify(content) : null;

            const request = {
                name: resource.name,
                content: contentJson,
                file_data: null,
                file_type: null,
                file_size: null,
            };

            const responseJson = await tauriInvoke<string>("update_resource", {
                token,
                id: resource.id,
                json: JSON.stringify(request),
            });

            try {
                const response = JSON.parse(responseJson);
                if (!response.success) {
                    setError(response.message || "Failed to save resource");
                    return;
                }
                // Update local resource state
                if (response.resource) {
                    setResource(response.resource);
                }
            } catch (err) {
                console.error("Error parsing response:", err);
                setError("Failed to save resource");
                return;
            }
        } catch (err) {
            console.error("Error saving resource:", err);
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="mx-4 mb-4">
                <section>
                    <p className="text-muted-foreground">Loading...</p>
                </section>
            </main>
        );
    }

    if (error && !resource) {
        return (
            <main className="mx-4 mb-4">
                <section>
                    <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
                        {error}
                    </div>
                    <Button onClick={() => router.push("/dashboard/resources")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Resources
                    </Button>
                </section>
            </main>
        );
    }

    if (!resource) {
        return null;
    }

    return (
        <main className="mx-4 mb-4">
            <section>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/dashboard/resources")}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">{resource.name}</h1>
                            {resource.project_name && (
                                <p className="text-sm text-muted-foreground">
                                    Project: {resource.project_name}
                                </p>
                            )}
                        </div>
                    </div>
                    <Button onClick={handleSave} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? "Saving..." : "Save"}
                    </Button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
                        {error}
                    </div>
                )}

                <div className="border rounded-lg bg-background shadow-sm relative overflow-hidden">
                    <EditorProvider
                        className="w-full"
                        content={content || undefined}
                        onUpdate={({ editor }) => {
                            setContent(editor.getJSON());
                        }}
                        placeholder="Start typing..."
                    >
                        <EditorFloatingMenu>
                            <EditorNodeHeading1 hideName />
                            <EditorNodeBulletList hideName />
                            <EditorNodeQuote hideName />
                            <EditorNodeCode hideName />
                        </EditorFloatingMenu>
                        <EditorBubbleMenu
                            shouldShow={({ state, editor }) => {
                                const { selection } = state;
                                const { empty } = selection;

                                // Keep menu visible if there's a selection
                                if (!empty) {
                                    return true;
                                }

                                // Also show if editor has focus and there's content
                                if (editor.isFocused && editor.state.doc.textContent.length > 0) {
                                    return true;
                                }

                                return false;
                            }}
                        >
                            <EditorSelector title="Text">
                                <EditorNodeText />
                                <EditorNodeHeading1 />
                                <EditorNodeHeading2 />
                                <EditorNodeHeading3 />
                                <EditorNodeBulletList />
                                <EditorNodeOrderedList />
                                <EditorNodeTaskList />
                                <EditorNodeQuote />
                                <EditorNodeCode />
                            </EditorSelector>
                            <EditorSelector title="Format">
                                <EditorFormatBold />
                                <EditorFormatItalic />
                                <EditorFormatStrike />
                                <EditorFormatCode />
                            </EditorSelector>
                            <EditorLinkSelector />
                            <EditorClearFormatting />
                        </EditorBubbleMenu>
                        <div className="min-h-[calc(100vh-300px)] font-mono text-sm">
                            <div className="px-8 py-6">
                                <EditorContentWrapper className="focus:outline-none [&_.ProseMirror]:min-h-[500px] [&_.ProseMirror]:leading-normal [&_.ProseMirror]:font-mono [&_.ProseMirror]:text-sm [&_.ProseMirror]:outline-none [&_.ProseMirror]:bg-transparent [&_.ProseMirror]:m-0 [&_.ProseMirror]:p-0 [&_.ProseMirror]:font-normal" />
                            </div>
                        </div>
                    </EditorProvider>
                </div>
            </section>
        </main>
    );
}

