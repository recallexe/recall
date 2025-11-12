"use client";

import { useEffect, useState } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Lock, Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
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

// Helper to safely invoke Tauri commands
async function tauriInvoke<T = any>(cmd: string, args?: any): Promise<T> {
    try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<T>(cmd, args);
    } catch (err) {
        console.error(`Tauri invoke error for ${cmd}:`, err);
        throw err;
    }
}

export default function AccountPage() {
    const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Password change state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("auth_token");
            if (!token) return;

            try {
                const responseJson = await tauriInvoke<string>("validate_token", {
                    token: token,
                });
                const userInfo = responseJson && responseJson !== "null" ? JSON.parse(responseJson) : null;

                if (userInfo && userInfo.id) {
                    setUser(userInfo);
                    setName(userInfo.name);
                    setEmail(userInfo.email);
                }
            } catch (err) {
                console.error("Error fetching user:", err);
                setError("Failed to load account information");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleSaveClick = () => {
        // Validation
        if (!name.trim()) {
            setError("Name is required");
            return;
        }

        if (!email.trim()) {
            setError("Email is required");
            return;
        }

        // Basic email validation
        if (!email.includes('@') || !email.includes('.')) {
            setError("Invalid email format");
            return;
        }

        // Check if anything changed
        if (name.trim() === user?.name && email.trim() === user?.email) {
            setError("No changes to save");
            return;
        }

        // Show confirmation dialog
        setShowConfirmDialog(true);
    };

    const handleSave = async () => {
        setShowConfirmDialog(false);
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                setError("Not authenticated");
                setSaving(false);
                return;
            }

            const responseJson = await tauriInvoke<string>("update_user", {
                token: token,
                json: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                }),
            });

            const response = JSON.parse(responseJson) as {
                success: boolean;
                message: string | null;
                user: { id: string; email: string; name: string } | null;
            };

            if (response.success && response.user) {
                setUser(response.user);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(response.message || "Failed to update account");
            }
        } catch (err) {
            console.error("Update user error:", err);
            setError(err instanceof Error ? err.message : "Failed to update account");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        setChangingPassword(true);
        setPasswordError(null);
        setPasswordSuccess(false);

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("All fields are required");
            setChangingPassword(false);
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError("New password must be at least 8 characters");
            setChangingPassword(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match");
            setChangingPassword(false);
            return;
        }

        try {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                setPasswordError("Not authenticated");
                setChangingPassword(false);
                return;
            }

            const responseJson = await tauriInvoke<string>("change_password_with_token", {
                token: token,
                json: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                }),
            });

            const response = JSON.parse(responseJson) as {
                success: boolean;
                message: string | null;
            };

            if (response.success) {
                setPasswordSuccess(true);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setTimeout(() => setPasswordSuccess(false), 3000);
            } else {
                setPasswordError(response.message || "Failed to change password");
            }
        } catch (err) {
            console.error("Password change error:", err);
            setPasswordError(err instanceof Error ? err.message : "Failed to change password");
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <main className="mx-4 mb-4">
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <div className="text-muted-foreground">Loading account information...</div>
                    </div>
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="mx-4 mb-4">
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                        <div className="text-destructive font-medium">Failed to load account information</div>
                    </div>
                </div>
            </main>
        );
    }

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
                            <BreadcrumbLink href="/dashboard/account">Account</BreadcrumbLink>
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <section className="mt-6 space-y-6">
                {/* Account Information Card */}
                <Card className="border-2 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Account Information</CardTitle>
                                <CardDescription className="mt-1">
                                    Manage your account details and personal information
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center gap-2 p-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/50 rounded-md border border-green-200 dark:border-green-800">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Account updated successfully</span>
                            </div>
                        )}

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="h-10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@example.com"
                                    className="h-10"
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setName(user.name);
                                    setEmail(user.email);
                                    setError(null);
                                    setSuccess(false);
                                }}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSaveClick} disabled={saving} className="min-w-[120px]">
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Password Change Card */}
                <Card className="border-2 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <Lock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Change Password</CardTitle>
                                <CardDescription className="mt-1">
                                    Update your password to keep your account secure
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {passwordError && (
                            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                                <AlertCircle className="h-4 w-4" />
                                <span>{passwordError}</span>
                            </div>
                        )}
                        {passwordSuccess && (
                            <div className="flex items-center gap-2 p-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/50 rounded-md border border-green-200 dark:border-green-800">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Password changed successfully</span>
                            </div>
                        )}

                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="current-password" className="text-sm font-medium">
                                    Current Password
                                </Label>
                                <Input
                                    id="current-password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter your current password"
                                    className="h-10"
                                />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="new-password" className="text-sm font-medium">
                                        New Password
                                    </Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter your new password"
                                        className="h-10"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Must be at least 8 characters
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password" className="text-sm font-medium">
                                        Confirm New Password
                                    </Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm your new password"
                                        className="h-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setCurrentPassword("");
                                    setNewPassword("");
                                    setConfirmPassword("");
                                    setPasswordError(null);
                                    setPasswordSuccess(false);
                                }}
                                disabled={changingPassword}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleChangePassword}
                                disabled={changingPassword}
                                className="min-w-[140px]"
                            >
                                {changingPassword ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Changing...
                                    </>
                                ) : (
                                    "Change Password"
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            Confirm Account Update
                        </AlertDialogTitle>
                        <AlertDialogDescription className="pt-2">
                            Updating your account information may log you out permanently. Are you sure you want to continue? Make sure the email is correct.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSave} className="bg-primary text-primary-foreground">
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    );
}

