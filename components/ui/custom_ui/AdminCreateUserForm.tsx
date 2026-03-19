"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Loader2, LockKeyhole, Mail, User } from "lucide-react";
import { toast } from "sonner";
import CInput from "@/components/ui/custom_ui/CInput";
import { useAuth } from "@/hook/useAuth";
import { useRouter } from "next/navigation";

const createUserSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    username: z.string().min(1, "Username is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["admin", "doctor", "front_desk", "user"]),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

type AdminCreateUserFormProps = {
    onSuccess?: () => void;
};

export function AdminCreateUserForm({ onSuccess }: AdminCreateUserFormProps)
{
    const { signup } = useAuth();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            username: "",
            password: "",
            role: "front_desk",
        },
    });

    const onSubmit = async (values: CreateUserFormValues) =>
    {
        setIsSaving(true);

        try
        {
            const result = await signup(
                values.username,
                values.password,
                values.first_name,
                values.last_name,
                values.role
            );

            if (!result.success)
            {
                toast.error(result.error ?? "Failed to create account");
                return;
            }

            toast.success("Staff account created successfully");
            form.reset({
                first_name: "",
                last_name: "",
                username: "",
                password: "",
                role: "front_desk",
            });

            onSuccess?.();
            router.refresh();
        }
        catch (error)
        {
            console.error("[ADMIN_CREATE_USER_ERROR]", error);
            toast.error("Unexpected error while creating account");
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
                    className="w-full"
                />

                <CInput
                    control={form.control}
                    name="last_name"
                    label="Last Name"
                    placeholder="Enter last name"
                    type="text"
                    icon={User}
                    disabled={isSaving}
                    className="w-full"
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
                className="w-full"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CInput
                    control={form.control}
                    name="password"
                    label="Password"
                    placeholder="Enter password"
                    type="password"
                    icon={LockKeyhole}
                    disabled={isSaving}
                    className="w-full"
                />

                <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Role
                    </label>
                    <select
                        id="role"
                        className="w-full h-10 rounded-md border border-black/12 dark:border-white/12 bg-white/70 dark:bg-slate-900/50 px-3 text-sm"
                        disabled={isSaving}
                        {...form.register("role")}
                    >
                        <option value="front_desk">Front Desk</option>
                        <option value="doctor">Doctor</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                    </select>
                </div>
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
                            Creating account...
                        </>
                    ) : (
                        "Create account"
                    )}
                </Button>
            </div>
        </form>
    );
}