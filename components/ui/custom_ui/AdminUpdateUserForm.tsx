"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, User } from "lucide-react";
import { toast } from "sonner";
import CInput from "@/components/ui/custom_ui/CInput";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AdminUserRow } from "@/components/table/admin-users/columns";

const updateUserSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    username: z.string().min(1, "Username is required"),
    role: z.enum(["admin", "doctor", "front_desk", "user"]),
});

type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

type AdminUpdateUserFormProps = {
    user: AdminUserRow;
    onSuccess?: () => void;
};

export function AdminUpdateUserForm({ user, onSuccess }: AdminUpdateUserFormProps)
{
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<UpdateUserFormValues>({
        resolver: zodResolver(updateUserSchema),
        defaultValues: {
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            role: user.role as UpdateUserFormValues["role"],
        },
    });

    const onSubmit = async (values: UpdateUserFormValues) =>
    {
        setIsSaving(true);

        try
        {
            const response = await fetch(`/api/users/${user.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            const data = await response.json();
            if (!response.ok)
            {
                toast.error(data.error ?? "Failed to update user");
                return;
            }

            toast.success("User updated successfully");
            onSuccess?.();
            router.refresh();
        }
        catch (error)
        {
            console.error("[ADMIN_UPDATE_USER_ERROR]", error);
            toast.error("Unexpected error while updating user");
        }
        finally
        {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CInput
                    control={form.control}
                    name="first_name"
                    label="First Name"
                    placeholder="Enter first name"
                    type="text"
                    icon={User}
                    disabled={isSaving}
                    className="w-full bg-white/50 focus-within:bg-white"
                />

                <CInput
                    control={form.control}
                    name="last_name"
                    label="Last Name"
                    placeholder="Enter last name"
                    type="text"
                    icon={User}
                    disabled={isSaving}
                    className="w-full bg-white/50 focus-within:bg-white"
                />
            </div>

            <CInput
                control={form.control}
                name="username"
                label="Username"
                placeholder="Enter username"
                type="text"
                icon={Mail}
                disabled={isSaving}
                className="w-full bg-white/50 focus-within:bg-white"
            />

            <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Role
                </label>
                <select
                    id="role"
                    className="w-full h-10 rounded-md border border-black/12 dark:border-white/12 bg-white/50 focus-within:bg-white dark:bg-slate-900/50 px-3 text-sm"
                    disabled={isSaving}
                    {...form.register("role")}
                >
                    <option value="front_desk">Front Desk</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                </select>
            </div>

            <div className="pt-1 flex items-center justify-end">
                <Button
                    type="submit"
                    disabled={isSaving}
                    className="min-w-42.5 bg-linear-to-br from-blue-800 to-indigo-500 hover:from-blue-700 hover:to-indigo-400 text-white"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating user...
                        </>
                    ) : (
                        "Update user"
                    )}
                </Button>
            </div>
        </form>
    );
}